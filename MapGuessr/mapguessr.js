'use strict';

function draw() {
    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    /*
    fetch('country_shapes_simplified.json')
        .then(response => response.json())
        .then(data => logData(data))
        .catch(error => console.error('Error fetching JSON:', error));
    */
    
    fetch('country_shapes.json')                                        // Length: 252 (=> 0 - 251)
        .then(response => response.json())
        .then(data => logData(ctx, data))
        .catch(error => console.error('Error fetching JSON:', error));

    
     
}

function logData(ctx, data) {
    const len = Object.keys(data).length;
    const code = 1;

    // Lets plot Belgium
    console.log(data[code]);
    plotShape(ctx, data[code]["geo_shape"]["geometry"]["coordinates"][0]);
}

function plotShape(ctx, points) {
    // TODO: handle multipolygons!! and preserve aspact ratio

    const len = points.length;
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#21424c";
    
    let min_lon = points[0][0];
    let max_lon = points[0][0];
    let min_lat = points[0][1];
    let max_lat = points[0][1];

    // Get min and max
    for(let i = 0; i < points.length; i++){
        if(points[i][0] < min_lon) {
            min_lon = points[i][0];
        }

        if(points[i][1] < min_lat) {
            min_lat = points[i][1];
        }

        if(points[i][0] > max_lon) {
            max_lon = points[i][0];
        }

        if(points[i][1] > max_lat) {
            max_lat = points[i][1];
        }
    }

    console.log(min_lon);
    console.log(min_lat);
    console.log(max_lon);
    console.log(max_lat);

    // Rescale
    for(let i = 0; i < points.length; i++){
        points[i][0] = 150*(points[i][0] - min_lon)/(max_lon - min_lon);
        points[i][1] = 150 - 150*(points[i][1] - min_lat)/(max_lat - min_lat);
    }

    console.log(points);

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for(let i = 0; i < len; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }

    ctx.fill();  
}

window.addEventListener("load", draw);
