import { Directive, ElementRef, Renderer2, HostListener } from "@angular/core";
import { ToolTipInfo } from "../models/custom-types";

/**Directive to create a tooltip on the map.
 *
 * Add this directive to the map container used by the mapView.
 *
 * Hookup custom event emitters on the map component to fire showTooltip and
 * hide tooltip as required.
 */
@Directive({
  selector: "[appMapTooltip]",
})
export class MapTooltipDirective {
  private tooltip;
  private timeoutToRemove;
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.tooltip = this.createTooltip(el.nativeElement);
  }

  /**hide tooltip when host element containing the mapview has been exited by cursor */
  @HostListener("mouseleave", ["$event"]) onLeave(e: MouseEvent) {
    this.timeoutToRemove = window.setTimeout(() => {
      this.tooltip.hide();
    }, 300);
  }

  /**Listen for show tooltop event on map */
  @HostListener("showTooltip", ["$event"]) onshowTooltip(event: ToolTipInfo) {
    console.log("show");
    this.tooltip.show(event.screenPoint, event.text);
  }

  /**Listen for hide tooltop event on map */
  @HostListener("hideTooltip", ["$event"]) onhideTooltip(event: ToolTipInfo) {
    this.tooltip.hide();
  }

  /**
   * Function Generates a tooltip to display when hovering over a polygon.
   */
  createTooltip(element: HTMLDivElement) {
    let tooltip = document.createElement("div");
    let style = tooltip.style;
    style.opacity = "0";

    // Create the tooltip DOM object
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("id", "toolTip");
    tooltip.classList.add("tooltip-obj");

    //Create a container which positions relative to this object
    let tooltipcontainer = document.createElement("div");
    tooltipcontainer.classList.add("tooltip-container");

    //Create a the text and arrow element for inside the tooltip container.
    let textElement = document.createElement("div");
    textElement.classList.add(
      "esri-widget",
      "tooltip-inner-text",
      "mat-elevation-z2"
    );

    let arrowElement = document.createElement("div");
    arrowElement.classList.add("tooltip-arrow", "arrow");

    tooltipcontainer.appendChild(textElement);
    tooltipcontainer.appendChild(arrowElement);

    tooltip.appendChild(tooltipcontainer);

    element.appendChild(tooltip);

    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let visible = false;

    // move the tooltip progressively
    function move() {
      x += (targetX - x) * 0.1;
      y += (targetY - y) * 0.1;

      if (Math.abs(targetX - x) < 1 && Math.abs(targetY - y) < 1) {
        x = targetX;
        y = targetY;
      } else {
        requestAnimationFrame(move);
      }

      style.transform =
        "translate3d(" + Math.round(x) + "px," + Math.round(y) + "px, 0)";
    }

    return {
      show: function (point, text) {
        if (window) {
          if (!visible) {
            x = point.x;
            y = point.y;
          }

          targetX = point.x;
          targetY = point.y;
          style.opacity = "1";
          visible = true;
          textElement.innerHTML = text;

          move();
        } else {
          style.opacity = "0";
          visible = false;
        }
      },

      hide: function () {
        style.opacity = "0";
        visible = false;
      },
    };
  }
}
