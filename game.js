const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game State
let animationId;
let score = 0;
let gameSpeed = 3;
let isGameRunning = false;
let frames = 0;

// Set canvas size
function resizeCanvas() {
    // Use parent container dimensions
    const container = document.getElementById('canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 12,
    color: 'rgb(0, 179, 134)',
    history: [], // Trail
    speed: 0.1 // lerp factor
};

// Mouse/Touch tracking
const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
}, { passive: false });

// Obstacles
let obstacles = [];
const obstacleColors = ['#ff4444', '#ff8800', '#ff0055'];

class Obstacle {
    constructor() {
        this.radius = Math.random() * 15 + 10;
        this.x = canvas.width + this.radius; // Spawn off screen right
        this.y = Math.random() * canvas.height;
        this.speed = Math.random() * 2 + gameSpeed;
        this.color = obstacleColors[Math.floor(Math.random() * obstacleColors.length)];
        this.angle = 0;
        this.spin = Math.random() * 0.1 - 0.05;
    }

    update() {
        this.x -= this.speed;
        this.angle += this.spin;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;

        // Draw asteroid shape (rough polygon)
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        for (let i = 0; i < 7; i++) {
            const angle = (Math.PI * 2 * i) / 7;
            const r = this.radius * (0.8 + Math.random() * 0.4); // Jaggedness won't animate per frame here properly without storing it, keeping simple circle for collision but jagged drawing would be better if stored.
            // Simplified: Draw a hexagon/n-gon
            ctx.lineTo(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke();

        ctx.restore();
    }
}

// Particles (Stars/Dust)
let particles = [];
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x -= this.speed * (gameSpeed * 0.5);
        if (this.x < 0) {
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Background init
for (let i = 0; i < 50; i++) particles.push(new Particle());

function initGame() {
    score = 0;
    gameSpeed = 3;
    obstacles = [];
    player.x = canvas.width / 4; // Start left-ish
    player.y = canvas.height / 2;
    mouse.x = canvas.width / 4;
    mouse.y = canvas.height / 2;
    frames = 0;
    scoreEl.textContent = 0;
    isGameRunning = true;

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    animate();
}

function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'block';
}

function animate() {
    if (!isGameRunning) return;
    animationId = requestAnimationFrame(animate);
    frames++;

    // Clear Canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trails effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Player Movement (Lerp for smooth follow)
    player.x += (mouse.x - player.x) * 0.1;
    player.y += (mouse.y - player.y) * 0.1;

    // Player Trail
    player.history.push({ x: player.x, y: player.y });
    if (player.history.length > 10) player.history.shift();

    // Draw Trail
    ctx.beginPath();
    for (let i = 0; i < player.history.length; i++) {
        const p = player.history[i];
        ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = `rgba(0, 179, 134, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;

    // Manage Obstacles
    // Spawn
    if (frames % 60 === 0) {
        obstacles.push(new Obstacle());
        score++;
        scoreEl.textContent = score;
        // Increase difficulty
        if (score % 10 === 0) gameSpeed += 0.5;
    }

    // Update & Draw Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        ob.update();
        ob.draw();

        // Remove off-screen
        if (ob.x + ob.radius < 0) {
            obstacles.splice(i, 1);
            continue;
        }

        // Collision Detection
        const dx = player.x - ob.x;
        const dy = player.y - ob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + ob.radius) {
            gameOver();
        }
    }
}

// Event Listeners
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
