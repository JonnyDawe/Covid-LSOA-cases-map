import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CovidmapViewComponent } from './views/covidmap-view/covidmap-view.component';
import { StatsViewComponent } from './views/stats-view/stats-view.component';



export const appRoutes: Routes = [
  { path: "", redirectTo: "/map", pathMatch: "full" },
  {
    path: "map",
    component: CovidmapViewComponent,
  },
  { path: "stats", component: StatsViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
