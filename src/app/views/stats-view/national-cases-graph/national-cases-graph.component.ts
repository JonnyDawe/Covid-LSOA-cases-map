import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import moment from 'moment';


@Component({
  selector: 'app-national-cases-graph',
  templateUrl: './national-cases-graph.component.html',
  styleUrls: ['./national-cases-graph.component.scss']
})
export class NationalCasesGraphComponent implements OnInit {


  public barChartOptions: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: "New Covid Cases by Publish Date in England",
      fontSize: 18,
      fontFamily: "'Lato', sans-serif",
    },
    legend: {
      display: false
    },
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{ type: "time", time: { unit: "month", parser: "YYYY-MM-DD" }, distribution: 'linear' }], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = []


  constructor() { }

  ngOnInit(): void {
    this.covidPHEapipull().then((result) => {
      this.barChartData = [{
        data: result.data.map((element) => {
          return {
            x: element.date,
            y: element.newCases
          }
        })
      }]
      console.log(this.barChartData)
    })


  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }


  async covidPHEapipull() {
    let areaName = "england"
    let areaType = "nation"
    let resultStructure = '{"date":"date","newCases":"newCasesByPublishDate"}'

    try {
      let response = await fetch(
        `https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=${areaType};areaName=${areaName}&structure=${resultStructure}`
      );
      let parsedResponse = await response.json();
      return parsedResponse
    } catch (e) {
      console.error(e);
    }
  }

}


