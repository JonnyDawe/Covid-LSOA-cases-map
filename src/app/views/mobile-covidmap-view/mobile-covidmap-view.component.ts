import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavService } from 'src/app/shared/sidenav.service';
import { AppStateService } from 'src/app/shared/app-state.service';
import { LoaderService } from 'src/app/shared/loader/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mobile-covidmap-view',
  templateUrl: './mobile-covidmap-view.component.html',
  styleUrls: ['./mobile-covidmap-view.component.scss']
})
export class MobileCovidmapViewComponent implements OnInit, AfterViewInit {

  // Subscriptions and State
  mapLoadedSubscription: Subscription;
  mapLoadingState: boolean = true;
  public mapOnly: boolean = true;

  // access material sidenav element in HTML template.
  @ViewChild('sidenav') public sidenav: MatSidenav;

  // inject appstate, loader and sidenav services.
  constructor(private sidenavService: SidenavService, public appStateService: AppStateService, private loaderService: LoaderService) { }

  ngOnInit(): void {

    // Register Loader and listen for updates to loading state.
    this.loaderService.register({ id: "map", show: false });
    this.loaderService.toggleDisplayLoader("map", this.appStateService.mapLoaded);

    this.mapLoadedSubscription = this.appStateService.mapLoaded$.subscribe(
      (mapLoaded) => {
        this.loaderService.toggleDisplayLoader("map", mapLoaded);
        this.mapLoadingState = !mapLoaded;
      }
    );
  }

  // register sidenav with sidenav service.
  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }

  toggleTableDraw() {
    this.mapOnly = !this.mapOnly;
  }

}
