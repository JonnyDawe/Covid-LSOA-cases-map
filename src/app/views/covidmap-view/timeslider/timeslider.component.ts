import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AppStateService } from 'src/app/shared/app-state.service';
import { MatSlider } from '@angular/material/slider';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-timeslider',
  templateUrl: './timeslider.component.html',
  styleUrls: ['./timeslider.component.scss']
})
export class TimesliderComponent implements OnInit, OnDestroy {

  constructor(public appStateService: AppStateService) { }

  // timeslider element reference (to get the value.)
  @ViewChild("timeSlider", { static: false }) public timeSliderEl: MatSlider;

  ngOnInit(): void {
    this.covidCasesWeekIntervals = this.appStateService.covidCasesDateBins
    this.max = this.covidCasesWeekIntervals.length - 1
    this.sliderValue = this.covidCasesWeekIntervals.length - 1

    this._ismobile = this.appStateService.deviceInfo.isMobile

    this.mapLoaded = this.appStateService.mapLoaded
    this.mapLoadedSubscription = this.appStateService.mapLoaded$.subscribe(
      (mapLoaded) => {
        this.mapLoaded = mapLoaded
      }
    );
  }

  //TO DO:
  //On press play - initiate the iterating through values on the time slider.
  //remember to loop back around....
  mapLoadedSubscription: Subscription
  mapLoaded: boolean = false

  covidCasesWeekIntervals: string[]
  min: number = 0
  max: number
  cycleThroughValues: boolean = false

  //timeslider controls:
  playTimeSlider: boolean = false
  playTimeSliderSubscription: Subscription

  //device type:
  public _ismobile: boolean = false


  _sliderValue: number
  set sliderValue(value) {
    this._sliderValue = value
    this.appStateService.currentDateSelected = this.appStateService.covidCasesDateBins[value]
  }

  get sliderValue() {
    return this._sliderValue
  }

  togglePlayTimeSlider() {
    this.playTimeSlider = !this.playTimeSlider

    switch (this.playTimeSlider) {
      case true:
        this.playTimeSliderSubscription = interval(1000).subscribe((val) => {
          this.sliderValue = this.sliderValue === this.max ? this.min : this.sliderValue + 1
        })
        break
      case false:
        if (this.playTimeSliderSubscription) {
          this.playTimeSliderSubscription.unsubscribe()
        }

    }

  }

  getTimeRangeText() {
    if (this.timeSliderEl) {
      if (this.timeSliderEl.value != 0) {
        return `${this.dateGBFormater(this.covidCasesWeekIntervals[(this.timeSliderEl.value - 1)])} - ${this.dateGBFormater(this.covidCasesWeekIntervals[this.timeSliderEl.value])}`
      }

      else {
        let setDateDate = new Date(this.covidCasesWeekIntervals[this.timeSliderEl.value])
        let prevDate = new Date(setDateDate.getTime() - (7 * 86400000))
        let pevDateString = `${(prevDate.getMonth() + 1)}/${prevDate.getDate()}/${prevDate.getFullYear()}`
        return `${this.dateGBFormater(pevDateString)}- ${this.dateGBFormater(this.covidCasesWeekIntervals[this.timeSliderEl.value])}`
      }
    }
  }


  dateGBFormater(datestring: string) {
    let myDate = new Date(datestring)
    return `${('0' + myDate.getDate()).slice(-2)}/${('0' + (myDate.getMonth() + 1)).slice(-2)}`
  }

  ngOnDestroy() {
    this.mapLoadedSubscription.unsubscribe()
    if (this.playTimeSliderSubscription) {
      this.playTimeSliderSubscription.unsubscribe()
    }
  }

}
