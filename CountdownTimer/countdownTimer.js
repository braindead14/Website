const targetDate = new Date(Date.UTC(2024, 8, 10, 15, 0, 0));   // 5 PM CEST ( = UTC+2)

// Update every 400 ms
// Nyquist rate: minimum sample rate must be 2*f (in this case, f = 1 Hz, thus minimum frequency
// is 2 Hz: 500 ms)
const countdown = setInterval(updateTimer, 400);

function updateTimer() {
    const now = new Date().getTime();   // Current time in ms
    const timeRemaining = targetDate - now;

    // Get HMS
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60) / (1000 * 60)));
    const seconds = Math.floor((timeRemaining % (1000 * 60) / (1000)));

    // Output to the timer element
    // Display in the form of e.g. 30:09:12
    let timer = document.getElementsByClassName("timer")[0]
    timer.innerHTML =
        (hours < 10 ? '0' + hours : hours) + ":" +
        (minutes < 10 ? '0' + minutes : minutes) + ":" +
        (seconds < 10 ? '0' + seconds : seconds);

    // Stop the timer after 00:00:00
    if (timeRemaining < 0) {
        clearInterval(countdown);
        timer.innerHTML = "IT'S HERE";
    }
}
