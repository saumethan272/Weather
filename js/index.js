// Variables
let timeTempPairs;

// ------------------ Function to weather ------------------ 
function getWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&models=ukmo_seamless`;

    $.getJSON(url, weatherData => {
        timeTempPairs = [];

        if (weatherData.hourly?.time && weatherData.hourly?.temperature_2m) {
            weatherData.hourly.time.forEach((unformattedTime, index) => {
                const temperature = weatherData.hourly.temperature_2m[index];
                const [date, time] = unformattedTime.split("T");

                timeTempPairs.push({ date, time, temperature });
            });
        } 
        displayWeather();
    });
}

function displayWeather() {
    $(".weatherData").empty(); 

    timeTempPairs.forEach(pair => {
        $(".weatherData").append(
            `<p>Date: ${pair.date}, Time: ${pair.time}, Temp: ${pair.temperature}°C</p>`
        );
    });
}

$(document).ready(function () {
    $("#searchData").on("click", function () {
        // get lat and lon
        const latitude = $("#LatitudeForm").val();
        const longitude = $("#LongitudeForm").val();

        // Validate inputs
        if (!latitude || !longitude) {
            alert("Please enter both latitude and longitude.");
            return;
        }

        getWeather(latitude, longitude);
    });
});