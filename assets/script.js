let searchForm = $('#search-form');

function submitSearch (event) {
    event.preventDefault();
    var search = $('#search-input').val().trim();
    console.log(search);
}

$('#search-form').on('click', submitSearch);