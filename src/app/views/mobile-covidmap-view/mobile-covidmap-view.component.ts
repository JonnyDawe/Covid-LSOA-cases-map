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
  mapLoadedSubscription: Subscription;
  mapLoadingState: boolean = true;

  @ViewChild('sidenav') public sidenav: MatSidenav;
  constructor(private sidenavService: SidenavService, public appStateService: AppStateService, private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.loaderService.register({ id: "map", show: false });
    this.displayLoader("map", this.appStateService.mapLoaded);

    this.mapLoadedSubscription = this.appStateService.mapLoaded$.subscribe(
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

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }


}
