const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "0665e57807f8073b9eb3feb6a16cd071";

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    // html main page
    console.log(weatherItem);
    return `<div class="current-weather">
    <div class="details">
      <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
      <h4>Temperature:${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
      <h4>Wind:${weatherItem.wind.speed}M/S</h4>
      <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
      <img src="https://openweathermap.org/img/wn/${
        weatherItem.weather[0].icon
      }@4x.png" alt="weather-icon">
      <h4><b><em>${weatherItem.weather[0].description}<em><b></h4>
      </div>`;
  } else {
    //five days forecast
    return `<li class="card">
    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
    <img src="https://openweathermap.org/img/wn/${
      weatherItem.weather[0].icon
    }@2x.png" alt="weather-icon">
    <h4>Temperature:${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
    <h4>Wind:${weatherItem.wind.speed}M/S</h4>
    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
  </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForecastDays = [];
      console.log(data);
      //per day forecast
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });
      //clear previous data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      //weather cards and add them to the Dom
      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        } else {
          weatherCardsDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the Weather forecast!");
    });
};
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0)
        return alert(`No Coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (Position) => {
      const { latitude, longitude } = Position.coords;
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

      // reverse geocoding api
      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. Please reset location permission to grant access again"
        );
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);
