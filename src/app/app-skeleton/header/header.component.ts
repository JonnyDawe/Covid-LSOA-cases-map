import { Component, OnInit, AfterViewInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DialogAboutComponent } from "../dialog-about/dialog-about.component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.openDialog();
    }, 1000);
  }

  openDialog() {
    this.dialog.open(DialogAboutComponent, { autoFocus: false });
  }
}
