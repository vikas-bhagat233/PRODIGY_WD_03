const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");
const modeRadios = document.querySelectorAll("input[name='mode']");
const themeToggle = document.getElementById("theme-toggle");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

const moveSound = document.getElementById("move-sound");
const winSound = document.getElementById("win-sound");
const drawSound = document.getElementById("draw-sound");

let gameBoard = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let vsAI = false;
let scores = { X: 0, O: 0, draw: 0 };

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function renderBoard() {
  boardEl.innerHTML = "";
  gameBoard.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = idx;
    cell.textContent = val;
    cell.addEventListener("click", handleMove);
    boardEl.appendChild(cell);
  });
}

function handleMove(e) {
  const index = e.target.dataset.index;
  if (!gameActive || gameBoard[index] !== "") return;

  makeMove(index, currentPlayer);
  moveSound.play();

  if (checkWin(currentPlayer)) {
    statusEl.textContent = `${currentPlayer} wins!`;
    winSound.play();
    gameActive = false;
    updateScore(currentPlayer);
    return;
  }

  if (!gameBoard.includes("")) {
    statusEl.textContent = "It's a draw!";
    drawSound.play();
    updateScore("draw");
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}'s turn`;

  if (vsAI && currentPlayer === "O") {
    setTimeout(aiBestMove, 500);
  }
}

function makeMove(index, player) {
  gameBoard[index] = player;
  renderBoard();
}

function checkWin(player) {
  return winCombos.some(combo => combo.every(i => gameBoard[i] === player));
}

function updateScore(winner) {
  if (winner === "draw") scores.draw++;
  else scores[winner]++;
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

function aiBestMove() {
  const best = minimax(gameBoard, "O");
  makeMove(best.index, "O");
  moveSound.play();

  if (checkWin("O")) {
    statusEl.textContent = `AI wins!`;
    winSound.play();
    gameActive = false;
    updateScore("O");
  } else if (!gameBoard.includes("")) {
    statusEl.textContent = "It's a draw!";
    drawSound.play();
    updateScore("draw");
    gameActive = false;
  } else {
    currentPlayer = "X";
    statusEl.textContent = `Player X's turn`;
  }
}

function minimax(board, player) {
  const availSpots = board.map((val, i) => val === "" ? i : null).filter(i => i !== null);

  if (checkWinner(board, "X")) return { score: -10 };
  if (checkWinner(board, "O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i of availSpots) {
    const move = { index: i };
    board[i] = player;

    const result = minimax(board, player === "O" ? "X" : "O");
    move.score = result.score;

    board[i] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let i in moves) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i in moves) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }

  return bestMove;
}

function checkWinner(board, player) {
  return winCombos.some(combo => combo.every(i => board[i] === player));
}

function resetGame() {
  gameBoard = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  statusEl.textContent = "Player X's turn";
  renderBoard();
}

modeRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    vsAI = document.querySelector("input[name='mode']:checked").value === "ai";
    resetGame();
  });
});

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

resetBtn.addEventListener("click", resetGame);

renderBoard();
