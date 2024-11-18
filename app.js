// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let score = 0;
let escaped = 0;
const maxEscaped = 5;
const nodes = [];
const particles = [];
const nodeLifetime = 2000; // milliseconds

// UI Elements
const scoreDisplay = document.getElementById('score');
const escapedDisplay = document.getElementById('escaped');

// Utility Function: Random Number
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Create a new Node
function spawnNode() {
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

// Handle Clicks
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Check if a node was clicked
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const distance = Math.sqrt(
      (clickX - node.x) ** 2 + (clickY - node.y) ** 2
    );
    if (distance < node.size) {
      // Node clicked
      burstEffect(node.x, node.y); // Trigger burst
      score++;
      scoreDisplay.textContent = score;
      nodes.splice(i, 1); // Remove node
      break;
    }
  }
});

// Show Game Over Screen
function showGameOver() {
  const gameOverScreen = document.getElementById('gameOver');
  const finalScore = document.getElementById('finalScore');
  finalScore.textContent = score;
  gameOverScreen.style.display = 'flex';

  // Fade-in effect
  let opacity = 0;
  const fadeIn = setInterval(() => {
    opacity += 0.05;
    gameOverScreen.style.opacity = opacity;
    if (opacity >= 1) clearInterval(fadeIn);
  }, 50);
}

// Reset Game
function resetGame() {
  score = 0;
  escaped = 0;
  nodes.length = 0;
  particles.length = 0;
  scoreDisplay.textContent = score;
  escapedDisplay.textContent = escaped;
  document.getElementById('gameOver').style.display = 'none';
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

// Game Loop
function gameLoop() {
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

// Start Game
setInterval(spawnNode, 1000); // Spawn a new node every second
gameLoop();
