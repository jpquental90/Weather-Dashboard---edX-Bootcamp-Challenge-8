let searchForm = $('#search-form');
let historyPanel = $('.list-group');

function loadSavedCities() {
    let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
    savedCities.forEach(city => addCityButton(city));
}

function addCityButton(city) {
    let button = $('<button>').text(city).addClass('city-button');
    historyPanel.append(button);
    button.on('click', function () {
        $('#search-input').val(city);
        searchForm.submit();
    });
}

function saveCity(city) {
    let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];

    if (!savedCities.includes(city)) {
        savedCities.push(city);
        localStorage.setItem('savedCities', JSON.stringify(savedCities));
        addCityButton(city);
    }
}


function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

function formatUnixTimestamp(unixTimestamp) {
    let date = new Date(unixTimestamp * 1000);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
}

function displayWeatherInfo(data) {

        let currentWeather = $('#today');

        let cityName = data.city.name;
        console.log(cityName);

        let currentDate = formatUnixTimestamp(data.list[0].dt);

        let iconCode = data.list[0].weather[0].icon;
        let iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

        let titleContainer = $('<div>').addClass('title-container');

        let titleCity = $('<h2>').text(cityName + ' (' + currentDate + ')');
        titleContainer.append(titleCity);

        let weatherIcon = $('<img>').attr('src', iconUrl).attr('alt', 'Weather Icon');
        titleContainer.append(weatherIcon);

        currentWeather.append(titleContainer);

        let tempDataKelvin = data.list[0].main.temp;
        let tempDataCelsius = kelvinToCelsius(tempDataKelvin);
        console.log(tempDataCelsius);
        let currentTemperature = $('<p>').text('Temp.: ' + tempDataCelsius.toFixed(2) + '°C')
        currentWeather.append(currentTemperature);

        let windData = data.list[0].wind.speed;
        let currentWind = $('<p>').text('Wind: ' + windData + ' KPH')
        console.log(currentWind);
        currentWeather.append(currentWind);

        let humidityData = data.list[0].main.humidity;
        let currentHumidity = $('<p>').text('Humidity: ' + humidityData + '%')
        currentWeather.append(currentHumidity);
}

function submitSearch(event) {
    event.preventDefault();
    let search = $('#search-input').val().trim();
    console.log(search);

    let weatherKey = 'bf1c320ceaab99952592bf850ff3e6d2';
    let queryURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + search + '&appid=' + weatherKey;

    fetch(queryURL)
        .then(response => response.json())
        .then(data => {
            console.log("Weather Data:", data);

            displayWeatherInfo(data);

            saveCity(search);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

loadSavedCities();

searchForm.submit(submitSearch);




