$(document).ready(function () {

// Setting variables
    let searchForm = $('#search-form');
    let historyPanel = $('.list-group');
    let clearHistoryButton = $('<button>').text("Clear history").addClass('clear-button btn bg-dark');
    let cityButtonsContainer = $('<div>').addClass('city-buttons-container');
    let searchInput = $('#search-input');
    let todaySection = $('#today');
    let forecastSection = $('#forecast');

// Function to load saved cities from local storage, no more than 5 in total
    function loadSavedCities() {
        let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];

        cityButtonsContainer.empty();

        for (let i = 0; i < savedCities.length; i++) {
            let cityName = savedCities[i].name;

            addCityButton(cityName);

            if (cityButtonsContainer.children().length >= 5) {
                break;
            }
        }
    }

// Function to generate and add a button with the name of the city
// Remove the oldest button if more than 5 buttons are present
    function addCityButton(cityName) {
        let button = $('<button>').text(cityName).addClass('city-button btn bg-dark-subtle');

        if (!cityButtonsContainer.find(`button:contains("${cityName}")`).length) {

            if (cityButtonsContainer.children().length >= 5) {
                cityButtonsContainer.children().last().remove();
            }

            cityButtonsContainer.append(button);
            button.on('click', function () {
                $('#search-input').val(cityName);
                searchForm.submit();
            });
        }
    }

// Function to save the user searches in local storage
    function saveCity(city) {
        let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
    
        savedCities = savedCities.filter(savedCity => savedCity.name !== city);
    
        savedCities.unshift({ name: city });

        savedCities = savedCities.slice(0, 5);
    
        localStorage.setItem('savedCities', JSON.stringify(savedCities));
    
        loadSavedCities();
    }

// Function to clear city search history (to be called when a button is clicked)
    function clearHistory() {
        cityButtonsContainer.empty();
        localStorage.removeItem('savedCities');
    }

// Function to convert the temperature displayed in the weather API object to Celsius
    function kelvinToCelsius(kelvin) {
        return kelvin - 273.15;
    }

// Function to convert the UNIX timestamp into human-readable date string in the format "DD/MM/YYYY"
    function formatUnixTimestamp(unixTimestamp) {
        let date = new Date(unixTimestamp * 1000);
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

// Function to display the weather information (today's weather and 5 days forecast), using data from the weather API
    function displayWeatherInfo(data) {
        todaySection.empty();
        let cityName = data.city.name; 
        console.log(cityName);

        saveCity(cityName);

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

        todaySection.css('border', '1px solid black')

        forecastSection.empty();

        const forecastTitle = $('<h4>').text("5-day Forecast:").addClass('forecast-title');
        forecastSection.append(forecastTitle);

        let forecastDaysAdded = 0;

        const nextDay = new Date(data.list[0].dt * 1000);
        nextDay.setDate(nextDay.getDate() + 1);

        for (let i = 0; i < data.list.length && forecastDaysAdded < 5; i++) {
            const forecastData = data.list[i];
            const forecastDate = formatUnixTimestamp(forecastData.dt);

            if (forecastDate === formatUnixTimestamp(nextDay.getTime() / 1000)) {
                const forecastTemperatureKelvin = forecastData.main.temp;
                const forecastTemperatureCelsius = kelvinToCelsius(forecastTemperatureKelvin);

                let iconCodeForecast = forecastData.weather[0].icon;

                let iconUrlForecast = `http://openweathermap.org/img/wn/${iconCodeForecast}.png`;

                let forecastCard = $('<div>').addClass('col-md-2 forecast-card card-body');
                let forecastDateElement = $('<h5>').text(forecastDate).css('font-weight', '700');

                let weatherIconForecast = $('<img>').attr('src', iconUrlForecast).attr('alt', 'Weather Icon');

                let forecastTemperatureElement = $('<p>').text('Temp.: ' + forecastTemperatureCelsius.toFixed(2) + '°C');

                let forecastWindData = forecastData.wind.speed;
                let forecastWindElement = $('<p>').text('Wind: ' + forecastWindData + ' KPH');

                let forecastHumidityData = forecastData.main.humidity;
                let forecastHumidityElement = $('<p>').text('Humidity: ' + forecastHumidityData + '%');

                forecastCard.append(forecastDateElement, weatherIconForecast, forecastTemperatureElement, forecastWindElement, forecastHumidityElement);
                forecastSection.append(forecastCard);

                forecastDaysAdded++;
                nextDay.setDate(nextDay.getDate() + 1);
            }
        }
    }

// Function to allow user to submit a search using the text input field, linking this with the weather API and calling of the displayWeatherInfo function
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

                searchInput.val('');
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

// Calling functions of loadSavedCities and submitSearch (the latter upon submitting the search term in the input field)
    loadSavedCities();

    searchForm.submit(submitSearch);

// Adding the search and clear buttons to the history panel
    historyPanel.append(clearHistoryButton);
    historyPanel.append(cityButtonsContainer);

// Clear history upon click of the button (I added this to help with the app development, but decided it could be left as another potentially useful functionality for the user)
    clearHistoryButton.on('click', clearHistory);
});