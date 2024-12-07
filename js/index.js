// Variables
let timeTempPairs;
let latitude;
let longitude;
let postcode;

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
            displayWeatherDates();
        });
    }
    
}

function getPostcode() {
    return new Promise((resolve, reject) => {
        const url = `https://findthatpostcode.uk/points/${latitude},${longitude}.json`;
        $.getJSON(url, function (data) {
            if (
                data &&
                data.data &&
                data.data.relationships &&
                data.data.relationships.nearest_postcode &&
                data.data.relationships.nearest_postcode.data
            ) {
                postcode = data.data.relationships.nearest_postcode.data.id;
                console.log(`Nearest Postcode: ${postcode}`);
                resolve(); // Resolve the promise
            } else {
                console.error("Error: Could not retrieve postcode from response data.");
                reject(new Error("Postcode data not found"));
            }
        }).fail(() => {
            reject(new Error("Failed to fetch postcode"));
        });
    });
}


// ------------------ Function to display dates that the forcast is available for ------------------ 
async function displayWeatherDates() {
    // Clear previous data
    $(".dateContainer").empty();
    $(".dataTitle").empty();

    let formatedPostcode = postcode

    if (postcode === undefined) {
        try {
            await getPostcode(); // Wait for the postcode to be fetched
        } catch (error) {
            console.error("Failed to fetch postcode:", error);
        }
    } 
    if (postcode) {
        // Add the title
        formatedPostcode = postcode.toUpperCase();
        const mainPart = formatedPostcode.slice(0, -3); 
        const lastPart = formatedPostcode.slice(-3);
        formatedPostcode = `${mainPart} ${lastPart}`; 
    }
    $(".dataTitle").append(`<h4 id="title">Weather for ${formatedPostcode}</h4>`);

    const dates = [];

    // Add time and temperature data
    timeTempPairs.forEach(pair => {
        if (!dates.includes(pair.date)) {
            dates.push(pair.date);
            
            let formattedDate = pair.date.slice(5);
            const [month, day] = formattedDate.split('-');
            formattedDate = `${day}-${month}`;

            $(".dateContainer").append(`
                <button type="button" id="${pair.date}" class="dateButton">${formattedDate}</button>
            `);
        }
    });
}

// ------------------ Function to display time and temp for coresponing dates ------------------ 
function displayWeather(date) {
    // Clear previous data
    $(".weatherDataContainer").empty()

    timeTempPairs.forEach(pair => {
        if (pair.date === date) {
            $(".weatherDataContainer").append(`
                <div class="weatherEntry">
                    <div class="timeData">${pair.time}</div>
                    <div class="tempData">${pair.temperature}°C</div>
                </div>
            `);
        }
    });
}

// ------------------ Function to get user's geolocation using async/await ------------------
async function getGpsUserLocation() {
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

function getPostcodeUserLocation() {
    if (postcode || postcode.trim() !== "") {
        const url=`https://api.postcodes.io/postcodes/${postcode.trim()}`;

        $.getJSON(url, function(data) {
            if (data.status === 200 && data.result) {
                longitude = data.result.longitude;
                latitude = data.result.latitude;
                
                getWeather();
            }
        }).fail(function (jqXHR) {
            if (jqXHR.status === 404) {
                alert("Postcode not found. Please enter a valid postcode.");
            } else {
                alert("An error occurred while fetching postcode data. Please try again.");
            }
        });
    }
}

// ------------------ Document Ready Logic ------------------
$(document).ready(function () {
    $("#searchData").on("click", function () {
        postcode = $("#postcodeForm").val();

        getPostcodeUserLocation();
    });

    $("#getLocation").on("click", async function () {
        try {
            await getGpsUserLocation();
            await getWeather();
        } catch (error) {
            alert("Could not fetch user location.");
        }
    });

    $(".dateContainer").on("click", "button", function () {
        const date = $(this).attr("id");
        displayWeather(date);

    });
});