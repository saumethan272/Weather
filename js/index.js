// ------------------ Function to weather ------------------ 
function getWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&models=ukmo_seamless`;

    $.getJSON(url, weatherData => {
        

        console.log("Full Weather Data:", weatherData);

        const timeTempPairs = [];
        if (weatherData.hourly?.time && weatherData.hourly?.temperature_2m) {
            weatherData.hourly.time.forEach((time, index) => {
                const temperature = weatherData.hourly.temperature_2m[index];
                timeTempPairs.push({ time, temperature });
            });
        } 

        timeTempPairs.forEach(pair => {
            $(".weatherData").append(`<p>Time: ${pair.time}, Temp: ${pair.temperature}°C</p>`);
        });
    });
}

getWeather(51.51147, -0.13078308);
