import { Component, OnInit } from '@angular/core';
import { SidenavService } from 'src/app/shared/sidenav.service';


@Component({
  selector: 'app-mobile-header',
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss']
})
export class MobileHeaderComponent implements OnInit {
  constructor(private sidenav: SidenavService) { }

  toggleActive: boolean = false;

  toggleRightSidenav() {
    this.toggleActive = !this.toggleActive;
    this.sidenav.toggle();

    console.log('Clicked');
  }

  ngOnInit(): void {
  }

}
