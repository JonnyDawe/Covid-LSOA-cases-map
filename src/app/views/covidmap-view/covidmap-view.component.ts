import { Component, OnInit, OnDestroy } from "@angular/core";
import { AppStateService } from "../../shared/app-state.service";
import { LoaderService } from "../../shared/loader/loader.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-covidmapview",
  templateUrl: "./covidmap-view.component.html",
  styleUrls: ["./covidmap-view.component.scss"],
})
export class CovidmapViewComponent implements OnInit, OnDestroy {

  // Subscriptions and State
  mapLoadedSubscription: Subscription;
  mapLoadingState: boolean = true;

  /** record whether only the map is beeing displayed. */
  public mapOnly: boolean = false;

  constructor(
    public mapService: AppStateService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {

    // Register Loader and listen for updates to loading state.
    this.loaderService.register({ id: "map", show: false });
    this.loaderService.toggleDisplayLoader("map", this.mapService.mapLoaded);

    this.mapLoadedSubscription = this.mapService.mapLoaded$.subscribe(
      (mapLoaded) => {
        this.loaderService.toggleDisplayLoader("map", mapLoaded);
        this.mapLoadingState = !mapLoaded;
      }
    );
  }

  ngOnDestroy(): void {
    this.mapLoadedSubscription.unsubscribe()
  }


  /** Toggle between map only and map and table state. */
  toggleMapWidth() {
    this.mapOnly = !this.mapOnly;
  }
}
