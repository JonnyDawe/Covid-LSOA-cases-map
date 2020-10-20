import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Loader } from "./loader.model";

@Injectable()
export class LoaderService {
  loaderSubject = new Subject<Set<Loader>>();
  loadingStatusCache = new Set<Loader>();

  constructor() {}

  public register(loader: Loader): void {
    this.loadingStatusCache.add(loader);
  }

  /**
   * Show loader
   * @param {string} id
   */
  public showLoader(id: string = "global"): void {
    this.loadingStatusCache.forEach((loader: Loader) => {
      if ((loader.id = id)) {
        loader.show = true;
        this.loaderSubject.next(this.loadingStatusCache);
      }
    });
  }

  /**
   * Hide loader
   * @param {string} id
   */
  public hideLoader(id: string = "global"): void {
    this.loadingStatusCache.forEach((loader: Loader) => {
      if ((loader.id = id)) {
        loader.show = false;
        this.loaderSubject.next(this.loadingStatusCache);
      }
    });
  }
}
