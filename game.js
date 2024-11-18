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
let gameInterval;

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

// Rest of the game logic (unchanged)
