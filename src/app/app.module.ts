import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CovidmapViewComponent } from './views/covidmap-view/covidmap-view.component';
import { StatsViewComponent } from './views/stats-view/stats-view.component';
import { HeaderComponent } from './app-skeleton/header/header.component';

//Material Design Modules
import { MatDialogModule } from "@angular/material/dialog";
import { DialogAboutComponent } from './app-skeleton/dialog-about/dialog-about.component';

@NgModule({
  declarations: [
    AppComponent,
    CovidmapViewComponent,
    StatsViewComponent,
    HeaderComponent,
    DialogAboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
