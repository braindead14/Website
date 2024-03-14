'use strict';

function draw() {
    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    const targetSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
    const randomCountry = Math.floor(Math.random() * 251);       // Random number between [0, 251]
    let countryName;

    ctx.canvas.width  = targetSize;
    ctx.canvas.height = ctx.canvas.width;

    // ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#21424c";
    
    fetch('country_shapes.json')                                        // Length: 252 (=> 0 - 251)
        .then(response => response.json())
        .then(data => {
            handleData(ctx, data, targetSize, randomCountry); 
            countryName = data[randomCountry]["cntry_name"];

            const textInputGuess = document.getElementById("guess");
            const skipButton = document.getElementById("skipButton");
            textInputGuess.countryName = countryName;
            skipButton.countryName = countryName;
        })
        .catch(error => console.error('Error fetching JSON:', error));
    
    const textInputGuess = document.getElementById("guess");
    const skipButton = document.getElementById("skipButton");
    const nextButton = document.getElementById("nextButton");

    textInputGuess.addEventListener("keypress", guessHandler);
    skipButton.addEventListener("click", skipButtonHandler);
    nextButton.addEventListener("click", nextButtonHandler);
}

function handleData(ctx, data, targetSize, code) {
    const countryNameDiv = document.getElementById("countryName");

    if (data[code]["geo_shape"]["geometry"]["type"] == "Polygon") {
        plotPolygon(ctx, data[code]["geo_shape"]["geometry"]["coordinates"][0], targetSize);
    } else {
        plotMultipolygon(ctx, data[code]["geo_shape"]["geometry"]["coordinates"], targetSize);
    }
    // countryNameDiv.innerText = data[code]["cntry_name"];
}

function plotPolygon(ctx, points, targetSize) {
    const len = points.length;

    const minPoints = getMinOfPoints(points);
    const maxPoints = getMaxOfPoints(points);
    
    const min_lon = minPoints[0];
    const max_lon = maxPoints[0];
    const min_lat = minPoints[1];
    const max_lat = maxPoints[1];

    const deltaLat = max_lat - min_lat;
    const deltaLon = max_lon - min_lon;

    const aspectRatio = deltaLon / deltaLat;          // lon = x, lat = y

    const scaleFactor = computeScaleFactor(deltaLat, deltaLon, targetSize);

    // Rescale
    for (let i = 0; i < points.length; i++) {
        const lon = points[i][0];
        const lat = points[i][1];
    
        // Apply the scaling factor
        points[i][0] = (lon - min_lon) * scaleFactor;
        points[i][1] = targetSize - (lat - min_lat) * scaleFactor;
    }

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for(let i = 0; i < len; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }

    ctx.fill();  
}

function plotMultipolygon(ctx, points, targetSize) {
    let min_lon_arr = [];
    let max_lon_arr = [];
    let min_lat_arr = [];
    let max_lat_arr = [];

    for (let i = 0; i < points.length; i++) {
        const minPoints = getMinOfPoints(points[i][0]);
        const maxPoints = getMaxOfPoints(points[i][0]);

        min_lon_arr.push(minPoints[0]);
        max_lon_arr.push(maxPoints[0]);
        min_lat_arr.push(minPoints[1]);
        max_lat_arr.push(maxPoints[1]);
    }

    const min_lon = Math.min(...min_lon_arr);
    const max_lon = Math.max(...max_lon_arr);
    const min_lat = Math.min(...min_lat_arr);
    const max_lat = Math.max(...max_lat_arr);

    const deltaLat = max_lat - min_lat;
    const deltaLon = max_lon - min_lon;

    const aspectRatio = deltaLon / deltaLat;          // lon = x, lat = y

    const scaleFactor = computeScaleFactor(deltaLat, deltaLon, targetSize);

    // Rescale
    for (let j = 0; j < points.length; j++) {
        for (let i = 0; i < points[j][0].length; i++) {
            const lon = points[j][0][i][0];
            const lat = points[j][0][i][1];
        
            // Apply the scaling factor
            points[j][0][i][0] = (lon - min_lon) * scaleFactor;
            points[j][0][i][1] = targetSize - (lat - min_lat) * scaleFactor;
        }
    }

    for (let j = 0; j < points.length; j++) {
        ctx.beginPath();
        ctx.moveTo(points[j][0][0][0], points[j][0][0][1]);

        for(let k = 0; k < points[j][0].length; k++) {
            ctx.lineTo(points[j][0][k][0], points[j][0][k][1]);
        }

        ctx.fill(); 
    }
}

function getMaxOfPoints(arr) {
    let max_lon = arr[0][0];
    let max_lat = arr[0][1];
    for(let i = 0; i < arr.length; i++){
        if(arr[i][0] > max_lon) {
            max_lon = arr[i][0];
        }

        if(arr[i][1] > max_lat) {
            max_lat = arr[i][1];
        }
    }
    return [max_lon, max_lat];
}

function getMinOfPoints(arr) {
    let min_lon = arr[0][0];
    let min_lat = arr[0][1];
    for(let i = 0; i < arr.length; i++){
        if(arr[i][0] < min_lon) {
            min_lon = arr[i][0];
        }

        if(arr[i][1] < min_lat) {
            min_lat = arr[i][1];
        }
    }
    return [min_lon, min_lat];
}

function computeScaleFactor(deltaLat, deltaLon, targetSize) {
    const aspectRatio = deltaLon / deltaLat;          // lon = x, lat = y

    let scaleFactor;
    if (aspectRatio > 1) {
        // Landscape shape (wider than tall)
        scaleFactor = targetSize / deltaLon;
    } else {
        // Portrait shape (taller than wide)
        scaleFactor = targetSize / deltaLat;
    }

    return scaleFactor;
}

function skipButtonHandler(evt) {
    const countryName = evt.currentTarget.countryName;

    // Reset input field text
    const textInputGuess = document.getElementById("guess");
    textInputGuess.value = "";

    // Show right answer
    const guessResultDiv = document.getElementById("guessResult");
    guessResultDiv.innerText = "The country was " + countryName + "!";

    // Redraw
    draw();
}

function nextButtonHandler() {
    // Reset input field text
    const textInputGuess = document.getElementById("guess");
    textInputGuess.value = "";

    // Reset guess text field
    document.getElementById("guessResult").innerText = "";

    // Reset visibility
    document.getElementById("nextButton").style.visibility = "hidden";

    // Redraw
    draw();
}

function guessHandler(evt) {
    if (evt.key === 'Enter') {
        const guessResultDiv = document.getElementById("guessResult");
        const correctCountry = evt.currentTarget.countryName;
        const textInputGuess = document.getElementById("guess");
        // guessResultDiv.innerText = evt.currentTarget.countryName;

        const guess = textInputGuess.value;

        if (!guess.localeCompare(correctCountry, undefined, { sensitivity: 'accent' })) {
            guessResultDiv.innerText = "Correct! You get an extra brownie point";
            document.getElementById("nextButton").style.visibility = "visible";
        } else {
            guessResultDiv.innerText = "Wrong answer, try again";
        }
    }
}

window.addEventListener("load", draw);
