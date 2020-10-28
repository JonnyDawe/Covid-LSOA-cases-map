const csvFilePath = './commonslibrary-coronavirus-restrictions-data.csv'
//https://github.com/ukparliament/uk.parliament-visual/blob/master/research/visualisations/coronavirus-restrictions-map/commonslibrary-coronavirus-restrictions-data.csv
const csv = require('csvtojson')
const fs = require("fs");

//csv only contains tier 2 and 3 areas.
let filteredJson
let tier3Areas = []
let tier2Areas = []

csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    filteredJson = jsonObj.filter((element) => {
      return element.l_Country == "E";
    })

    filteredJson.map((LA_region) => {
      switch (LA_region.l_tier) {
        case "High":
          tier2Areas.push(`"${LA_region.l_l_widerlacode}"`)
          break;
        case "Very High":
          tier3Areas.push(`"${LA_region.l_l_widerlacode}"`)
          break;
      }
    })

    let results = JSON.stringify({
      tier2Areas: tier2Areas,
      tier3Areas: tier3Areas
    })

    fs.writeFileSync("../src/app/shared/LockdownAreas.json", results);
  })




