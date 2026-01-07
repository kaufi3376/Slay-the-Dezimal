
let startTime = null;
let timerInterval = null;


function getElapsedTime() {
    if (!startTime) return "0:00";
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2,'0')}`;
}


function startTimer() {
    if (startTime !== null) return; // Timer läuft bereits
    startTime = Date.now();
    timerInterval = setInterval(updateTimerDisplay, 100); // alle 0,1s aktualisieren
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
function updateTimerDisplay() {
    const now = Date.now();
    const elapsed = now - startTime; // Millisekunden
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    document.getElementById("timer").innerText = `⏱ ${minutes}:${remainingSeconds.toString().padStart(2,'0')}`;
}
