import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import esri = __esri;
import QueryTask from "@arcgis/core/tasks/QueryTask";
import Query from "@arcgis/core/tasks/support/Query";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { Subscription } from "rxjs";
import { CovidTableDataElement } from "../../../models/custom-types";
import { LoaderService } from "../../../shared/loader/loader.service";
import { AppStateService } from '../../../shared/app-state.service';


@Component({
  selector: "app-cases-table",
  templateUrl: "./cases-table.component.html",
  styleUrls: ["./cases-table.component.scss"],
})
export class CasesTableComponent
  implements OnInit, OnDestroy, AfterViewInit {

  // Map Extent Subscription - for querying features in view.
  mapExtentSubscription: Subscription;

  // Loading state subscription
  tableLoadedSubscription: Subscription;

  // Query Results
  private _queryResults: esri.FeatureSet;

  /** All Covid Cases Table Records
   *  - A filtered subset is usually presented. */
  private _allData: CovidTableDataElement[];

  /** Track Device State (desktop vs mobile)
   *  -  functionality in html template is switched on and off depending on
   *     whether it is a desktop view
   *  */
  public isDesktop: boolean

  // Material Table Component State
  public _dataSource;
  public displayedColumns: string[] = ["name", "localAuthority", "cases"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public appStateService: AppStateService,
    private loaderService: LoaderService
  ) { }

  /**Function to Initialise Table */
  async initialiseTable() {

    if (!this.appStateService.tableData) {
      let queryTask = new QueryTask({
        url: this.appStateService.dataServiceUrl + "/0",
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
          feature.attributes[this.appStateService.dataServiceFields.MSOACode];


        return {
          MSOAName:
            feature.attributes[this.appStateService.dataServiceFields.MSOAname],
          MSOALocalAuthority: this.appStateService.MSOA_Lookup.get(MSOACode).LAD20NM,
          cases: feature.attributes[
            this.appStateService.dataServiceFields.CovidCases
          ]
            ? feature.attributes[this.appStateService.dataServiceFields.CovidCases]
            : 0,
          MSOACode: MSOACode,
          MSOAGeometry: feature.geometry,
        };
      });
      this.appStateService.tableData = this._allData;
    } else {
      this._allData = this.appStateService.tableData;
    }


    let extentFilter = this.appStateService.mapCurrentExtent ? this.appStateService.mapCurrentExtent : this.appStateService._mapStartingExtent

    this._dataSource = new MatTableDataSource<{
      MSOAName: string;
      MSOALocalAuthority: string;
      cases: number;
    }>(
      this._allData.filter((element) => {
        return geometryEngine.intersects(
          element.MSOAGeometry,
          extentFilter
        );
      })
    );
  }

  ngOnInit(): void {
    this.isDesktop = this.appStateService.deviceInfo.isDesktop
    this.loaderService.register({ id: "table", show: false });
    this.displayLoader("table", this.appStateService.tableLoaded);
    this.tableLoadedSubscription = this.appStateService.tableLoaded$.subscribe(
      (tableLoaded) => {
        this.displayLoader("table", tableLoaded);
      }
    );
  }

  ngAfterViewInit() {
    this.initialiseTable().then(() => {
      this._dataSource.paginator = this.paginator;
      this._dataSource.sort = this.sort;
      this.appStateService.tableLoaded = true;
    });

    this.mapExtentSubscription = this.appStateService.mapCurrentExtent$.subscribe(
      (extent) => {
        if (this._allData) {
          this._dataSource.data = this._allData.filter((element) => {
            return geometryEngine.intersects(
              element.MSOAGeometry,
              this.appStateService.mapCurrentExtent
            );
          });
        }
      }
    );
  }

  tableClickHandler(row) {
    this.appStateService.panToTarget(row.MSOAGeometry);
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
    this.appStateService.tableLoaded = false;
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
