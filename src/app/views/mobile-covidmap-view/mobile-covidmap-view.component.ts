import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavService } from 'src/app/shared/sidenav.service';

@Component({
  selector: 'app-mobile-covidmap-view',
  templateUrl: './mobile-covidmap-view.component.html',
  styleUrls: ['./mobile-covidmap-view.component.scss']
})
export class MobileCovidmapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenav') public sidenav: MatSidenav;
  constructor(private sidenavService: SidenavService) { }

  ngOnInit(): void { }


  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }


}
