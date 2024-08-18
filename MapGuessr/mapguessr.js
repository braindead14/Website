'use strict';

let globalCountryName = ""; // Global variable to store the country name

document.addEventListener("DOMContentLoaded", function() {
    // Ensure the DOM is fully loaded before attaching listeners
    setupEventListeners();
    draw();
});

function draw() {
    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    const targetSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6);
    const randomCountry = Math.floor(Math.random() * 251);       // Random number between [0, 251]

    ctx.canvas.width  = targetSize;
    ctx.canvas.height = ctx.canvas.width;

    // ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#21424c";
    
    fetch('country_shapes.json')                                        // Length: 252 (=> 0 - 251)
        .then(response => response.json())
        .then(data => {
            handleData(ctx, data, targetSize, randomCountry); 
            globalCountryName = data[randomCountry]["cntry_name"];

            fillDropdown(data);
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function setupEventListeners() {
    const textInputGuess = document.getElementById("guess");
    const skipButton = document.getElementById("skipButton");
    const nextButton = document.getElementById("nextButton");

    // Add event listeners
    textInputGuess.addEventListener("keypress", guessHandler);
    skipButton.addEventListener("click", skipButtonHandler);
    nextButton.addEventListener("click", nextButtonHandler);
}

function handleData(ctx, data, targetSize, code) {
    // const countryNameDiv = document.getElementById("countryName");

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
    // Reset input field text
    const textInputGuess = document.getElementById("guess");
    textInputGuess.value = "";

    // Show right answer
    const guessResultDiv = document.getElementById("guessResult");
    guessResultDiv.innerText = "The country was " + globalCountryName + "!";

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
        verifyGuess();
    }
}

function verifyGuess() {
    const guessResultDiv = document.getElementById("guessResult");
    //let textInputGuess = evt.currentTarget.value;
    let textInputGuess = document.getElementById("guess").value;

    if (textInputGuess.localeCompare(globalCountryName, undefined, { sensitivity: 'accent' }) === 0) {
        guessResultDiv.innerText = "Correct! You get an extra brownie point";
        document.getElementById("nextButton").style.visibility = "visible";
    } else {
        guessResultDiv.innerText = "Wrong answer, try again";
    }
}

function dropdownButtonHandler(countryName) {
    // Fill in the textbox
    const textInputGuess = document.getElementById("guess");
    textInputGuess.value = countryName;

    // Trigger the verifyGuess function
    verifyGuess();
}

function dropdownFilterFunction(evt) {
    // The value in the text box
    const filter = evt.currentTarget.value.toUpperCase();
    const myDropdownDiv = document.getElementById("myDropdown");
    const a = myDropdownDiv.getElementsByTagName("a");

    // Display at most 5 entries
    let numberOfElements = Math.min(a.length, 5);
    let amountOfResultsShown = 0;

    for (let i = 0; i < a.length; i++) {
        const txtValue = a[i].textContent || a[i].innerText;     
        if (txtValue.toUpperCase().includes(filter)) {
            a[i].style.display = "";
            amountOfResultsShown++;
        } else {
            a[i].style.display = "none";
        }

        if (amountOfResultsShown >= numberOfElements)
            break;
    }
}

function fillDropdown(data) {
    const myDropdownDiv = document.getElementById("myDropdown");
    // Clear all previous results
    myDropdownDiv.innerHTML = "";

    // Fill all countries
    for (let i = 0; i < data.length; i++) {
        let name = data[i]["cntry_name"].toString();

        myDropdownDiv.innerHTML += `<a href="javascript:void(0)" onclick="dropdownButtonHandler('${name}')">${name}<br></a>`;
    }

    // Set them all invisible
    const a = myDropdownDiv.getElementsByTagName("a");
    for (let i = 0; i < a.length; i++) {
        a[i].style.display = "none";
    }
}
