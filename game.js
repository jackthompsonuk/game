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
let nodeSpawnRate = 1000; // Initial spawn rate (ms)
let nodeSpeedIncreaseInterval = 10; // Increase spawn rate every 10 points

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
  gameInterval = setInterval(spawnNode, nodeSpawnRate);
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
    speedX: 0,  // Default speed 0 (stationary by default)
    speedY: 0,
  };

  // If the player has 100 points, make nodes move
  if (score >= 100) {
    node.speedX = random(-2, 2); // Set random horizontal speed
    node.speedY = random(-2, 2); // Set random vertical speed
  }

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

  // Increase spawn rate every 10 points
  if (score % nodeSpeedIncreaseInterval === 0) {
    nodeSpawnRate = Math.max(500, nodeSpawnRate - 5); // Increase spawn speed, min 500ms
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnNode, nodeSpawnRate);
  }
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
  isGameRunning = false;  // Stop the game from running
  clearInterval(gameInterval); // Stop node spawning
  gameInterval = null;  // Nullify the game interval to stop any other node spawning

  // Prevent any further escape counts or game updates
  const finalScore = document.getElementById('finalScore');
  finalScore.textContent = score;

  gameOverScreen.style.display = 'flex';  // Show the game over screen
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

  // Draw Nodes and Move them if they have speed
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.closePath();

    // Move the node if it has a speed
    node.x += node.speedX;
    node.y += node.speedY;

    // Bounce the node off the walls (optional)
    if (node.x < 0 || node.x > canvas.width) {
      node.speedX = -node.speedX; // Reverse horizontal speed when hitting the wall
    }
    if (node.y < 0 || node.y > canvas.height) {
      node.speedY = -node.speedY; // Reverse vertical speed when hitting the wall
    }
  });

  animateParticles();

  requestAnimationFrame(gameLoop);
}
