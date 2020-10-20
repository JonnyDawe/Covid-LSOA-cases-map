import { Component, OnInit } from "@angular/core";
import { AppStateService } from "../../shared/app-state.service";
import { LoaderService } from "../../shared/loader/loader.service";
import { Subscription } from "rxjs";

//todo - Destroy Subscriptions!!!!
@Component({
  selector: "app-covidmapview",
  templateUrl: "./covidmap-view.component.html",
  styleUrls: ["./covidmap-view.component.scss"],
})
export class CovidmapViewComponent implements OnInit {
  mapLoadedSubscription: Subscription;
  mapLoadingState: boolean = true;

  public mapOnly: boolean = false;

  constructor(
    public mapService: AppStateService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.register({ id: "map", show: false });
    this.displayLoader("map", this.mapService.mapLoaded);

    this.mapLoadedSubscription = this.mapService.mapLoaded$.subscribe(
      (mapLoaded) => {
        this.displayLoader("map", mapLoaded);
        this.mapLoadingState = !mapLoaded;
      }
    );
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

  toggleMapWidth() {
    this.mapOnly = !this.mapOnly;
  }
}
