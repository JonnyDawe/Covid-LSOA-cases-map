import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";

//App State
import { LoaderModule } from './shared/loader/loader.module';

//UI Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CovidmapViewComponent } from './views/covidmap-view/covidmap-view.component';
import { StatsViewComponent } from './views/stats-view/stats-view.component';
import { HeaderComponent } from './app-skeleton/header/header.component';
import { MapViewComponent } from './views/covidmap-view/map-view/map-view.component';
import { CasesTableComponent } from './views/covidmap-view/cases-table/cases-table.component';
import { DialogAboutComponent } from './app-skeleton/dialog-about/dialog-about.component';
import { MobileCovidmapViewComponent } from './views/mobile-covidmap-view/mobile-covidmap-view.component';
import { MobileHeaderComponent } from './app-skeleton/mobile-header/mobile-header.component';

//Material Design Modules
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { MatInputModule } from "@angular/material/input";
import { MapTooltipDirective } from './shared/map-tooltip.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavService } from './shared/sidenav.service';





@NgModule({
  declarations: [
    AppComponent,
    CovidmapViewComponent,
    StatsViewComponent,
    HeaderComponent,
    DialogAboutComponent,
    MapViewComponent,
    CasesTableComponent,
    MapTooltipDirective,
    MobileCovidmapViewComponent,
    MobileHeaderComponent,
  ],
  imports: [
    AppRoutingModule,
    LoaderModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSliderModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatSortModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule
  ],
  providers: [SidenavService],
  bootstrap: [AppComponent]
})
export class AppModule { }
