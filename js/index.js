// Variables
let timeTempPairs;
let latitude;
let longitude;

// ------------------ Function to weather ------------------ 
function getWeather() {
    if (latitude !== undefined && longitude !== undefined) {
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
    
}

// ------------------ Function to display weather data ------------------ 
function displayWeather() {
    $(".weatherData").empty(); 
    $(".dataTitle").empty(); 

    $(".dataTitle").append(`<h4>Weather data</h4>`);

    timeTempPairs.forEach(pair => {
        
        $(".weatherData").append(
            `<p>Date: ${pair.date}, Time: ${pair.time}, Temp: ${pair.temperature}°C</p>`
        );
    });
}

// ------------------ Function to get user's geolocation using async/await ------------------
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                    resolve();
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    reject(error);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
            reject(new Error("Geolocation not supported"));
        }
    });
}

// ------------------ Document Ready Logic ------------------
$(document).ready(function () {
    $("#searchData").on("click", function () {
        // get lat and lon
        latitude = $("#LatitudeForm").val();
        longitude = $("#LongitudeForm").val();

        // Validate inputs
        if (!latitude || !longitude) {
            alert("Please enter both latitude and longitude.");
            return;
        }

        getWeather();
    });

    $("#getLocation").on("click", async function () {
        try {
            await getUserLocation();
            await getWeather();
        } catch (error) {
            alert("Could not fetch user location.");
        }
    });
});