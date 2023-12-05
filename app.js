const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/', (req, res) => {
    const city = req.body.city.toUpperCase();
    const apiKey = "630c0495854508fc7e8c5a56022123a4";
    const unit = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;


    https.get(url, (response) => {
        let rawData = '';
        response.on('data', (chunk) => {
            rawData += chunk;
        })
        response.on('end', () => {
            try {
                const weatherData = JSON.parse(rawData);
                if (!weatherData || weatherData.cod == "404") {
                    throw new Error("Invalid weather data recieved");
                }
                fs.readFile(__dirname + '/index.html', 'utf-8', (err, fileContent) => {
                    if (err)
                        console.log(err);
                    else {
                        const temp = weatherData.main.temp;
                        const description = weatherData.weather[0].description.toUpperCase();
                        const icon = "https://openweathermap.org/img/wn/" + weatherData.weather[0].icon + '@2x.png';
                        const htmlContent = `
                          ${fileContent}
                          <div id="weather-result">
                   <h1>${city}   <span id="temp">${temp}°C<span></h1>
                   <img src='${icon}'>
                   <h2>${description}</h2>
                   </div
                   <footer>&copy; ashfiqulalam86@gmail.com | 2023</footer>
                   <script>
                   document.getElementById('foot').style.display='none';
                   </script>
                                        `
                        res.send(htmlContent);
                    }
                })
            } catch (err) {
                console.log(err + '.Not a valid city name.');
                fs.readFile(__dirname + '/index.html', 'utf8', (err, fileContent) => {
                    if (err) {
                        console.error('Error reading index.html:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    const icon = 'https://static.vecteezy.com/system/resources/previews/027/669/104/non_2x/looking-on-city-from-terrace-black-white-error-404-flash-message-woman-under-umbrella-monochrome-website-landing-page-ui-design-not-found-cartoon-dreamy-vibes-flat-outline-illustration-vector.jpg'
                    const htmlContent = `
                                       ${fileContent}
                                       <div id="weather-result">
                                       <img src='${icon}'>
                                       <h2>City Not Found! Please try another...</h2>
                                       </div
                                       <footer>&copy; ashfiqulalam86@gmail.com | 2023</footer>
                                       <script>
                                       document.getElementById('foot').style.display='none';
                                       </script>
                                                           `;
                    res.send(htmlContent);
                })
            }
        });
    })


});
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}..`);
});