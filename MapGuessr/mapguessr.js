'use strict';

function draw() {
    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    fetch('country_shapes_simplified.json')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error fetching JSON:', error));

    ctx.beginPath();
    ctx.moveTo(25, 25);
    ctx.lineTo(105, 25);
    ctx.lineTo(25, 105);
    ctx.fill();
}

window.addEventListener("load", draw);
