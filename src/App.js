import {useState, useEffect} from "react";

function App() {

  const [covidData, setCovidData] = useState({country: "none", confirmed: "none"});
  const [vaccineData, setVaccineData] = useState({});
  const [listOfCountries, setListOfCountries] = useState([]);
  const [currentCountryCases, setCurrentCountryCases] = useState({});
  const [currentVaccineCases, setCurrentVaccineCases] = useState({});
 
  function handleSubmit(event) {
    event.preventDefault();

    //Set the current country to the one just selected
    const selectedCountry = document.querySelector("#countryInput").value;
    if (!selectedCountry) {return} // if null return

    function notFound() {
     const errorMessage = document.querySelector("#errorMessage");
     errorMessage.classList.remove("hidden");
     setTimeout(() => {errorMessage.classList.add("hidden")}, 3000)

     

    }
    
    covidData[selectedCountry] ? setCurrentCountryCases(covidData[selectedCountry].All) : notFound();
    vaccineData[selectedCountry] ? setCurrentVaccineCases(vaccineData[selectedCountry].All) : notFound();


    /*setCurrentCountryCases(covidData[selectedCountry].All);
    setCurrentVaccineCases(vaccineData[selectedCountry].All);*/

    
    
    console.log("new count obj", currentCountryCases);
   

  }


  useEffect(() => {
    async function getAllCountries() {
      const countryData = await fetch("https://covid-api.mmediagroup.fr/v1/cases?country=All", {mode:"cors"});
      const countryJSON = await countryData.json();  
     setCovidData(countryJSON); //Country data already downloaded so might as well store it;
      const countryList = [];
      for (let name in countryJSON ) {countryList.push(name)};  
      setListOfCountries(countryList);
      console.log("this is line 34", covidData)
  
    }

    async function getVaccineData() {
      const vaccineDownload = await fetch("https://covid-api.mmediagroup.fr/v1/vaccines?country=All");
      const vaccineDataJSON = await vaccineDownload.json()
      setVaccineData(vaccineDataJSON);
    }    

    getAllCountries(); 
    getVaccineData();    
  
   
  }, []);

  

 



//This is an inefficient way to do things. May be better downloading all case/vaccine data then updating DOM based on locally stored info. i.e., when the page loads, download all cases/vaccine data similar to the get all country function.

//Done. I think I need a new affect with covid and vaccine data depenencies that captures the cases, death etc. numbers and stores them for use in the DOM. I think currently, the app is mounting before the covid data is available and not refreshing. Hope the React upload works.


  return (
    <div className="App">
      <div id="container">
        <h1 className="Title">COVID-19 Stat Finder</h1>
        <div className="AllData">
          <div className="StatBox">
          <h2>Case Statistics</h2>
          <div className="DataBox"><p className="Category">Country: </p> <p>{currentCountryCases.country}</p></div>
          <div className="DataBox"><p className="Category">Cases:</p> <p>{currentCountryCases.confirmed}</p></div>
          <div className="DataBox"><p className="Category">Deaths: </p> <p>{currentCountryCases.deaths}</p></div>
          <div className="DataBox"><p className="Category">Recovered: </p> <p>{currentCountryCases.recovered}</p></div>
          </div>

        <div className="StatBox">
          <h2>Vaccination Statistics</h2> 
          <div className="DataBox"><p className="Category">Vaccines Administered: </p> <p>{currentVaccineCases.administered}</p></div>
          <div className="DataBox"><p className="Category">People Fully Vaccinated: </p> <p>{currentVaccineCases.people_vaccinated}</p></div>
          <div className="DataBox"><p className="Category">People Partially Vaccinated: </p> <p>{currentVaccineCases.people_partially_vaccinated}</p></div>
          <div className="DataBox"><p className="Category">Partially Vaccinated %: </p> <p>{currentVaccineCases.people_partially_vaccinated && ((currentVaccineCases.people_partially_vaccinated / currentCountryCases.population) * 100).toFixed(2)}</p></div>
          <div className="DataBox"><p className="Category">Fully Vaccinated %: </p> <p>{currentVaccineCases.people_vaccinated && ((currentVaccineCases.people_vaccinated / currentCountryCases.population) * 100).toFixed(2)}</p></div>
        </div>
        <h2>General Information</h2>
        <div className="DataBox"><p className="Category">Population: </p> <p>{currentCountryCases.population}</p></div>  
        <div className="DataBox"><p className="Category">Capital City: </p> <p>{currentCountryCases.capital_city}</p></div>
      </div>
      <div id="formSection">
        <form onSubmit={handleSubmit}>
          <div id="inputContainer"><input id="countryInput" list="countryList" id="countryInput"/>
          <datalist id="countryList"> 
          {listOfCountries.map(country => <option value={country} key={Math.random()*100000}/>)}
          
          </datalist>
     
          <button type="submit">Submit</button>
          </div>
        </form>
      </div>

      <div id="errorMessage" className="hidden"><p>No covid / vaccine data found.</p></div>

    </div>
    </div>
  );
}

export default App;

/*Previous issue with the DOM not updating was caused by the submit event, not the useEffect hook. 

The submit event changed the country but nothing else. Using the covidData object (that contained cases for every country) wasn't working. 

Refactored the submit handler so that on submission, it updates a country specific piece of state (currentCountryCases and currentVaccineCases) and based what was displayed in the DOM on those new pieces of state, instead of the covidData / vaccineData state. The latter were no longer being updated, so there was previously no trigger to re-render the DOM.*/

/*

At first, app was making a new call to the API on every submit event. Changed this so that there was a single API call after the page mounts. UseEffect and an empty dependency array used because other methods (not using a hook, no dependencies...) seemed to result in hundreds of API calls. Possibly because of the datalist generation.

It then looked as though the DOM wasn't being updated on submit. I added some default data to state and noticed that the data was initially loaded, before being removed. This indicated that the state was being read, then overwritten after the covidData state was updated after the API call, but not updated afterwards. Button created to log state to console demonstrated that the API state was indeed stored in state, but not being accessed in a way that triggered a DOM refresh.

I decided to create separate, individual country case/vaccine state objects that would be updated on refresh and trigger a DOM update.


*/