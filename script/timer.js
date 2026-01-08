
let startTime = null;
let timerInterval = null;
let accumulatedTime = 0; // Akkumulierte Zeit in Millisekunden


function getElapsedTime() {
    let totalElapsed = accumulatedTime;
    if (startTime) {
        totalElapsed += Date.now() - startTime;
    }
    const seconds = Math.floor(totalElapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2,'0')}`;
}


function startTimer() {
    if (startTime === null) {
        startTime = Date.now();
    }
    // Timer-Intervall starten, falls noch nicht aktiv
    if (!timerInterval) {
        timerInterval = setInterval(updateTimerDisplay, 100); // alle 0,1s aktualisieren
    }
}

function stopTimer() {
    if (startTime) {
        // Akkumuliere die Zeit seit dem letzten Start
        accumulatedTime += Date.now() - startTime;
        startTime = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
function updateTimerDisplay() {
    let totalElapsed = accumulatedTime;
    if (startTime) {
        totalElapsed += Date.now() - startTime;
    }
    const seconds = Math.floor(totalElapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    document.getElementById("timer").innerText = `⏱ ${minutes}:${remainingSeconds.toString().padStart(2,'0')}`;
}
