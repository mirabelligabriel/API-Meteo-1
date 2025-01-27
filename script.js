const apiUrl = 'https://api.open-meteo.com/v1/forecast';

document.getElementById('cityForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('cityInput').value;
    console.log('Città inserita:', city);  // Debug
    fetchWeather(city);
});

async function fetchWeather(city) {
    try {
        console.log('Inizio ricerca città...');  // Debug
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const locationData = await response.json();
        console.log('Dati posizione:', locationData);  // Debug
        
        if (locationData.results && locationData.results.length > 0) {
            const { latitude, longitude } = locationData.results[0];
            const weatherResponse = await fetch(`${apiUrl}?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Rome&lang=it`);
            const weatherData = await weatherResponse.json();
            console.log('Dati meteo:', weatherData);  // Debug
            displayWeather(weatherData);
        } else {
            displayError('Città non trovata.');
        }
    } catch (error) {
        console.error('Errore nel recupero dei dati meteo:', error);
        displayError('Errore nel recupero dei dati meteo.');
    }
}

function displayWeather(data) {
    const weatherDiv = document.getElementById('weatherResults');
    weatherDiv.innerHTML = '';  // Pulisce i risultati precedenti
    console.log('Dati da visualizzare:', data);  // Debug

    if (data.current_weather && data.daily) {
        const { temperature, weathercode } = data.current_weather;
        const { temperature_2m_max, temperature_2m_min, time, weathercode: dailyWeatherCodes } = data.daily;

        // Card meteo attuale
        let weatherHTML = `
            <div class="col-md-12">
                <h2>Meteo attuale</h2>
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Temperatura attuale</h5>
                        <p class="card-text">Adesso: ${temperature}°C</p>
                        <p class="card-text">Condizioni: ${getWeatherDescription(weathercode)} <img id="icone" src="icons/${getWeatherIcon(weathercode)}" alt="Icona meteo"></p>
                    </div>
                </div>
            </div>
        `;

        // Aggiungi le previsioni settimanali (distaccate)
        weatherHTML += `<div class="col-md-12"><h2>Previsioni settimanali</h2></div>`;
        for (let i = 0; i < time.length; i++) {
            weatherHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${new Date(time[i]).toLocaleDateString()}</h5>
                            <p>Max: ${temperature_2m_max[i]}°C</p>
                            <p>Min: ${temperature_2m_min[i]}°C</p>
                            <p>Condizioni: ${getWeatherDescription(dailyWeatherCodes[i])} <img id="icone" src="icons/${getWeatherIcon(dailyWeatherCodes[i])}" alt="Icona meteo"></p>
                        </div>
                    </div>
                </div>
            `;
        }

        weatherDiv.innerHTML = weatherHTML;
    } else {
        displayError('Errore nel recupero dei dati meteo.');
    }
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Cielo sereno',
        1: 'Prevalentemente sereno',
        2: 'Parzialmente nuvoloso',
        3: 'Nuvoloso',
        45: 'Nebbia',
        48: 'Nebbia con brina',
        51: 'Pioviggine leggera',
        53: 'Pioviggine moderata',
        55: 'Pioviggine densa',
        56: 'Pioviggine congelata leggera',
        57: 'Pioviggine congelata densa',
        61: 'Pioggia leggera',
        63: 'Pioggia moderata',
        65: 'Pioggia intensa',
        66: 'Pioggia congelata leggera',
        67: 'Pioggia congelata intensa',
        71: 'Neve leggera',
        73: 'Neve moderata',
        75: 'Neve intensa',
        77: 'Granelli di neve',
        80: 'Rovesci di pioggia leggeri',
        81: 'Rovesci di pioggia moderati',
        82: 'Rovesci di pioggia violenti',
        85: 'Rovesci di neve leggeri',
        86: 'Rovesci di neve violenti',
        95: 'Temporale leggero o moderato',
        96: 'Temporale con grandine piccola',
        99: 'Temporale con grandine grande'
    };
    return descriptions[code] || 'Condizioni sconosciute';
}

function getWeatherIcon(code) {
    const icons = {
        0: 'sunny.png',
        1: 'mostly_sunny.png',
        2: 'partly_cloudy.png',
        3: 'cloudy.png',
        45: 'fog.png',
        48: 'frost.png',
        51: 'light_drizzle.png',
        53: 'moderate_drizzle.png',
        55: 'dense_drizzle.png',
        56: 'light_freezing_drizzle.png',
        57: 'dense_freezing_drizzle.png',
        61: 'light_rain.png',
        63: 'moderate_rain.png',
        65: 'heavy_rain.png',
        66: 'light_freezing_rain.png',
        67: 'heavy_freezing_rain.png',
        71: 'light_snow.png',
        73: 'moderate_snow.png',
        75: 'heavy_snow.png',
        77: 'snow_grains.png',
        80: 'light_rain_showers.png',
        81: 'moderate_rain_showers.png',
        82: 'violent_rain_showers.png',
        85: 'light_snow_showers.png',
        86: 'violent_snow_showers.png',
        95: 'thunderstorm.png',
        96: 'thunderstorm_with_small_hail.png',
        99: 'thunderstorm_with_large_hail.png'
    };
    return icons[code] || 'unknown.png';
}

function displayError(message) {
    const weatherDiv = document.getElementById('weatherResults');
    weatherDiv.innerHTML = `<div class="col-12"><p class="text-danger">${message}</p></div>`;
}
