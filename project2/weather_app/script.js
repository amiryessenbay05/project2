let currentUnit = 'metric';

async function getWeather() {
    const city = document.getElementById('city').value.trim();
    const apiKey = '3891e2033b69a8cc4354ed18fba76873'; 
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}&lang=en`;

    document.getElementById('weather').innerHTML = '';
    document.getElementById('loader').style.display = 'block';

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        if (data.cod === "200") {
            let weatherInfo = `<h2>5-Day Forecast for ${data.city.name}</h2><div class="forecast">`;

            const currentWeather = data.list[0];
            const currentDate = new Date(currentWeather.dt_txt).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
            const currentIconUrl = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;

            weatherInfo += `
                <div class="weather-day today">
                    <div class="date">${currentDate} (Today)</div>
                    <img src="${currentIconUrl}" alt="${currentWeather.weather[0].description}">
                    <div class="details">
                        <p>Temperature: ${currentWeather.main.temp}°</p>
                        <p>Feels Like: ${currentWeather.main.feels_like}°</p>
                        <p>Weather: ${currentWeather.weather[0].description}</p>
                        <p>Humidity: ${currentWeather.main.humidity}%</p>
                    </div>
                </div>
            `;

            const days = {};
            data.list.forEach(item => {
                const date = item.dt_txt.split(" ")[0];
                if (!days[date] && item.dt_txt.includes("12:00:00")) {
                    days[date] = item;
                }
            });

            let count = 0;
            for (const date in days) {
                if (count >= 4) break; 
                const day = days[date];
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                const formattedDate = new Date(date).toLocaleDateString('en-US', options);
                const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

                weatherInfo += `
                    <div class="weather-day">
                        <div class="date">${formattedDate}</div>
                        <img src="${iconUrl}" alt="${day.weather[0].description}">
                        <div class="details">
                            <p>Temperature: ${day.main.temp}°</p>
                            <p>Feels Like: ${day.main.feels_like}°</p>
                            <p>Weather: ${day.weather[0].description}</p>
                            <p>Humidity: ${day.main.humidity}%</p>
                        </div>
                    </div>
                `;
                count++;
            }

            weatherInfo += `</div>`;
            document.getElementById('weather').innerHTML = weatherInfo;
        } else {
            document.getElementById('weather').innerHTML = `<p>City not found: ${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('weather').innerHTML = `<p>Error fetching data</p>`;
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

async function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiKey = '3891e2033b69a8cc4354ed18fba76873';
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}&lang=en`;

            document.getElementById('weather').innerHTML = '';
            document.getElementById('loader').style.display = 'block';

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data);

                if (data.cod === "200") {
                    let weatherInfo = `<h2>5-Day Forecast for ${data.city.name}</h2><div class="forecast">`;

                    const days = {};
                    data.list.forEach(item => {
                        const date = item.dt_txt.split(" ")[0];
                        if (!days[date] && item.dt_txt.includes("12:00:00")) {
                            days[date] = item;
                        }
                    });

                    for (const date in days) {
                        const day = days[date];
                        const options = { weekday: 'long', month: 'long', day: 'numeric' };
                        const formattedDate = new Date(date).toLocaleDateString('en-US', options);
                        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

                        weatherInfo += `
                            <div class="weather-day">
                                <div class="date">${formattedDate}</div>
                                <img src="${iconUrl}" alt="${day.weather[0].description}">
                                <div class="details">
                                    <p>Temperature: ${day.main.temp}°</p>
                                    <p>Feels Like: ${day.main.feels_like}°</p>
                                    <p>Weather: ${day.weather[0].description}</p>
                                    <p>Humidity: ${day.main.humidity}%</p>
                                </div>
                            </div>
                        `;
                    }

                    weatherInfo += `</div>`;
                    document.getElementById('weather').innerHTML = weatherInfo;
                } else {
                    document.getElementById('weather').innerHTML = `<p>City not found: ${data.message}</p>`;
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('weather').innerHTML = `<p>Error fetching data</p>`;
            } finally {
                document.getElementById('loader').style.display = 'none';
            }
        }, (error) => {
            document.getElementById('weather').innerHTML = `<p>Error getting geolocation</p>`;
        });
    } else {
        document.getElementById('weather').innerHTML = `<p>Geolocation not supported by this browser.</p>`;
    }
}

function setTemperatureUnit(unit) {
    currentUnit = unit;
    getWeather();
}

async function suggestCities() {
    const input = document.getElementById('city').value;
    const suggestionsContainer = document.getElementById('suggestions');

    if (input.length > 2) {
        const apiKey = '3891e2033b69a8cc4354ed18fba76873'; 
        const url = `https://api.openweathermap.org/data/2.5/find?q=${input}&appid=${apiKey}&units=${currentUnit}&lang=en`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const suggestions = data.list.map(city => `<div class="suggestion-item">${city.name}</div>`).join('');

            if (suggestions) {
                suggestionsContainer.innerHTML = suggestions;
                suggestionsContainer.style.display = 'block'; 
            } else {
                suggestionsContainer.innerHTML = '<p>No suggestions</p>';
                suggestionsContainer.style.display = 'block';
            }

            // Add click event listeners to each suggestion
            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    document.getElementById('city').value = e.target.textContent;
                    getWeather(); // Fetch weather for selected city
                    suggestionsContainer.innerHTML = ''; // Clear suggestions
                    suggestionsContainer.style.display = 'none'; // Hide suggestions
                });
            });
        } catch (error) {
            console.error(error);
            suggestionsContainer.innerHTML = '<p>Error loading data</p>';
            suggestionsContainer.style.display = 'block'; // Show error message
        }
    } else {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none'; // Hide suggestions if input is short
    }
}

document.addEventListener('click', function(event) {
    const suggestionsContainer = document.getElementById('suggestions');
    if (!event.target.closest('.search')) { // Close suggestions if clicked outside
        suggestionsContainer.style.display = 'none';
    }
});
