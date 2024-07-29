const wrapper = document.getElementById("wrapper");
const formWrapper = document.getElementById("form-wrapper");
const zipInput = document.getElementById("zip");
const submitButton = document.getElementById("submitButton");
let zipcodes;

function camelCaseToTitleCase(str) {
  // Add a space before each uppercase letter and convert the string to lowercase
  const result = str.replace(/([A-Z])/g, " $1").toLowerCase();
  // Capitalize the first letter of each word
  return result.replace(/\b\w/g, (char) => char.toUpperCase());
}

const goZips = (zips) => {
  console.log(zips);
  formWrapper.classList.remove("hidden");
  zipcodes = zips;
};

const getZips = async function () {
  try {
    const res = await fetch("./data/zipcodes.json");
    const zips = await res.json();
    goZips(zips);
  } catch (err) {
    console.log(`ERROR: ${err}`);
  }
};

getZips();

const renderData = (data, searchTerm) => {
  const result = data.nris[0];
  const { coastalFlooding, riverineFlooding, coldWave, drought, earthquake, heatWave, hail } = result;
  const hazards = Object.entries(result).filter((entry) => entry[1].hazardTypeRiskIndex);
  console.log(hazards);

  const html = `
    <h2>Results for ${searchTerm}</h2>
    <div class="container">
    ${hazards
      .map((entry) => {
        const { hazardTypeRiskIndex } = entry[1];
        return `
      <div>
        <h3>${camelCaseToTitleCase(entry[0])}</h3>
        <p>${hazardTypeRiskIndex.rating}</p>
      </div>`;
      })
      .join("")}
    </div>
  `;

  wrapper.innerHTML = html;
};

const getData = async function (searchTerm) {
  console.log("getData");
  const url = `https://api.lightboxre.com/v1/riskindexes/address/search?text=${encodeURIComponent(searchTerm.toLowerCase())}`;
  console.log(url);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "appication/json",
        "x-api-key": "X1CuWWsLaEx6eD8msvGGeJMjAtEAGkDd",
      },
    });
    // const res = await fetch("https://api.weather.gov/alerts?limit=500");

    const data = await res.json();
    renderData(data, searchTerm);
  } catch (err) {
    console.log(`ERROR: ${err}`);
  }
};

submitButton.addEventListener("click", (e) => {
  const zipsearch = parseInt(zipInput.value);
  const entry = zipcodes.find((element) => element.zip === zipsearch);
  if (entry) {
    const searchTerm = `${entry.city}, ${entry.state}`;
    getData(searchTerm);
  } else {
    wrapper.innerHTML = "No result found";
  }
  console.log(entry);
});
