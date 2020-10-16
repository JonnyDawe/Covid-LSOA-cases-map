import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CovidmapViewComponent } from './views/covidmap-view/covidmap-view.component';
import { StatsViewComponent } from './views/stats-view/stats-view.component';

@NgModule({
  declarations: [
    AppComponent,
    CovidmapViewComponent,
    StatsViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
