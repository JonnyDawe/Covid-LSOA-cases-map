import { Component, OnInit } from '@angular/core';
import { SidenavService } from 'src/app/shared/sidenav.service';
import { DialogAboutComponent } from "../dialog-about/dialog-about.component";
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-mobile-header',
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss']
})
export class MobileHeaderComponent implements OnInit {
  constructor(private sidenav: SidenavService, public dialog: MatDialog) { }

  toggleActive: boolean = false;

  toggleRightSidenav() {
    this.toggleActive = !this.toggleActive;
    this.sidenav.toggle();
  }

  ngOnInit(): void {
  }

  openDialog() {
    this.dialog.open(DialogAboutComponent, { autoFocus: false });
  }

}
