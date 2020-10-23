import { Component } from "@angular/core";
import config from "esri/config";
import { AppStateService } from './shared/app-state.service';

//Todo...
//new navbar...
//wider content
//content cards with rouned borders.
//popups for content.
//csv to json => to simple object to key off from.
//unique value renderer => hashed lines.
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  constructor(private appStateService: AppStateService) {

    this.ismobile = appStateService.deviceInfo.isMobile


    //note the default worker url version needs to match the version loaded in by webpack... make sure to check version installed..
    /**Hack required to get secured services to work with webworkers. */
    const DEFAULT_WORKER_URL = "https://js.arcgis.com/4.17/";
    const DEFAULT_LOADER_URL = `${DEFAULT_WORKER_URL}dojo/dojo-lite.js`;

    config.workers.loaderUrl = DEFAULT_LOADER_URL;
    config.workers.loaderConfig = {
      baseUrl: `${DEFAULT_WORKER_URL}dojo`,
      packages: [
        { name: "esri", location: `${DEFAULT_WORKER_URL}esri` },
        { name: "dojo", location: `${DEFAULT_WORKER_URL}dojo` },
        { name: "dojox", location: `${DEFAULT_WORKER_URL}dojox` },
        { name: "dstore", location: `${DEFAULT_WORKER_URL}dstore` },
        { name: "moment", location: `${DEFAULT_WORKER_URL}moment` },
        { name: "@dojo", location: `${DEFAULT_WORKER_URL}@dojo` },
        {
          name: "cldrjs",
          location: `${DEFAULT_WORKER_URL}cldrjs`,
          main: "dist/cldr",
        },
        {
          name: "globalize",
          location: `${DEFAULT_WORKER_URL}globalize`,
          main: "dist/globalize",
        },
        {
          name: "maquette",
          location: `${DEFAULT_WORKER_URL}maquette`,
          main: "dist/maquette.umd",
        },
        {
          name: "maquette-css-transitions",
          location: `${DEFAULT_WORKER_URL}maquette-css-transitions`,
          main: "dist/maquette-css-transitions.umd",
        },
        {
          name: "maquette-jsx",
          location: `${DEFAULT_WORKER_URL}maquette-jsx`,
          main: "dist/maquette-jsx.umd",
        },
        {
          name: "tslib",
          location: `${DEFAULT_WORKER_URL}tslib`,
          main: "tslib",
        },
      ],
    };
  }
  ismobile: boolean
  title = "eurovision-map-component";
}
