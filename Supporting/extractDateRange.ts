const csvFilePath = './MSOAs_latest_rollingWeeks.csv'
//https://github.com/ukparliament/uk.parliament-visual/blob/master/research/visualisations/coronavirus-restrictions-map/commonslibrary-coronavirus-restrictions-data.csv
const csv = require('csvtojson')
const fs = require("fs");

//csv only contains tier 2 and 3 areas.
let shortenedJson
let covidCasesDates = []
csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    shortenedJson = jsonObj.filter((element) => {
      return element.areaCode == "E02000001";
    })

    shortenedJson.map((caseRow) => {
      covidCasesDates.push(`${caseRow.date}`)
    })

    console.log(covidCasesDates)

    let results = JSON.stringify({
      covidCasesDates: covidCasesDates
    })

    fs.writeFileSync("../src/app/shared/covidCasesDates.json", results);
  })




