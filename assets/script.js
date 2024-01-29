let searchForm = $('#search-form');

searchForm.submit(submitSearch);

function submitSearch (event) {
    event.preventDefault();
    let city = $('#search-input').val().trim();
    console.log(city);

    let APIKey = "ec65626f17967dd632fbed28f71be01e";
    
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid" + APIKey;
}






