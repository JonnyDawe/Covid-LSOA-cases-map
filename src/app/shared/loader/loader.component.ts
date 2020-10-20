import { Component, Input, OnInit } from "@angular/core";
import { LoaderService } from "./loader.service";
import { Loader } from "./loader.model";

@Component({
  selector: "app-loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.scss"],
})
export class LoaderComponent implements OnInit {
  @Input() public id: string = "global";
  public show: boolean;

  constructor(private loaderService: LoaderService) {}

  public ngOnInit(): void {
    this.loaderService.loadingStatusCache.forEach((loader: Loader) => {
      if (loader.id === this.id) {
        this.show = loader.show;
      }
    });

    this.loaderService.loaderSubject.subscribe((response: Set<Loader>) => {
      response.forEach((loader: Loader) => {
        if (loader.id === this.id) {
          this.show = loader.show;
        }
      });
    });
  }
}
