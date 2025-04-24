// Constants
const GRID_SIZE = 15; // Grid dimensions
const PACMAN_START_POSITION = Math.floor((GRID_SIZE * GRID_SIZE) / 2); // Pac-Man starts in the center
const GHOST_START_POSITIONS = [
  0, // Top-left corner
  GRID_SIZE - 1, // Top-right corner
  GRID_SIZE * (GRID_SIZE - 1), // Bottom-left corner
  GRID_SIZE * GRID_SIZE - 1, // Bottom-right corner
];
const PACMAN_SPEED = 150; // Pac-Man movement speed in ms
const GHOST_SPEED = 500; // Ghost movement speed in ms
const DETECTION_RANGE = 3; // Ghost detection range

// Game variables
let pacmanPosition = PACMAN_START_POSITION;
let score = 0;
let ghosts = [...GHOST_START_POSITIONS];
let pellets = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i).filter(
  (i) => ![pacmanPosition, ...ghosts].includes(i)
);
let currentDirection = null; // Tracks Pac-Man's current direction
let movementInterval = null; // Interval for continuous movement

// DOM elements
const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const victoryMessage = document.getElementById("victory-message");

// Initialize the game
function initGame() {
  createGrid();
  resetGame();
}

// Create the grid
function createGrid() {
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gridElement.appendChild(cell);
  }
}

// Update the grid
function updateGrid() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.innerHTML = ""; // Clear previous content

    if (index === pacmanPosition) {
      const pacman = document.createElement("div");
      pacman.classList.add("pacman");
      cell.appendChild(pacman);
    }

    if (pellets.includes(index)) {
      const pellet = document.createElement("div");
      pellet.classList.add("pellet");
      cell.appendChild(pellet);
    }

    if (ghosts.includes(index)) {
      const ghost = document.createElement("div");
      ghost.classList.add("ghost");
      cell.appendChild(ghost);
    }
  });

  // Check for victory
  if (pellets.length === 0) {
    showVictoryMessage();
  }
}

// Move Pac-Man
function movePacman() {
  const [row, col] = getRowCol(pacmanPosition);
  let newRow = row;
  let newCol = col;

  switch (currentDirection) {
    case "ArrowUp":
      newRow = newRow === 0 ? GRID_SIZE - 1 : newRow - 1; // Wrap to bottom
      break;
    case "ArrowDown":
      newRow = newRow === GRID_SIZE - 1 ? 0 : newRow + 1; // Wrap to top
      break;
    case "ArrowLeft":
      newCol = newCol === 0 ? GRID_SIZE - 1 : newCol - 1; // Wrap to right
      break;
    case "ArrowRight":
      newCol = newCol === GRID_SIZE - 1 ? 0 : newCol + 1; // Wrap to left
      break;
  }

  const newPosition = newRow * GRID_SIZE + newCol;

  if (!ghosts.includes(newPosition)) {
    pacmanPosition = newPosition;

    // Check if Pac-Man eats a pellet
    if (pellets.includes(newPosition)) {
      pellets = pellets.filter((pos) => pos !== newPosition);
      score += 10;
      scoreElement.textContent = score;
    }

    updateGrid();
  } else {
    gameOver();
  }
}

// Handle user input
function handleInput(event) {
  const validDirections = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (validDirections.includes(event.key)) {
    currentDirection = event.key;

    // Start movement interval if not already running
    if (!movementInterval) {
      movementInterval = setInterval(movePacman, PACMAN_SPEED);
    }
  }
}

// Move ghosts
function moveGhosts() {
  ghosts = ghosts.map((ghostPos) => {
    const [ghostRow, ghostCol] = getRowCol(ghostPos);
    const [pacmanRow, pacmanCol] = getRowCol(pacmanPosition);

    // Calculate Manhattan distance between ghost and Pac-Man
    const distance =
      Math.abs(ghostRow - pacmanRow) + Math.abs(ghostCol - pacmanCol);

    let newRow = ghostRow;
    let newCol = ghostCol;

    if (distance <= DETECTION_RANGE) {
      // Chase Pac-Man if within detection range
      newRow =
        ghostRow < pacmanRow
          ? Math.min(ghostRow + 1, GRID_SIZE - 1)
          : Math.max(ghostRow - 1, 0);
      newCol =
        ghostCol < pacmanCol
          ? Math.min(ghostCol + 1, GRID_SIZE - 1)
          : Math.max(ghostCol - 1, 0);
    } else {
      // Move randomly otherwise
      const directions = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      const randomDirection =
        directions[Math.floor(Math.random() * directions.length)];

      switch (randomDirection) {
        case "ArrowUp":
          newRow = ghostRow === 0 ? GRID_SIZE - 1 : ghostRow - 1;
          break;
        case "ArrowDown":
          newRow = ghostRow === GRID_SIZE - 1 ? 0 : ghostRow + 1;
          break;
        case "ArrowLeft":
          newCol = ghostCol === 0 ? GRID_SIZE - 1 : ghostCol - 1;
          break;
        case "ArrowRight":
          newCol = ghostCol === GRID_SIZE - 1 ? 0 : ghostCol + 1;
          break;
      }
    }

    return newRow * GRID_SIZE + newCol;
  });

  updateGrid();

  // Check if any ghost catches Pac-Man
  if (ghosts.includes(pacmanPosition)) {
    gameOver();
  }
}

// Show victory message
function showVictoryMessage() {
  victoryMessage.classList.remove("hidden");
  clearInterval(movementInterval);
  clearInterval(ghostInterval);
}

// Reset the game
function resetGame() {
  pacmanPosition = PACMAN_START_POSITION;
  score = 0;
  scoreElement.textContent = score;
  ghosts = [...GHOST_START_POSITIONS];
  pellets = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i).filter(
    (i) => ![pacmanPosition, ...ghosts].includes(i)
  );
  currentDirection = null;
  clearInterval(movementInterval);
  movementInterval = null;
  victoryMessage.classList.add("hidden");
  updateGrid();
}

// End the game
function gameOver() {
  alert("Game Over! You were caught by a ghost.");
  resetGame();
}

// Helper function to calculate row and column from position
function getRowCol(position) {
  return [Math.floor(position / GRID_SIZE), position % GRID_SIZE];
}

// Event listeners
document.addEventListener("keydown", handleInput);

// Start the game
initGame();

// Move ghosts every GHOST_SPEED ms
const ghostInterval = setInterval(moveGhosts, GHOST_SPEED);
