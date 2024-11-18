// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive Canvas
function resizeCanvas() {
  const aspectRatio = 3 / 2; // Maintain a consistent aspect ratio
  const maxWidth = window.innerWidth * 0.9; // Max width: 90% of the screen
  const maxHeight = window.innerHeight * 0.7; // Max height: 70% of the screen

  if (maxWidth / aspectRatio < maxHeight) {
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
  } else {
    canvas.width = maxHeight * aspectRatio;
    canvas.height = maxHeight;
  }
}

// Call resizeCanvas on load and resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game Variables
let score = 0;
let escaped = 0;
const maxEscaped = 5;
const nodes = [];
const particles = [];
const nodeLifetime = 2000; // milliseconds
let isGameRunning = false;
let gameInterval; // For managing the node spawn interval

// UI Elements
const scoreDisplay = document.getElementById('score');
const escapedDisplay = document.getElementById('escaped');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');

// Utility Function: Random Number
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Start Game
function startGame() {
  isGameRunning = true;
  score = 0;
  escaped = 0;
  nodes.length = 0;
  particles.length = 0;

  scoreDisplay.textContent = score;
  escapedDisplay.textContent = escaped;

  startScreen.style.display = 'none';
  document.querySelector('.info').style.display = 'block';
  canvas.style.display = 'block';

  // Start the node spawn interval
  gameInterval = setInterval(spawnNode, 1000);
  gameLoop();
}

// Create a new Node
function spawnNode() {
  if (!isGameRunning) return;

  const node = {
    x: random(50, canvas.width - 50),
    y: random(50, canvas.height - 50),
    size: 20,
    color: '#00ffcc',
    createdAt: Date.now(),
  };
  nodes.push(node);

  // Remove the node after its lifetime
  setTimeout(() => {
    if (nodes.includes(node)) {
      nodes.splice(nodes.indexOf(node), 1);
      escaped++;
      escapedDisplay.textContent = escaped;
      if (escaped >= maxEscaped) {
        showGameOver();
      }
    }
  }, nodeLifetime);
}

// Handle Touch and Click Events
function handleInteraction(event) {
  if (!isGameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
  const y = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

  // Check if a node was clicked or tapped
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
    if (distance < node.size) {
      // Node clicked/tapped
      burstEffect(node.x, node.y); // Trigger burst
      score++;
      scoreDisplay.textContent = score;
      nodes.splice(i, 1); // Remove node
      break;
    }
  }
}

canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);

// Create Burst Effect
function burstEffect(x, y) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x,
      y,
      size: random(2, 5),
      color: '#ff0044',
      speedX: random(-3, 3),
      speedY: random(-3, 3),
      life: 30, // Frames to live
    });
  }
}

// Animate Particles
function animateParticles() {
  particles.forEach((particle, index) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.size *= 0.95; // Shrink over time
    particle.life--;

    if (particle.life <= 0) {
      particles.splice(index, 1);
    } else {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      ctx.closePath();
    }
  });
}

// Show Game Over Screen
function showGameOver() {
  isGameRunning = false;
  clearInterval(gameInterval); // Stop node spawning
  const finalScore = document.getElementById('finalScore');
  finalScore.textContent = score;

  gameOverScreen.style.display = 'flex';
  document.querySelector('.info').style.display = 'none';
}

// Reset Game
function resetGame() {
  isGameRunning = false;
  clearInterval(gameInterval); // Stop any leftover intervals
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';
}

// Game Loop
function gameLoop() {
  if (!isGameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Nodes with Glitchy Animation
  nodes.forEach((node) => {
    const glitchX = random(-2, 2);
    const glitchY = random(-2, 2);
    ctx.beginPath();
    ctx.arc(node.x + glitchX, node.y + glitchY, node.size, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.closePath();
  });

  // Animate Particles
  animateParticles();

  requestAnimationFrame(gameLoop);
}
