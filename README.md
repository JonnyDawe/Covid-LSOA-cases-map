# CovidMapping
This is a proof of concept application showing the seven day rolling total for the number of positive cases in local areas across England, as well as stats for the total number of cases recorded per day across England.

[Demo](https://covidweeklycases.web.app/map)

`**NOTE** The application was written during the initial wave of the COVID-19 pandemic as a POC, and LSOA data has not been updated since November 13th 2020.`

## Key Features:
- Demonstration of integrating Angular and the new JavaScript API for ArcGIS ECMA Modules.
- A custom reusable directive was written to generate tooltips.
- Experimented with detecting user device type (desktop vs mobile) in order to tailor the map display and user interface to each. On a small device it is essential that the map takes up the entire screen and does not scroll. 
- Integrated with the Public Health England Covid API and display data using the ChartJs charting framework.


