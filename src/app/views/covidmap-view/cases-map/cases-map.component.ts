import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  EventEmitter,
  Output,
  NgZone
} from "@angular/core";

import esri = __esri;
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import Search from "@arcgis/core/widgets/Search";
import Locate from "@arcgis/core/widgets/Locate";
import Locator from "@arcgis/core/tasks/Locator";
import Legend from "@arcgis/core/widgets/Legend";
import Expand from "@arcgis/core/widgets/Expand";
import { whenFalseOnce } from "@arcgis/core/core/watchUtils"
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { ToolTipInfo } from "../../../models/custom-types";
import { createContinuousRenderer } from "@arcgis/core/smartMapping/renderers/color";
import { getSchemeByName } from "@arcgis/core/smartMapping/symbology/color";
import Color from "@arcgis/core/Color";
import { Subscription } from "rxjs";
import { AppStateService } from "../../../shared/app-state.service";
import { Extent } from "@arcgis/core/geometry";


/**
 * To do:
 * ideas...
 * - click to produce good looking pop-up based on attribute data and customise the styling.
 * - filter based on extent using a radio button.
 * - integrate with an external api using the PHE api.
 *
 *
 * - new rendering pathway... (switch fields to display instead of geometry refresh...)
 * - take csv... then change so that each week has its data counts...
 */
@Component({
  selector: "app-map",
  templateUrl: "./cases-map.component.html",
  styleUrls: ["./cases-map.component.scss"],
})
export class CasesMapComponent implements OnInit, OnDestroy {

  //Tooltip eventEmitters
  @Output() showTooltip = new EventEmitter<ToolTipInfo>();
  @Output() hideTooltip = new EventEmitter<void>();

  // The <div> where we will place the map
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  /**Subscriptions */
  panRequestSubscription: Subscription;
  coviddateSubscription: Subscription;

  //Property Watchers
  currentMapExtentHandle: esri.WatchHandle;

  /**State */
  private _map: Map = null;
  private _view: MapView = null;
  private _MSOAcasesFeatLayer: FeatureLayer = null;
  private _caseslayerview: esri.FeatureLayerView = null;
  private _isMobile;
  private _selectedMSOA: esri.Graphic = null;
  private _currentlyHighlighted: {
    highlightGraphic: esri.Graphic;
    handle: esri.Handle;
  };
  private _continuousColorCasesRenderer: esri.renderersClassBreaksRenderer

  //Inject appStateService
  constructor(public appStateService: AppStateService, private zone: NgZone) { }

  //Initialise Esri Map
  async initializeMap() {

    // Define Map properties
    const mapProperties = {
      basemap: this.appStateService.mapBasemap,
    };

    // Create Map
    this._map = new Map(mapProperties);

    // Define mapView Properties
    const mapViewProperties = {
      container: this.mapViewEl.nativeElement,
      center: this.appStateService.mapCentre,
      zoom: this.appStateService.mapZoomLevel,
      map: this._map,
      highlightOptions: {
        color: "orange", //set highlight colour for hover.
      },
    };

    //initialise mapView
    this._view = new MapView(mapViewProperties);
    this._view.popup.autoOpenEnabled = false
    const searchWidget = this.initialiseSearchWidget()
    const locateBtn = new Locate({ view: this._view });
    const legendExpand = new Expand({
      view: this._view,
      content: new Legend({
        view: this._view
      })
    })

    // wait for the map to load and then add ui widgets
    await this._view.when();
    this._view.ui.add(searchWidget, {
      position: "top-right",
    });
    this._view.ui.add(locateBtn, {
      position: "top-left",
    });
    this._view.ui.add(legendExpand, { position: "top-left" })

    // initialise the MSOACases Layer - aync due to generating of renderer.
    this.initialiseMSOACasesLayer()

    //Add MSOA Cases feature layer.
    this._map.add(this._MSOAcasesFeatLayer);

    this._caseslayerview = await this._view.whenLayerView(this._MSOAcasesFeatLayer);

    //create caseColorRenderer
    const casesColorRenderer = await this.generateMSOACasesRenderer();
    this._MSOAcasesFeatLayer.renderer = casesColorRenderer
    whenFalseOnce(this._caseslayerview, "updating", () => {
      //Hack to work around strange node modules bug... Set the layer to visible once the renderer has been
      //generated.
      this._MSOAcasesFeatLayer.opacity = 0.7
    })

    // CIM Symbol Experiment - Ignore unless interested
    // let graphicsToDisplay = this.appStateService._tableData.map((element) => {

    //   let cimmarkerSymbol = {
    //     type: "cim", // autocasts as new SimpleMarkerSymbol()
    //     data: {
    //       type: "CIMSymbolReference",
    //       symbol: this.getCIMPointSymbolData(element.cases)
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
      this.debounce((newValue: esri.Extent) => {
        if (newValue) {
          this.appStateService.mapCurrentExtent = newValue;
        }
      }, 100)
    );

    // if not on mobile device enable hover tooltips interactions.
    if (!this._isMobile) {
      // initialise user events.
      this._view.on("pointer-move", this.debounce(this.hoverHandler, 5));
    }
    //future work...
    this._view.on("click", this.clickHandler);
    return this._view;
  }

  ngOnInit(): void {
    this._isMobile = this.appStateService.deviceInfo.isMobile


    this.zone.runOutsideAngular(() => {
      // Initialize MapView and return an instance of MapView
      this.initializeMap().then((mapView) => {
        // The map has been initialized
        this.zone.run(() => {
          this.appStateService.mapLoaded = mapView.ready;
          console.log('mapView ready: ');
        })
      });
    })

    //Set up Subscription to panrequests.
    this.panRequestSubscription = this.appStateService.panRequest$.subscribe(
      (panTarget) => {
        this.panMap(panTarget);
      }
    );


    this.coviddateSubscription = this.appStateService.dateset$.subscribe(async (setdate) => {
      await this._view.whenLayerView(this._MSOAcasesFeatLayer)


      let updatedRenderer = this._continuousColorCasesRenderer.clone()
      updatedRenderer.field = this.appStateService.dataServiceFields.CovidCases

      updatedRenderer.visualVariables = updatedRenderer.visualVariables.map((element) => {
        element.field = this.appStateService.dataServiceFields.CovidCases
        return element
      })

      this._MSOAcasesFeatLayer.renderer = updatedRenderer
      this.setLabelConfig(this._MSOAcasesFeatLayer)


      //Hide tooltip because data has changed underneath it.
      this.hideTooltip.emit()

    })
  }

  ngOnDestroy() {
    //Destroy view and record current map state.
    if (this._view) {
      this.appStateService.mapCentre = [
        this._view.center.longitude,
        this._view.center.latitude,
      ];
      this.appStateService.mapZoomLevel = this._view.zoom;
      this._view.container = null;
    }
    this.appStateService.mapLoaded = false;
  }


  /********Initialise Feature Layers *********/

  async initialiseMSOACasesLayer() {
    //configure the mapcases feature layer properties:
    let mapcaseslayerproperties: any = {
      url: this.appStateService.dataServiceUrl,
      outFields: ["*"],
      opacity: 0, //hack 0 opacity for node modules color renderer bug
      title: "Covid_Layer",
      popupEnabled: false,
    }


    this._MSOAcasesFeatLayer = new FeatureLayer(mapcaseslayerproperties);
    this.setLabelConfig(this._MSOAcasesFeatLayer)

  }


  /**Set the feature layer label settings if in mobile mode. */
  setLabelConfig(layer: esri.FeatureLayer) {
    if (this._isMobile) {
      // configure label properties
      const casesLabelClass = [new LabelClass({
        labelExpressionInfo: {
          expression: `$feature.${this.appStateService.dataServiceFields.CovidCases}`,
        },
        minScale: 1000000,
        symbol: {
          type: "text", // autocasts as new TextSymbol()
          color: "black",
          haloSize: 1,
          haloColor: "white",
        } as esri.SymbolProperties,
      })];

      layer.labelingInfo = casesLabelClass;
    }
    else {
      return
    }
  }

  /********Initialise Widgets *********/
  initialiseSearchWidget() {

    //Filter the search Extent to limit results to UK
    let filterSearchExtent = new Extent({
      spatialReference: {
        // "latestWkid": 3857,
        wkid: 4326,
      },
      xmin: -10,
      ymin: 45,
      xmax: 8,
      ymax: 60,
    });

    //initialise the sources for the search widget.
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
        filter: {
          geometry: filterSearchExtent,
        },
      },
    ];

    const searchWidget = new Search({
      view: this._view,
      allPlaceholder: "Find Address or Place",
      includeDefaultSources: false,
      sources: sources,
    });

    return searchWidget
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
      screenPoint: (response as any).screenPoint,
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
    let hit = await this.hitTester(event, this._MSOAcasesFeatLayer);
    this._view.popup.open({ title: "hi there!", location: event.mapPoint, content: "I'm a pop-up" })
  };

  hoverHandler: esri.MapViewPointerMoveEventHandler = async (
    event: esri.MapViewPointerMoveEvent
  ) => {
    //Test for hit result on MSOAcasesFeatureLayer
    let hit = await this.hitTester(event, this._MSOAcasesFeatLayer);

    //If no result hide the tooltip and remove highlights.
    if (!hit) {
      if (this._currentlyHighlighted) {
        this._currentlyHighlighted.handle.remove();
        this._currentlyHighlighted = null;
        this.hideTooltip.emit();
      }

      return;
    }


    //MSOAcasesFeatLayer has been hit
    //extract attribute information and show tooltip
    let MSOAName: string = hit.graphic.getAttribute(
      this.appStateService.dataServiceFields.MSOAname
    );
    let numcases: number = hit.graphic.getAttribute(
      this.appStateService.dataServiceFields.CovidCases
    );
    let casestring: string = numcases ? ` Cases: ${numcases}` : "";

    this.showTooltip.emit({
      screenPoint: hit.screenPoint,
      text: MSOAName + casestring,
    });


    // Control Highlight behaviour.
    // If somewhere is already highlighted and the hittested graphic is a different
    // object id then clear existing highlight graphic.
    if (
      this._currentlyHighlighted &&
      this._currentlyHighlighted.highlightGraphic.attributes.OBJECTID !==
      hit.graphic.attributes.OBJECTID
    ) {
      this._currentlyHighlighted.handle.remove();
      this._currentlyHighlighted = null;
    }

    // If the somewhere is still highlighted then persist the current highlighted feature
    if (this._currentlyHighlighted) {
      return;
    }

    // Otherwise time to highlight a new feature on the map.
    this._currentlyHighlighted = {
      highlightGraphic: hit.graphic,
      handle: this._caseslayerview.highlight(hit.graphic),
    };
  };

  // Generate dynamicaly the colour renderer using the statistics of the cases field in the
  // MSOA Cases Layer.
  async generateMSOACasesRenderer() {
    // configure parameters for the color renderer generator
    // the layer must be specified along with a field name.

    let colorScheme: esri.ColorScheme = await getSchemeByName({
      name: "red 6",
      geometryType: "polygon",
      theme: "high-to-low",
    });

    colorScheme.noDataColor = new Color("rgba(255, 247, 236, 0.5)");

    const colorParams: esri.colorCreateContinuousRendererParams = {
      layer: this._MSOAcasesFeatLayer,
      field: this.appStateService.dataServiceFields.CovidCases,
      view: this._view,
      theme: "high-to-low",
      colorScheme: colorScheme,
      outlineOptimizationEnabled: true,
      defaultSymbolEnabled: true,
    };

    const rendererResult = await createContinuousRenderer(colorParams);
    this._continuousColorCasesRenderer = rendererResult.renderer

    return rendererResult.renderer
  }

  /**Pan the map view to specific coordinates.
   *
   * @param coordinates - target coordinates or geometry
   */
  panMap(coordinates) {
    this._view.goTo(
      { target: coordinates, zoom: 10 },
      { duration: 1000, easing: "ease-in" }
    );
  }


  /**Creates a custom CIM symbol labelled by the input value string.
   *
   * @param value : string.
   */
  getCIMPointSymbolData(value) {
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
              textString: String(value),
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
