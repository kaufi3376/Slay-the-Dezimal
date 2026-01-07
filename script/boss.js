
const bossModal = document.getElementById("bossVictoryModal");
const closeModalBtn = document.getElementById("closeModal");

const gameOverModal = document.getElementById("gameOverModal");
const restartModalBtn = document.getElementById("restartModal");

closeModalBtn.onclick = () => {
    bossModal.style.display = "none";
    stopConfetti();
};

// Konfetti Setup
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiParticles = [];
let confettiAnimationId = null;

function resizeCanvas(){
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function startConfetti(){
    confettiParticles = [];
    for(let i=0;i<150;i++){
        confettiParticles.push({
            x: Math.random()*confettiCanvas.width,
            y: Math.random()*confettiCanvas.height- confettiCanvas.height,
            r: Math.random()*6+4,
            d: Math.random()*10+2,
            color: `hsl(${Math.random()*360}, 100%, 50%)`,
            tilt: Math.random()*10-10,
            tiltAngleIncrement: Math.random()*0.07+0.05,
            tiltAngle: 0
        });
    }
    animateConfetti();
}

function animateConfetti(){
    confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p=>{
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.d)+1+2)/2;
        p.x += Math.sin(0.01*p.d);
        p.tilt = Math.sin(p.tiltAngle)*15;

        confettiCtx.beginPath();
        confettiCtx.lineWidth = p.r/2;
        confettiCtx.strokeStyle = p.color;
        confettiCtx.moveTo(p.x + p.tilt + p.r/4, p.y);
        confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r/4);
        confettiCtx.stroke();
    });
    confettiAnimationId = requestAnimationFrame(animateConfetti);
}

function stopConfetti(){
    cancelAnimationFrame(confettiAnimationId);
    confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
}




restartModalBtn.onclick = () => {
    gameOverModal.style.display = "none";
    resetGame();  // Map und Leben zurücksetzen
};