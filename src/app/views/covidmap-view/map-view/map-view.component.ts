import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  EventEmitter,
  Output,
} from "@angular/core";

import esri = __esri;
import Map from "esri/Map";
import MapView from "esri/views/MapView";
import FeatureLayer from "esri/layers/FeatureLayer";
import Graphic from "esri/Graphic";
import Search from "esri/widgets/Search";
import Locate from "esri/widgets/Locate";
import Locator from "esri/tasks/Locator";
import LabelClass from "esri/layers/support/LabelClass";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import { ToolTipInfo } from "../../../models/custom-types";
import { createContinuousRenderer } from "esri/smartMapping/renderers/color";
import * as colorSchemes from "esri/smartMapping/symbology/color";
import Color from "esri/Color";
import { Subscription } from "rxjs";
import { AppStateService } from '../../../shared/app-state.service';


/**
 * To do:
 * ideas...
 * - add button to toggle display of areas with restrictions
 * - click to produce good looking pop-up based on attribute data and customise the styling.
 * - think about how to make table more interactive... e.g filter by extent! - perfect idea...
 * - add msoa regional data.
 * - refactor for a really clean code structure.
 * - filter based on extent using a radio button.
 * - integrate with an external api using the PHE api.
 */
@Component({
  selector: "app-mapview",
  templateUrl: "./map-view.component.html",
  styleUrls: ["./map-view.component.scss"],
})
export class MapViewComponent implements OnInit, OnDestroy {
  //Tooltip eventEmitters
  @Output() showTooltip = new EventEmitter<ToolTipInfo>();
  @Output() hideTooltip = new EventEmitter<void>();

  // The <div> where we will place the map
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  /**Subscriptions */
  panRequestSubscription: Subscription;
  restrictionsLayerShowSubscription: Subscription;

  //Property Watchers
  currentMapExtentHandle: esri.WatchHandle;

  /**State */
  private _map: Map = null;
  private _view: MapView = null;
  private _casesfeatlayer: FeatureLayer = null;
  private _caseslayerview: esri.FeatureLayerView = null;
  private _restrictionsfeatlayer: FeatureLayer = null;
  private _restrictionslayerview: esri.FeatureLayerView = null;
  private _selectedMSOA: esri.Graphic = null;
  private _currentlyHighlighted: {
    highlightGraphic: esri.Graphic;
    handle: esri.Handle;
  };

  //Inject mapService
  constructor(public mapService: AppStateService) { }

  //Initialise Esri Map
  async initializeMap() {
    //configure the feature layer:



    const casesLabelClass = new LabelClass({
      labelExpressionInfo: { expression: `$feature.${this.mapService.dataServiceFields.CovidCases}` },
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "black",
        haloSize: 1,
        haloColor: "white"
      } as esri.SymbolProperties
    });

    const mapcaseslayerproperties = {
      url: this.mapService.dataServiceUrl,
      outFields: ["*"],
      opacity: 0.7,
      title: "Covid_Layer",
      // labelingInfo: casesLabelClass
    };

    const maprestrictionsFill = new SimpleFillSymbol();

    const maprestrictionslayerproperties: any = {
      url: this.mapService.dataRestrictionsServiceUrl,
      opacity: 1,
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: "red",
          style: "backward-diagonal",
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [0, 0, 0, 0.5],
            width: "0.5px",
          },
        },
      },
    };

    this._casesfeatlayer = new FeatureLayer(mapcaseslayerproperties);
    this._restrictionsfeatlayer = new FeatureLayer(
      maprestrictionslayerproperties
    );

    // Configure the Map
    const mapProperties = {
      basemap: this.mapService.mapBasemap,
    };

    this._map = new Map(mapProperties);

    // Initialize the MapView
    const mapViewProperties = {
      container: this.mapViewEl.nativeElement,
      center: this.mapService.mapCentre,
      zoom: this.mapService.mapZoomLevel,
      map: this._map,
      highlightOptions: {
        color: "orange", //set highlight colour for hover.
      },
    };

    this._view = new MapView(mapViewProperties);

    const sources = [
      {
        locator: new Locator({
          url:
            "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
        }),
        singleLineFieldName: "SingleLine",
        outFields: ["Addr_type"],
        // name: "Identified Addresses:",
        placeholder: "Find Address or Place",
        defaultZoomScale: 50000,
        zoomScale: 50000,
        popupEnabled: false,
      },
    ];

    const searchWidget = new Search({
      view: this._view,
      allPlaceholder: "Find Address or Place",
      includeDefaultSources: false,
      sources: sources,
    });

    const locateBtn = new Locate({ view: this._view });

    // wait for the map to load
    await this._view.when();
    //Create search widget:
    await this._view.ui.add(searchWidget, {
      position: "top-right",
    });
    await this._view.ui.add(locateBtn, {
      position: "top-left",
    });
    //Generate Renderer for dataService
    await this.generateRenderer();
    //Add feature layer.
    await this._map.add(this._casesfeatlayer);

    if (this.mapService.showRestrictionAreas) {
      await this._map.add(this._restrictionsfeatlayer);
      this._restrictionslayerview = await this._view.whenLayerView(
        this._restrictionsfeatlayer
      );
    }

    this._caseslayerview = await this._view.whenLayerView(this._casesfeatlayer);







    // let graphicsToDisplay = this.mapService._tableData.map((element) => {

    //   let cimmarkerSymbol = {
    //     type: "cim", // autocasts as new SimpleMarkerSymbol()
    //     data: {
    //       type: "CIMSymbolReference",
    //       symbol: this.getPointSymbolData(element.cases)
    //     }

    //   };

    //   return new Graphic({
    //     geometry: (element.MSOAGeometry as esri.Polygon).centroid as esri.GeometryProperties,
    //     symbol: cimmarkerSymbol as esri.SymbolProperties
    //   })

    // })
    // await this._view.graphics.addMany(graphicsToDisplay)

    //initialise property watchers:
    this.currentMapExtentHandle = this._view.watch(
      "extent",
      this.debounce(
        (newValue: esri.Extent) => { if (newValue) { this.mapService.mapCurrentExtent = newValue } }
        ,
        100
      )
    );

    // initialise user events.
    this._view.on("pointer-move", this.debounce(this.hoverHandler, 5));

    //future work...
    // this._view.on("click", this.clickHandler);
    return this._view;
  }

  ngOnInit(): void {
    // Initialize MapView and return an instance of MapView
    this.initializeMap().then((mapView) => {
      // The map has been initialized
      console.log("mapView ready: ", mapView.ready);
      this.mapService.mapLoaded = mapView.ready;
    });

    //Set up Subscription to panrequests.
    this.panRequestSubscription = this.mapService.panRequest$.subscribe(
      (panTarget) => {
        this.panMap(panTarget);
      }
    );

    this.restrictionsLayerShowSubscription = this.mapService.showRestrictionAreas$.subscribe(
      async (show) => {
        if (show) {
          await this._map.add(this._restrictionsfeatlayer);
          this._restrictionslayerview = await this._view.whenLayerView(
            this._restrictionsfeatlayer
          );
        } else {
          await this._map.remove(this._restrictionsfeatlayer);
        }
      }
    );
  }

  ngOnDestroy() {
    //Destroy view and record current map state.
    if (this._view) {
      this.mapService.mapCentre = [
        this._view.center.longitude,
        this._view.center.latitude,
      ];
      this.mapService.mapZoomLevel = this._view.zoom;
      this._view.container = null;
    }
    this.mapService.mapLoaded = false;
  }

  /********Utility Functions for Map Interaction. *********/

  /**Utility function for handling hitTests on map
   * @param event
   * @param featurelayer
   *
   * returns intersecting graphics and the screenpoint.
   */
  async hitTester(
    event: esri.MapViewPointerMoveEvent | esri.MapViewClickEvent,
    featurelayer: esri.FeatureLayer
  ): Promise<{ graphic: esri.Graphic; screenPoint: esri.ScreenPoint }> {
    let response: esri.HitTestResult = await this._view.hitTest(event, {
      include: featurelayer,
    });
    if (!response.results.length) {
      return;
    }
    return {
      graphic: response.results[0].graphic,
      screenPoint: response.screenPoint,
    };
  }

  /**debounce events to ratelimit function calls. */
  debounce(callback, wait) {
    let timeout;
    return (...args) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => callback.apply(context, args), wait);
    };
  }

  clickHandler: esri.MapViewClickEventHandler = async (
    event: esri.MapViewClickEvent
  ) => {
    let hit = await this.hitTester(event, this._casesfeatlayer);
    if (this._selectedMSOA != hit.graphic) {
      this._view.graphics.removeAll();
      this._view.graphics.add(hit.graphic);
      this._selectedMSOA = hit.graphic;
      // await this.createRenderer(this._casesfeatlayer, this._selectedMSOA.getAttribute("msoa11_hclnm"), 25, "test");
    }
    return;
  };

  hoverHandler: esri.MapViewPointerMoveEventHandler = async (
    event: esri.MapViewPointerMoveEvent
  ) => {
    let hit = await this.hitTester(event, this._casesfeatlayer);

    if (!hit) {
      if (this._currentlyHighlighted) {
        this._currentlyHighlighted.handle.remove();
        this._currentlyHighlighted = null;
        this.hideTooltip.emit();
      }

      return;
    }

    let MSOAName: string = hit.graphic.getAttribute(
      this.mapService.dataServiceFields.MSOAname
    );
    let numcases: number = hit.graphic.getAttribute(
      this.mapService.dataServiceFields.CovidCases
    );
    let casestring: string = numcases ? ` Cases: ${numcases}` : "";

    this.showTooltip.emit({
      screenPoint: hit.screenPoint,
      text: MSOAName + casestring,
    });
    // this._tooltip.show(hit.screenPoint, countryName);

    if (
      this._currentlyHighlighted &&
      this._currentlyHighlighted.highlightGraphic.attributes.OBJECTID !==
      hit.graphic.attributes.OBJECTID
    ) {
      this._currentlyHighlighted.handle.remove();
      this._currentlyHighlighted = null;
    }

    if (this._currentlyHighlighted) {
      return;
    }

    this._currentlyHighlighted = {
      highlightGraphic: hit.graphic,
      handle: this._caseslayerview.highlight(hit.graphic),
    };
  };

  async generateRenderer() {
    // configure parameters for the color renderer generator
    // the layer must be specified along with a field name.

    let colorScheme: esri.ColorScheme = await colorSchemes.getSchemeByName({
      name: "red 6",
      geometryType: "polygon",
      theme: "high-to-low",
    });
    console.log(colorScheme);
    colorScheme.noDataColor = new Color("rgba(255, 247, 236, 0.5)");

    const colorParams: esri.colorCreateContinuousRendererParams = {
      layer: this._casesfeatlayer,
      field: this.mapService.dataServiceFields.CovidCases,
      view: this._view,
      theme: "high-to-low",
      colorScheme: colorScheme,
      outlineOptimizationEnabled: true,
      defaultSymbolEnabled: true,
    };

    const rendererResult = await createContinuousRenderer(colorParams);

    this._casesfeatlayer.renderer = rendererResult.renderer;
  }

  panMap(coordinates) {
    this._view.goTo(
      { target: coordinates, zoom: 10 },
      { duration: 1000, easing: "ease-in" }
    );
  }


  getPointSymbolData(value) {
    return {
      type: "CIMPointSymbol",
      symbolLayers: [
        {
          type: "CIMVectorMarker",
          enable: true,
          size: 32,
          colorLocked: true,
          anchorPointUnits: "Relative",
          frame: { xmin: -5, ymin: -5, xmax: 5, ymax: 5 },
          markerGraphics: [
            {
              type: "CIMMarkerGraphic",
              geometry: { x: 0, y: 0 },
              symbol: {
                type: "CIMTextSymbol",
                fontFamilyName: "Arial",
                fontStyleName: "Bold",
                height: 4,
                horizontalAlignment: "Center",
                offsetX: 0,
                offsetY: 3,
                symbol: {
                  type: "CIMPolygonSymbol",
                  symbolLayers: [
                    {
                      type: "CIMSolidFill",
                      enable: true,
                      color: [255, 255, 255, 255],
                    },
                  ],
                },
                verticalAlignment: "Center",
              },
              textString: String(value)
            },
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true,
        },
        {
          type: "CIMVectorMarker",
          enable: true,
          anchorPoint: { x: 0, y: 0 },
          anchorPointUnits: "Relative",
          size: 32,
          frame: { xmin: 0.0, ymin: 0.0, xmax: 39.7, ymax: 42.0 },
          markerGraphics: [
            {
              type: "CIMMarkerGraphic",
              geometry: {
                rings: [
                  [
                    [19.85, 20],
                    [14.85, 25],
                    [24.85, 25],
                    [19.85, 20],
                  ],
                ],
              },
              symbol: {
                type: "CIMPolygonSymbol",
                symbolLayers: [
                  {
                    type: "CIMSolidFill",
                    enable: true,
                    color: [39, 129, 153, 255],
                  },
                ],
              },
            },
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true,
        },
        {
          type: "CIMVectorMarker",
          enable: true,
          anchorPoint: { x: 0, y: 0 },
          anchorPointUnits: "Relative",
          size: 32,
          frame: {
            xmin: 0.0,
            ymin: 0.0,
            xmax: 39.7,
            ymax: 42,
          },
          markerGraphics: [
            {
              type: "CIMMarkerGraphic",
              geometry: {
                rings: [
                  [
                    [32.2, 25],
                    [7.4, 25],
                    [6, 25.2],
                    [4.6, 25.6],
                    [3.3, 26.4],
                    [2.2, 27.5],
                    [1.2, 28.8],
                    [0.6, 30.2],
                    [0.1, 31.8],
                    [0, 33.5],
                    [0.1, 35.2],
                    [0.6, 36.8],
                    [1.2, 38.2],
                    [2.2, 39.5],
                    [3.3, 40.6],
                    [4.6, 41.4],
                    [6, 41.8],
                    [7.4, 42],
                    [32.2, 42],
                    [33.7, 41.8],
                    [35.1, 41.4],
                    [36.4, 40.6],
                    [37.5, 39.5],
                    [38.4, 38.2],
                    [39.1, 36.7],
                    [39.6, 35.2],
                    [39.7, 33.5],
                    [39.6, 31.8],
                    [39.1, 30.3],
                    [38.4, 28.8],
                    [37.5, 27.5],
                    [36.4, 26.4],
                    [35.1, 25.6],
                    [33.7, 25.2],
                    [32.2, 25],
                  ],
                ],
              },
              symbol: {
                type: "CIMPolygonSymbol",
                symbolLayers: [
                  {
                    type: "CIMSolidFill",
                    enable: true,
                    color: [170, 70, 50, 255],
                  },
                ],
              },
            },
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true,
        },
      ],
    };
  }

}
