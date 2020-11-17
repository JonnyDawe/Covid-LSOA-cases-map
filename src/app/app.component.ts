import { Component, HostListener } from "@angular/core";
import { AppStateService } from './shared/app-state.service';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {

  ismobile: boolean
  screenHeight: number;

  constructor(private appStateService: AppStateService) {
    this.ismobile = appStateService.deviceInfo.isMobile
    this.getScreenSize();
  }

  title = "eurovision-map-component";

  //If on mobile device check for the available inner window height.
  //https://medium.com/@susiekim9/how-to-compensate-for-the-ios-viewport-unit-bug-46e78d54af0d
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    if (this.ismobile) {
      this.screenHeight = window.innerHeight;
      this.setBodyHeight()
    }

  }

  //set body element height.
  setBodyHeight() {
    // get html body element
    const bodyElement = document.body;

    if (bodyElement) {
      bodyElement.style.height = `${this.screenHeight}px`
    }
  }

}
