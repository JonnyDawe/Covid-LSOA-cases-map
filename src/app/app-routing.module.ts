import { NgModule } from "@angular/core";
import { Routes, RouterModule, Router } from "@angular/router";
import { CovidmapViewComponent } from './views/covidmap-view/covidmap-view.component';
import { StatsViewComponent } from './views/stats-view/stats-view.component';
import { MobileCovidmapViewComponent } from './views/mobile-covidmap-view/mobile-covidmap-view.component';
import { AppStateService } from './shared/app-state.service';


/** Provide Routes for desktop and mobile device
 * https://medium.com/better-programming/creating-angular-webapp-for-multiple-views-and-screen-sizes-50fe8a83c433
*/
export const desktopRoutes: Routes = [
  { path: "", redirectTo: "/map", pathMatch: "full" },
  {
    path: "map",
    component: CovidmapViewComponent,
  },
  { path: "stats", component: StatsViewComponent },
];

export const mobileRoutes: Routes = [
  { path: "", redirectTo: "/map", pathMatch: "full" },
  {
    path: "map",
    component: MobileCovidmapViewComponent,
  },
  { path: "stats", component: StatsViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(desktopRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {

  public constructor(private router: Router,
    private applicationStateService: AppStateService) {

    if (applicationStateService.deviceInfo.isMobile) {
      router.resetConfig(mobileRoutes);
    }
  }
}
