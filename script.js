function getWeather() {
    const apiKey = "dd7fb77e8f8964a1b93a706972f721a3";
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            currentForecastData = data.list;
            displayDailyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const dailyForecastDiv = document.getElementById('daily-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    dailyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15); // Convert to Celsius
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const temperatureHTML = `
            <p>${temperature}°C</p>
        `;

        const weatherHtml = `
            <p>${cityName}</p>
            <p>${description}</p>
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        showImage();
    }
}

function displayDailyForecast(forecastData) {
    const dailyForecastDiv = document.getElementById('daily-forecast');
    dailyForecastDiv.innerHTML = '';

    // Store original forecast data for hourly view
    const fullForecastData = {};
    forecastData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (!fullForecastData[day]) {
            fullForecastData[day] = [];
        }
        fullForecastData[day].push(item);
    });

    // Group forecast data by day for summary
    const dailyForecast = {};
    forecastData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                minTemp: Math.round(item.main.temp_min - 273.15),
                maxTemp: Math.round(item.main.temp_max - 273.15),
                icon: item.weather[0].icon,
                description: item.weather[0].main,
                fullData: fullForecastData[day]
            };
        } else {
            // Update min/max temps for the day
            dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, Math.round(item.main.temp_min - 273.15));
            dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, Math.round(item.main.temp_max - 273.15));
        }
    });

    // Store the daily forecast data globally
    window.dailyForecastData = dailyForecast;

    // Display forecast for next 7 days
    Object.entries(dailyForecast).slice(0, 7).forEach(([day, data]) => {
        const iconUrl = `https://openweathermap.org/img/wn/${data.icon}.png`;
        
        const dailyItemHtml = `
            <div class="daily-item" onclick="showHourlyForecast('${day}')">
                <span>${day}</span>
                <img src="${iconUrl}" alt="${data.description}">
                <span>${data.minTemp}°C / ${data.maxTemp}°C</span>
            </div>
        `;

        dailyForecastDiv.innerHTML += dailyItemHtml;
    });
}

let currentForecastData = null;

function showHourlyForecast(day) {
    const dailyForecastDiv = document.getElementById('daily-forecast');
    const hourlyData = window.dailyForecastData[day]?.fullData;

    if (!hourlyData || hourlyData.length === 0) {
        dailyForecastDiv.innerHTML = `<p>No hourly data available for ${day}</p>`;
        return;
    }

    dailyForecastDiv.innerHTML = `
        <button class="back-button" onclick="restoreDailyForecast()">← Back to 7-day forecast</button>
        <h4>Hourly Forecast for ${day}</h4>
        <div class="hourly-container">
    `;

    hourlyData.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp - 273.15);
        const feelsLike = Math.round(item.main.feels_like - 273.15);
        const humidity = item.main.humidity;
        const windSpeed = (item.wind.speed * 3.6).toFixed(1); // Convert to km/h
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        
        const hourlyItemHtml = `
            <div class="hourly-item">
                <span class="hourly-time">${time}</span>
                <img src="${iconUrl}" alt="${item.weather[0].description}">
                <span class="hourly-temp">${temp}°C</span>
                <div class="hourly-details">
                    <span>Feels like: ${feelsLike}°C</span>
                    <span>Humidity: ${humidity}%</span>
                    <span>Wind: ${windSpeed} km/h</span>
                </div>
            </div>
        `;

        dailyForecastDiv.innerHTML += hourlyItemHtml;
    });

    dailyForecastDiv.innerHTML += `</div>`;
}

function restoreDailyForecast() {
    if (currentForecastData) {
        displayDailyForecast(currentForecastData);
    } else {
        getWeather();
    }
}

function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block'; // Make the image visible once it's loaded
}