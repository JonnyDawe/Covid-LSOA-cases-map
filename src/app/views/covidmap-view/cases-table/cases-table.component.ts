import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import esri = __esri;
import QueryTask from "esri/tasks/QueryTask";
import Query from "esri/tasks/support/Query";
import * as geometryEngine from "esri/geometry/geometryEngine";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import SpatialReference from "esri/geometry/SpatialReference";
import { Subscription } from "rxjs";
import { CovidTableDataElement } from "../../../models/custom-types";
import { LoaderService } from "../../../shared/loader/loader.service";
import { AppStateService } from '../../../shared/app-state.service';

//we have the current map extent.
//we have the data from the intial query
//on extent changes the data for the table needs to be filterer

//store original querydata.
//filter TABLE DATA using the extent of the map and the geometry engine.

//create a lookup for MSOA region and UTLA Name to help with table reading!
//Create a nice looking popup using JSON from Commons librarys for just England.
//Create a Script to convert CSV to JSON as needed.

@Component({
  selector: "app-cases-table",
  templateUrl: "./cases-table.component.html",
  styleUrls: ["./cases-table.component.scss"],
})
export class CasesTableComponent
  implements OnInit, OnDestroy, AfterViewInit {
  //Map Extent Subscription
  mapExtentSubscription: Subscription;
  tableLoadedSubscription: Subscription;

  //Map data object to store lookup table information.
  private _MSOAGeometryLookUp: Map<string, esri.Geometry>;
  private _queryResults: esri.FeatureSet;
  private _allData: CovidTableDataElement[];

  //table:
  public _dataSource;
  public displayedColumns: string[] = ["name", "localAuthority", "cases"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private mapService: AppStateService,
    private loaderService: LoaderService
  ) { }

  /**initialise Table */
  async initialiseTable() {
    this._MSOAGeometryLookUp = new Map();

    if (!this.mapService.tableData) {
      let queryTask = new QueryTask({
        url: this.mapService.dataServiceUrl + "/0",
      });

      let params = new Query({
        where: "1=1",
        returnGeometry: true,
        outFields: ["*"],
        outSpatialReference: SpatialReference.WebMercator,
        //Transfer upto 5 times the max queryable record count from the server.
        maxRecordCountFactor: 5,
      });

      try {
        this._queryResults = await queryTask.execute(params);
      } catch (err) {
        console.error(err);
      }

      if (this._queryResults.exceededTransferLimit) {
        console.warn("Query to populate table exceeded transfer limit");
      }

      this._allData = this._queryResults.features.map((feature) => {
        const MSOACode =
          feature.attributes[this.mapService.dataServiceFields.MSOACode];

        this._MSOAGeometryLookUp.set(MSOACode, feature.geometry);

        return {
          MSOAName:
            feature.attributes[this.mapService.dataServiceFields.MSOAname],
          MSOALocalAuthority: this.mapService.MSOA_Lookup.get(MSOACode).LAD20NM,
          cases: feature.attributes[
            this.mapService.dataServiceFields.CovidCases
          ]
            ? feature.attributes[this.mapService.dataServiceFields.CovidCases]
            : 0,
          MSOACode: MSOACode,
          MSOAGeometry: feature.geometry,
        };
      });
      this.mapService.tableData = this._allData;
    } else {
      this._allData = this.mapService.tableData;
    }


    let lookuper = this._allData.map((element) => {
      let temp = this.mapService.MSOA_Lookup.get(element.MSOACode)
      temp.centroidgeometry = (element.MSOAGeometry as esri.Polygon).centroid
      return temp

    })
    console.log("teser", lookuper)





    this._dataSource = new MatTableDataSource<{
      MSOAName: string;
      MSOALocalAuthority: string;
      cases: number;
    }>(
      this._allData.filter((element) => {
        return geometryEngine.intersects(
          element.MSOAGeometry,
          this.mapService.mapCurrentExtent
        );
      })
    );
  }

  ngOnInit(): void {
    this.loaderService.register({ id: "table", show: false });
    this.displayLoader("table", this.mapService.tableLoaded);
    this.tableLoadedSubscription = this.mapService.tableLoaded$.subscribe(
      (tableLoaded) => {
        this.displayLoader("table", tableLoaded);
      }
    );
  }

  ngAfterViewInit() {
    this.initialiseTable().then(() => {
      this._dataSource.paginator = this.paginator;
      this._dataSource.sort = this.sort;
      this.mapService.tableLoaded = true;
    });

    this.mapExtentSubscription = this.mapService.mapCurrentExtent$.subscribe(
      (extent) => {
        if (this._allData) {
          this._dataSource.data = this._allData.filter((element) => {
            return geometryEngine.intersects(
              element.MSOAGeometry,
              this.mapService.mapCurrentExtent
            );
          });
        }
      }
    );
  }

  tableClickHandler(row) {
    this.mapService.panToTarget(this._MSOAGeometryLookUp.get(row.MSOACode));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this._dataSource.filter = filterValue.trim().toLowerCase();

    if (this._dataSource.paginator) {
      this._dataSource.paginator.firstPage();
    }
  }

  displayLoader(id: string, loadedStatus: boolean) {
    console.log("id sent to loader:", id);
    if (loadedStatus) {
      this.loaderService.hideLoader(id);
      return;
    } else {
      this.loaderService.showLoader(id);
    }
  }

  ngOnDestroy(): void {
    this.mapExtentSubscription.unsubscribe();
    this.tableLoadedSubscription.unsubscribe();
    this.mapService.tableLoaded = false;
  }

  /**There is a server side cap on the number of features returned from a single
   * query. This code keeps pinging the feature service untill all of the features
   * have been returned.
   */
  // let fullResults : esri.Graphic[]
  // let queryResults = await this._queryTask.execute(params);
  // fullResults = queryResults.features

  // let start: number = queryResults.features.length
  // let num: number = 2*queryResults.features.length
  // while(queryResults.exceededTransferLimit){
  //   params.start = start
  //   params.num = num
  //   queryResults = await this._queryTask.execute(params);
  //   start = num
  //   num += queryResults.features.length
  //   fullResults = [...fullResults , ...queryResults.features]
  //}
}
