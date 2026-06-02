const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const statusText = document.querySelector("#status");
const weatherCard = document.querySelector("#weather-card");
const locationName = document.querySelector("#location-name");
const temperatureValue = document.querySelector("#temperature-value");
const humidityValue = document.querySelector("#humidity-value");
const windValue = document.querySelector("#wind-value");
const feelsLikeValue = document.querySelector("#feels-like-value");
const pressureValue = document.querySelector("#pressure-value");
const uvValue = document.querySelector("#uv-value");
const updatedTime = document.querySelector("#updated-time");
const forecastCard = document.querySelector("#forecast-card");
const forecastList = document.querySelector("#forecast-list");
const recentList = document.querySelector("#recent-list");
const refreshBtn = document.querySelector("#refresh-btn");
const unitCBtn = document.querySelector("#unit-c");
const unitFBtn = document.querySelector("#unit-f");
const submitButton = form.querySelector("button[type='submit']");

const geocodingBaseUrl = "https://geocoding-api.open-meteo.com/v1/search";
const weatherBaseUrl = "https://api.open-meteo.com/v1/forecast";
const RECENT_SEARCHES_KEY = "weather-dashboard-recent-cities";
const MAX_RECENT = 6;

let activeUnit = "c";
let lastSearchedCity = "";

initializeDashboard();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  await searchByCity(city);
});

refreshBtn.addEventListener("click", async () => {
  if (!lastSearchedCity) {
    showStatus("Search for a city first, then refresh.", "error");
    return;
  }
  await searchByCity(lastSearchedCity, false);
});

unitCBtn.addEventListener("click", async () => {
  await setUnit("c");
});

unitFBtn.addEventListener("click", async () => {
  await setUnit("f");
});

async function searchByCity(city, saveRecent = true) {
  if (!city) {
    showStatus("Enter a city name to search.", "error");
    return;
  }

  setLoading(true);
  showStatus("Fetching latest weather data...", "");

  try {
    const geoData = await fetchJson(
      `${geocodingBaseUrl}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const place = geoData?.results?.[0];

    if (!place) {
      throw new Error("City not found. Try a different spelling.");
    }

    const weatherQuery = buildWeatherQuery(place.latitude, place.longitude);
    const weatherData = await fetchJson(
      weatherQuery
    );

    const parsed = parseWeatherMetrics(place, weatherData);
    renderWeather(parsed);
    renderForecast(parsed.forecast);
    showStatus("Weather updated successfully.", "success");
    lastSearchedCity = city;
    if (saveRecent) {
      saveRecentCity(city);
      renderRecentSearches();
    }
  } catch (error) {
    weatherCard.classList.add("hidden");
    forecastCard.classList.add("hidden");
    showStatus(error.message || "Unable to fetch weather data.", "error");
  } finally {
    setLoading(false);
  }
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("Network error. Check your internet connection.");
  }

  if (!response.ok) {
    throw new Error(`API request failed (${response.status}). Please retry.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Received invalid JSON from weather service.");
  }
}

function buildWeatherQuery(latitude, longitude) {
  const tempUnit = activeUnit === "f" ? "fahrenheit" : "celsius";
  const windUnit = activeUnit === "f" ? "mph" : "kmh";
  return `${weatherBaseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,uv_index&hourly=temperature_2m,relative_humidity_2m&forecast_hours=24&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`;
}

function parseWeatherMetrics(place, weatherData) {
  const current = weatherData?.current;
  const hourly = weatherData?.hourly;
  const currentUnits = weatherData?.current_units;
  const hourlyUnits = weatherData?.hourly_units;

  if (!current || !hourly || !currentUnits || !hourlyUnits) {
    throw new Error("Unexpected weather response format.");
  }

  const humidityNow = current.relative_humidity_2m;
  if (humidityNow == null) {
    throw new Error("Humidity data is unavailable for this location right now.");
  }

  const forecast = buildForecast(hourly, hourlyUnits);

  return {
    cityLabel: `${place.name}${place.country ? `, ${place.country}` : ""}`,
    temperature: `${current.temperature_2m} ${currentUnits.temperature_2m || "°C"}`,
    humidity: `${humidityNow} ${currentUnits.relative_humidity_2m || "%"}`,
    windSpeed: `${current.wind_speed_10m} ${currentUnits.wind_speed_10m || "km/h"}`,
    feelsLike: `${current.apparent_temperature} ${currentUnits.apparent_temperature || "°C"}`,
    pressure: `${current.surface_pressure} ${currentUnits.surface_pressure || "hPa"}`,
    uvIndex: `${current.uv_index ?? "--"}`,
    observedAt: new Date(current.time).toLocaleString(),
    forecast,
  };
}

function renderWeather(data) {
  locationName.textContent = data.cityLabel;
  temperatureValue.textContent = data.temperature;
  humidityValue.textContent = data.humidity;
  windValue.textContent = data.windSpeed;
  feelsLikeValue.textContent = data.feelsLike;
  pressureValue.textContent = data.pressure;
  uvValue.textContent = data.uvIndex;
  updatedTime.textContent = `Observed: ${data.observedAt}`;
  weatherCard.classList.remove("hidden");
}

function buildForecast(hourly, hourlyUnits) {
  const hours = hourly.time ?? [];
  const temperatures = hourly.temperature_2m ?? [];
  const humidities = hourly.relative_humidity_2m ?? [];

  if (!hours.length || !temperatures.length || !humidities.length) {
    throw new Error("Forecast data is unavailable right now.");
  }

  return hours.slice(0, 8).map((time, index) => {
    const temp = temperatures[index];
    const humidity = humidities[index];
    if (temp == null || humidity == null) {
      throw new Error("Forecast data is incomplete. Please retry.");
    }
    return {
      time: new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      temp: `${temp} ${hourlyUnits.temperature_2m || "°C"}`,
      humidity: `${humidity}${hourlyUnits.relative_humidity_2m || "%"}`,
    };
  });
}

function renderForecast(items) {
  forecastList.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "forecast-item";
    card.innerHTML = `
      <p class="forecast-time">${item.time}</p>
      <p class="forecast-temp">${item.temp}</p>
      <p class="forecast-time">Humidity: ${item.humidity}</p>
    `;
    forecastList.append(card);
  });
  forecastCard.classList.remove("hidden");
}

function showStatus(message, variant) {
  statusText.textContent = message;
  statusText.className = "status";
  if (variant) {
    statusText.classList.add(variant);
  }
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  refreshBtn.disabled = isLoading;
  unitCBtn.disabled = isLoading;
  unitFBtn.disabled = isLoading;
  submitButton.textContent = isLoading ? "Loading..." : "Get Weather";
}

async function setUnit(unit) {
  if (unit === activeUnit) {
    return;
  }
  activeUnit = unit;
  unitCBtn.classList.toggle("active", unit === "c");
  unitFBtn.classList.toggle("active", unit === "f");
  if (lastSearchedCity) {
    await searchByCity(lastSearchedCity, false);
  }
}

function initializeDashboard() {
  renderRecentSearches();
}

function getRecentCities() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
    if (!Array.isArray(stored)) {
      return [];
    }
    return stored;
  } catch {
    return [];
  }
}

function saveRecentCity(city) {
  const normalized = city.toLowerCase();
  const cities = getRecentCities();
  const filtered = cities.filter((item) => item.toLowerCase() !== normalized);
  filtered.unshift(city);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
}

function renderRecentSearches() {
  const cities = getRecentCities();
  recentList.innerHTML = "";
  if (!cities.length) {
    const message = document.createElement("p");
    message.className = "status";
    message.textContent = "No recent searches yet.";
    recentList.append(message);
    return;
  }

  cities.forEach((city) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = city;
    chip.addEventListener("click", async () => {
      cityInput.value = city;
      await searchByCity(city, false);
    });
    recentList.append(chip);
  });
}
