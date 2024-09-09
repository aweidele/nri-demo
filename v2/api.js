import { myFields } from "./fields.js";
class addressLookup {
  constructor() {
    this.zipInput = document.getElementById("zip");
    this.submitButton = document.getElementById("submitButton");
    this.formWrapper = document.getElementById("form-wrapper");
    this.urlWrapper = document.querySelector(".url");
    this.riskResults = document.querySelector(".risk-results");
    this.report = document.querySelector(".report");

    // this.fields = ["STATE", "COUNTY", "COUNTYTYPE", "AVLN_RISKS", "AVLN_RISKR", "CFLD_RISKR", "CFLD_RISKS", "CWAV_RISKS", "CWAV_RISKR", "DRGT_RISKS", "DRGT_RISKR", "ERQK_RISKS", "ERQK_RISKR", "HAIL_RISKS", "HAIL_RISKR", "HWAV_RISKS", "HWAV_RISKR", "HRCN_RISKS", "HRCN_RISKR", "ISTM_RISKS", "ISTM_RISKR"];

    this.formWrapper.addEventListener("submit", this.submitZip.bind(this));
    console.log("myFields", myFields);
  }

  submitZip(e) {
    e.preventDefault();
    const zip = this.zipInput.value;
    const endpoint = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=${zip}&maxSuggestions=6&countryCode=US`;
    console.log(endpoint);
    this.urlWrapper.innerHTML = `<p><a href="${endpoint}" target="_blank">${endpoint}</a></p>`;
    this.urlWrapper.classList.remove("hidden");
    this.searchZip(endpoint);
  }

  async searchZip(endpoint) {
    console.log("SearchZip", endpoint);
    try {
      const res = await fetch(endpoint, {
        method: "GET",
      });

      const data = await res.json();
      this.searchZipResult(data);
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  }

  searchZipResult(zipResult) {
    console.log(zipResult.suggestions);
    if (zipResult.suggestions.length) {
      const { text, magicKey, isCollection } = zipResult.suggestions[0];
      this.urlWrapper.innerHTML = `
        <h2>API Results</h2>  
        ${this.urlWrapper.innerHTML}
        <p><strong>text: </strong>${text}</p>
        <p><strong>magicKey: </strong>${magicKey}</p>
        <p><strong>isCollection: </strong>${isCollection}</p>
        <div class="json-results">
          <label for="zip-suggestions">See full results</label><input type="checkbox" id="zip-suggestions">
          <pre>${JSON.stringify(zipResult, null, 2)}</pre>
        </div>
      `;

      const endpoint = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(text)}%2C%20USA&f=json&outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D&countryCode=US&magicKey=${magicKey}&maxLocations=3`;
      this.addressCandidates(endpoint);
    } else {
      this.urlWrapper.innerHTML = `No Results.`;
    }
  }

  async addressCandidates(endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "GET",
      });
      const data = await res.json();
      console.log(data);
      this.urlWrapper.innerHTML = `${this.urlWrapper.innerHTML}<hr>
      <p><a href="${endpoint}" target="_blank">${endpoint}</a></p>
      `;
      this.addressCandidatesResults(data);
    } catch (err) {
      console.log(`ERROR: ${err}`);
    }
  }

  addressCandidatesResults(addressCandidates) {
    const { address, location } = addressCandidates.candidates[0];
    const { wkid, latestWkid } = addressCandidates.spatialReference;

    this.urlWrapper.innerHTML = `${this.urlWrapper.innerHTML}
      <p><strong>Address: </strong> ${address}</p>
      <p><strong>Location: </strong> ${location.x}, ${location.y}</p>
      <p><strong>WKID: </strong> ${wkid}</p>
      <p><strong>Latest WKID: </strong> ${latestWkid}</p>
      <div class="json-results">
        <label for="address-candidates">See full results</label><input type="checkbox" id="address-candidates">
        <pre>${JSON.stringify(addressCandidates, null, 2)}</pre>
      </div>
    `;

    const endpoint = `https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query?f=json&geometry=${encodeURIComponent(
      `{"spatialReference":{"latestWkid":${latestWkid},"wkid":${wkid}},"x":${location.x},"y":${location.y}}`
    )}&outFields=*&spatialRel=esriSpatialRelIntersects&where=1%3D1&geometryType=esriGeometryPoint&inSR=${wkid}&outSR=${wkid}`;

    this.getRiskRatings(endpoint);
  }

  async getRiskRatings(endpoint) {
    this.urlWrapper.innerHTML = `${this.urlWrapper.innerHTML}<hr>
      <p><a href="${endpoint}" target="_blank">${endpoint}</a></p>`;

    try {
      const res = await fetch(endpoint, {
        method: "GET",
      });
      const data = await res.json();

      this.riskRatingsResults(data);
    } catch (err) {
      console.log(err);
    }
  }

  riskRatingsResults(results) {
    this.urlWrapper.innerHTML = `${this.urlWrapper.innerHTML}
      <div class="json-results">
        <label for="results">See full results</label><input type="checkbox" id="results">
        <pre>${JSON.stringify(results, null, 2)}</pre>
      </div>
    `;
    this.riskResults.innerHTML = "";
    console.log(results);
    const { attributes } = results.features[0];
    const { fields } = results;

    console.log(attributes);
    console.log(fields);

    const fullReport = Object.keys(attributes).map((key) => {
      const field = fields.find((element) => element.name === key);
      const row = {
        name: key,
        alias: field.alias,
        value: attributes[key],
      };
      return row;
    });

    fullReport.forEach((element) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${element.name}</td>
        <td>${element.alias}</td>
        <td>${element.value}</td>`;
      this.riskResults.appendChild(row);
    });

    const report = myFields.map((key) => {
      const scoreField = fields.find((element) => element.name === `${key}_RISKS`);
      const ratingField = fields.find((element) => element.name === `${key}_RISKR`);

      const title = scoreField.alias.split(" - ");

      return {
        title: title[0],
        scoreField: { name: scoreField.name, alias: scoreField.alias, value: Math.round(attributes[`${key}_RISKS`] * 10) / 10 },
        ratingField: { name: ratingField.name, alias: ratingField.alias, value: attributes[`${key}_RISKR`] },
      };
    });
    console.log("report", report);

    this.report.innerHTML = `
      <h2>${attributes.COUNTY} ${attributes.COUNTYTYPE}, ${attributes.STATE}</h2>
      <div class="report-inner">
      ${report
        .map(
          (row) => `
        <div class="${this.riskClass(row.ratingField.value)}">
          <h3>${row.title}</h3>
          <div>
            <strong>Risk Score:</strong> ${row.scoreField.value}
          </div>
          <div>
            <strong>Risk Rating:</strong> ${row.ratingField.value}
          </div>
        </div>
        `
        )
        .join("")}
        </div>
    `;
  }

  riskClass(rating) {
    if (rating.includes("Low")) return "low";
    if (rating.includes("Moderate")) return "moderate";
    if (rating.includes("High")) return "high";
    return "low";
  }
}

const lookup = new addressLookup();
console.log(lookup);

/*
https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=20765, Galesville, MD, USA&f=json&outSR={"latestWkid":3857,"wkid":102100}&countryCode=US&magicKey=dHA9MCN0dj02NmE3YzkyMyNsb2M9NzI4NzMyOSNsbmc9NDIjcGw9NzQ5NTg4NyNsYnM9MTQ6MTg3MjA2NSNsbj1Xb3JsZA==&location={"spatialReference":{"wkid":102100},"x":-8529016.4366,"y":4718149.2999}&maxLocations=3
https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query?f=json&geometry={"spatialReference":{"latestWkid":3857,"wkid":102100},"x":-8542459.0070528,"y":4761122.249118672}&outFields=*&spatialRel=esriSpatialRelIntersects&where=1=1&geometryType=esriGeometryPoint&inSR=102100&outSR=102100
*/
