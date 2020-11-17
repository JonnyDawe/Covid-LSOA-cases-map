import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import MSOA_lookup from "./MSOA_Lookup.json";
import covidCasesDateRange from "./covidCasesDates.json"
import LA_LockdownAreas from "./LockdownAreas.json";
import { CovidTableDataElement, DeviceInfo } from "../models/custom-types";
import { DeviceDetectorService } from "ngx-device-detector";
import esri = __esri;
import Extent from "@arcgis/core/geometry/Extent";

/**Application State Service stores application properties**/
@Injectable({
  providedIn: "root",
})
export class AppStateService {
  constructor(private deviceService: DeviceDetectorService) {
    //Initialise a lookup for MSOA region information.
    this.MSOA_Lookup = this.initaliseMSOAMap();

    //Generate date bins to use for time slider.
    this.covidCasesDateBins = covidCasesDateRange.covidCasesDates.sort(function (a, b) {
      //sort dates in ascending order
      return new Date(a).getTime() - new Date(b).getTime();
    })

    //Initialise the map to use the most recent date bin.
    this.currentDateSelected = this.covidCasesDateBins[this.covidCasesDateBins.length - 1]

    //Detect device used by user.
    this.detectDevice();
  }

  /** --------------------Map State-------------------- **/

  //Map centre and Zoom Level
  mapCentre: Array<number> = [-1.3, 52.98];
  mapZoomLevel: number = 6;
  //default basemaps here: https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html#basemap
  mapBasemap: string = "gray-vector";

  //current map Extent
  mapCurrentExtent$ = new Subject<esri.Extent>();
  _mapStartingExtent: esri.Extent = new Extent({
    spatialReference: {
      // "latestWkid": 3857,
      wkid: 102100,
    },
    xmin: -882179.7869264379,
    ymin: 6086514.827834351,
    xmax: 592749.110863931,
    ymax: 7872083.808575593,
  });

  /**current Esri Map Extent */
  _mapCurrentExtent: esri.Extent;

  set mapCurrentExtent(extent: esri.Extent) {
    this._mapCurrentExtent = extent;
    this.mapCurrentExtent$.next(this._mapCurrentExtent);
  }

  get mapCurrentExtent() {
    return this._mapCurrentExtent;
  }

  //Record and pass on requests to pan the map
  panRequest$ = new Subject<esri.GoToTarget2D>();

  panToTarget(pantarget: esri.GoToTarget2D) {
    this.panRequest$.next(pantarget);
  }

  /**Map Loaded State */
  //Record whether map is loaded
  mapLoaded$ = new Subject<boolean>();
  _mapLoaded: boolean = false;

  //set mapLoaded state and push event to all subscribers.
  set mapLoaded(state: boolean) {
    this._mapLoaded = state;
    this.mapLoaded$.next(this._mapLoaded);
  }
  get mapLoaded() {
    return this._mapLoaded;
  }

  /** --------------------Table State-------------------- **/

  //Store Query to MSOA Feature Service.
  _casesQueryResult: esri.Graphic[]
  set casesQueryResult(value: esri.Graphic[]) {
    this._casesQueryResult = value
  }
  get casesQueryResult() {
    return this._casesQueryResult
  }

  //store the data displayed on the table
  _tableData: CovidTableDataElement[];
  set tableData(value: CovidTableDataElement[]) {
    this._tableData = value;
  }
  get tableData() {
    return this._tableData;
  }

  /**Table Loaded State */
  //record whether the table is loaded
  tableLoaded$ = new Subject<boolean>();
  _tableLoaded: boolean = false;

  //set tableloaded state and push event to all subscribers.
  set tableLoaded(state: boolean) {
    this._tableLoaded = state;
    this.tableLoaded$.next(this._tableLoaded);
  }
  get tableLoaded() {
    return this._tableLoaded;
  }

  /** --------------------Time Slider State-------------------- **/

  // Date Ranges used by timeslider:
  covidCasesDateBins: string[]

  // store the current date selected  - populate on start up with latest date range
  // update the covid cases for a date field.
  _currentDateSelected: string
  set currentDateSelected(value) {
    this._currentDateSelected = value
    this.dataServiceFields.CovidCases = this.convertDateStringToField(value)
    this.dateset$.next(this._currentDateSelected)
  }

  get currentDateSelected() {
    return this._currentDateSelected
  }

  //need to fire off event when this changes so that feature layer updates can kick in.
  dateset$ = new Subject<string>();

  //record whether the timeslider should be displayed
  displayMobileMapTimeSlider$ = new Subject<boolean>();
  _showMobileMapTimeSlider: boolean = false

  set showMobileMapTimeSlider(state: boolean) {
    this._showMobileMapTimeSlider = state;
    this.displayMobileMapTimeSlider$.next(this._showMobileMapTimeSlider);
  }
  get showMobileMapTimeSlider() {
    return this._showMobileMapTimeSlider;
  }

  /** --------------------External Data Services-------------------- **/
  dataServiceUrl: string =
    "https://services6.arcgis.com/ujpPLfH38KAX8unh/arcgis/rest/services/MSOA_England_COVID_Cases_7_11_2020_rolling/FeatureServer";

  dataServiceFields = {
    MSOAname: "msoa11_hclnm",
    MSOACode: "msoa11cd",
    CovidCases: "Date_2020_10_30",
  };

  /**
   * MSOA Lookup - this allows the local authority etc. to be querires from the MSOA code.
   */
  MSOA_Lookup: Map<string, any>;

  initaliseMSOAMap() {
    let lookup = new Map<string, any>();
    MSOA_lookup.map((element) => {
      lookup.set(element.MSOA_Code, {
        MSOA_Code: element.MSOA_Code,
        MSOA_name_HOC: element.MSOA_name_HOC,
        LAD20NM: element.LAD20NM,
        CAUTHNM: element.RGNNM,
        RGNNM: element.RGNNM,
        CTRYNM: element.CTRYNM,
      });
    });

    return lookup;
  }

  //Detect Device so that the correct view can be used.
  deviceInfo: DeviceInfo;

  detectDevice() {
    this.deviceInfo = {
      isDesktop: this.deviceService.isDesktop(),
      isMobile: this.deviceService.isMobile(),
      isTablet: this.deviceService.isTablet(),
      DeviceInfo: this.deviceService.getDeviceInfo(),
    };
  }

  // Date fields in MSOA Feature Service have the following format: Date_3_4_2020
  // This is a hardcoded utility function...
  convertDateStringToField(datestring: string): string {
    return `Date_${datestring.replace(/\//g, "_")}`
  }
}
