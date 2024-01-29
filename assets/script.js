$(document).ready(function () {
    let searchForm = $('#search-form');
    let historyPanel = $('.list-group');
    let clearHistoryButton = $('<button>').text("Clear history").addClass('clear-button btn bg-dark');
    let cityButtonsContainer = $('<div>').addClass('city-buttons-container');
    let searchInput = $('#search-input');
    let todaySection = $('#today');
    let forecastSection = $('.forecast-container');

    function loadSavedCities() {
        let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
        savedCities.forEach(city => addCityButton(city.name));
    }

    function addCityButton(cityName) {
        cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
        let button = $('<button>').text(cityName).addClass('city-button btn bg-dark-subtle');

        if (!cityButtonsContainer.find(`button:contains("${cityName}")`).length) {
            cityButtonsContainer.append(button);
            button.on('click', function () {
                $('#search-input').val(cityName);
                searchForm.submit();
            });
        }
    }

    function saveCity(city) {
        let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];

        if (!savedCities.some(savedCity => savedCity.name === city)) {
            savedCities.push({ name: city });
            localStorage.setItem('savedCities', JSON.stringify(savedCities));
            addCityButton(city);
        }
    }

    function clearHistory() {
        cityButtonsContainer.empty();
        localStorage.removeItem('savedCities');
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
        todaySection.empty();
        cityName = data.city.name;
        console.log(cityName);

        let currentDate = formatUnixTimestamp(data.list[0].dt);
        let iconCode = data.list[0].weather[0].icon;
        let iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

        let titleContainer = $('<div>').addClass('title-container');
        let titleCity = $('<h3>').text(cityName + ' (' + currentDate + ')');
        titleContainer.append(titleCity);

        let weatherIcon = $('<img>').attr('src', iconUrl).attr('alt', 'Weather Icon');
        titleContainer.append(weatherIcon);

        todaySection.append(titleContainer);

        let tempDataKelvin = data.list[0].main.temp;
        let tempDataCelsius = kelvinToCelsius(tempDataKelvin);
        let currentTemperature = $('<p>').text('Temp.: ' + tempDataCelsius.toFixed(2) + '°C');
        todaySection.append(currentTemperature);

        let windData = data.list[0].wind.speed;
        let currentWind = $('<p>').text('Wind: ' + windData + ' KPH');
        todaySection.append(currentWind);

        let humidityData = data.list[0].main.humidity;
        let currentHumidity = $('<p>').text('Humidity: ' + humidityData + '%');
        todaySection.append(currentHumidity);
        
        forecastSection.empty();
        let forecastDaysAdded = 0;

        const nextDay = new Date(data.list[0].dt * 1000);
        nextDay.setDate(nextDay.getDate() + 1);

        // Create a container for the forecast title and cards
        const forecastContainer = $('<div>').addClass('forecast-container');

        // Add the "5-day Forecast" title to the container
        const forecastTitle = $('<h4>').text("5-day Forecast:");
        $('#forecast').prepend(forecastTitle);

        for (let i = 0; i < data.list.length && forecastDaysAdded < 5; i++) {
            const forecastData = data.list[i];
            const forecastDate = formatUnixTimestamp(forecastData.dt);

            if (forecastDate === formatUnixTimestamp(nextDay.getTime() / 1000)) {
                const forecastTemperatureKelvin = forecastData.main.temp;
                const forecastTemperatureCelsius = kelvinToCelsius(forecastTemperatureKelvin);

                let forecastCard = $('<div>').addClass('col-md-2 forecast-card card-body');
                let forecastDateElement = $('<h5>').text(forecastDate);
                let forecastTemperatureElement = $('<p>').text('Temp.: ' + forecastTemperatureCelsius.toFixed(2) + '°C');

                forecastCard.append(forecastDateElement, forecastTemperatureElement);
                forecastContainer.append(forecastCard);

                forecastDaysAdded++;
                nextDay.setDate(nextDay.getDate() + 1);
            }
        }

        // Append the forecast container to the forecast section
        forecastSection.append(forecastContainer);
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

                searchInput.val('');
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

    loadSavedCities();

    searchForm.submit(submitSearch);

    // Append the clearHistoryButton and cityButtonsContainer
    historyPanel.append(clearHistoryButton);
    historyPanel.append(cityButtonsContainer);

    clearHistoryButton.on('click', clearHistory);
});