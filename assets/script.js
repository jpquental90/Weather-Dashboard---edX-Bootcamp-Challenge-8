let searchForm = $('#search-form');

function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

function submitSearch (event) {
    event.preventDefault();
    let search = $('#search-input').val().trim();
    console.log(search);

    let weatherKey = 'bf1c320ceaab99952592bf850ff3e6d2';
    let queryURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + search + '&appid=' + weatherKey;

    fetch(queryURL)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log("Weather Data:", data);
        let currentWeather = $('#today');
        let cityName = data.city.name;
        console.log(cityName);
        let titleCity = $('<h2>').text(cityName);
        currentWeather.append(titleCity);
        let tempDataKelvin = data.list[0].main.temp;
        let tempDataCelsius = kelvinToCelsius(tempDataKelvin);
        console.log(tempDataCelsius);
        let currentTemperature = $('<p>').text("Temp.: " + tempDataCelsius.toFixed(2) + "°C")
        currentWeather.append(currentTemperature);
    })
}

searchForm.submit(submitSearch);




