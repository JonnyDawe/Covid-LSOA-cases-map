"use strict";
const data = require("./MSOA-ref.json");
const fs = require("fs");

let result = data
  .map((MSOA_region) => {
    return {
      MSOA_Code: MSOA_region.MSOA11CD, //Middle Super Output Area code
      MSOA_name_HOC: MSOA_region.MSOA11HCLNM, //Middle Super Output Area name from House of Commons Library
      LAD20NM: MSOA_region.LAD20NM, //Local Authority (2020) name
      CAUTHNM: MSOA_region.CAUTHNM, //Combined authority name
      RGNNM: MSOA_region.RGNNM, //Region name
      CTRYNM: MSOA_region.CTRYNM, //Country Name
    };
  })
  .filter((element) => {
    return element.CTRYNM == "England";
  });

let jsonToWrite = JSON.stringify(result);
fs.writeFileSync("MSOA_Lookup.json", jsonToWrite);
