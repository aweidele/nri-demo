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

    this.submitButton.addEventListener("click", this.submitZip.bind(this));
  }

  submitZip(e) {
    const zip = this.zipInput.value;
    const endpoint = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=${zip}&maxSuggestions=6&countryCode=US`;
    this.urlWrapper.innerHTML = `<a href="${endpoint}" target="_blank">${endpoint}</a>`;
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
    if (zipResult.suggestions.length) {
      console.log(zipResult.suggestions[0]);
      this.urlWrapper.innerHTML = zipResult.suggestions[0].text;
    } else {
      this.urlWrapper.innerHTML = `No Results.`;
    }
  }
}

const lookup = new addressLookup();
console.log(lookup);
