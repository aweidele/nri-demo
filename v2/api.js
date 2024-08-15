//https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=1600+Pennsylvania+Ave+NW,+Washington,+DC+20500&outFields=Match_addr,Addr_type,location&f=json
// const formWrapper = document.getElementById("form-wrapper");
// const zipInput = document.getElementById("zip");
// const submitButton = document.getElementById("submitButton");
// const urlWrapper = document.querySelector(".url");

// submitButton.addEventListener("click", (e) => {
//   const address = zipInput.value;
//   const endpoint = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(address)}&outFields=Match_addr,Addr_type,location&f=json`;
//   urlWrapper.innerText = endpoint;
//   urlWrapper.classList.remove("hidden");
//   console.log(endpoint);
// });

/*
https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=21228&maxSuggestions=6&countryCode=US&location={"spatialReference":{"wkid":102100},"x":-10801469.5,"y":4711105.5}
https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=21228&maxSuggestions=6&countryCode=US&location={"spatialReference":{"wkid":102100},"x":1949898.8367559016,"y":4813488.5268678265}

https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=21228&maxSuggestions=6&countryCode=US&location=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22x%22%3A-10801469.5%2C%22y%22%3A4711105.5%7D
https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=21228&maxSuggestions=6&countryCode=US&location=%7B%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%2C%22x%22%3A1232374.8388078017%2C%22y%22%3A4683210.824311126%7D

*/
class addressLookup {
  constructor() {
    this.zipInput = document.getElementById("zip");
    this.submitButton = document.getElementById("submitButton");
    this.urlWrapper = document.querySelector(".url");
    this.riskResults = document.querySelector(".risk-results");

    this.submitButton.addEventListener("click", this.submitZip.bind(this));
  }

  submitZip(e) {
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
      this.urlWrapper.innerHTML = `${this.urlWrapper.innerHTML}
        <p><strong>text: </strong>${text}</p>
        <p><strong>magicKey: </strong>${magicKey}</p>
        <p><strong>isCollection: </strong>${isCollection}</p>
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
    this.riskResults.innerHTML = "";
    console.log(results);
    const { attributes } = results.features[0];
    const { fields } = results;

    console.log(attributes);
    console.log(fields);

    const report = Object.keys(attributes).map((key) => {
      const field = fields.find((element) => element.name === key);
      const row = {
        name: key,
        alias: field.alias,
        value: attributes[key],
      };
      return row;
    });

    report.forEach((element) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${element.name}</td>
        <td>${element.alias}</td>
        <td>${element.value}</td>`;
      this.riskResults.appendChild(row);
    });
  }
}

const lookup = new addressLookup();
console.log(lookup);

/*
https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=20765, Galesville, MD, USA&f=json&outSR={"latestWkid":3857,"wkid":102100}&countryCode=US&magicKey=dHA9MCN0dj02NmE3YzkyMyNsb2M9NzI4NzMyOSNsbmc9NDIjcGw9NzQ5NTg4NyNsYnM9MTQ6MTg3MjA2NSNsbj1Xb3JsZA==&location={"spatialReference":{"wkid":102100},"x":-8529016.4366,"y":4718149.2999}&maxLocations=3
https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query?f=json&geometry={"spatialReference":{"latestWkid":3857,"wkid":102100},"x":-8542459.0070528,"y":4761122.249118672}&outFields=*&spatialRel=esriSpatialRelIntersects&where=1=1&geometryType=esriGeometryPoint&inSR=102100&outSR=102100
*/
