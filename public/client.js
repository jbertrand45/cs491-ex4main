import { applyButtonFormat, applyTextFormat } from './format.js';
import { createCellButton, removeHover, addHover, showTooltip, hideTooltip, changeTooltipText, disableGrid, enableGrid, enablePartialGrid } from './button.js';
import { setToken, postToken, removeToken, getToken, updateBoard } from './states.js';

const socket = io();

//TODO: add hover event, reduce redundancy

const grid = document.getElementById('grid');
const joinBtn = document.getElementById('join-btn');
const startBtn = document.getElementById('start-btn');
const forfeitBtn = document.getElementById('forfeit-btn');
const flipBtn = document.getElementById('flip-btn');
const playerMsg = document.getElementById('player-msg');
const winMsg = document.getElementById('win-msg');

startBtn.disabled = forfeitBtn.disabled = flipBtn.disabled = true;

let token = null; // token for checking player status
let socketId = null;
let gameState = { // state to store game info
  started: null, // null means not joined, false means not started, true means started
  winner: null, // Track the winner, once winner is set, game is over
  turn: null, // true is p1, false is p2
  board: Array(16).fill(null) // 4x4 board initialized to null
};

renderBoard();

// Rendering game board
function renderBoard() {
  grid.innerHTML = ''; // Clear existing buttons

  // Button creation made dynamic
  for (let i = 0; i < 16; i++) {
    const button = createCellButton(i, handleCellClick);
    grid.appendChild(button);
  }
  const btnRow = document.getElementById('btn-row');
  btnRow.style.width = `${grid.offsetWidth}px`;
  btnRow.style.gap = ((grid.offsetWidth - (60 * 4)) / 3) + 'px'; // Adjust gap based on grid width

  playerMsg.style.width = `${grid.offsetWidth - 4}px`; // Adjust side text width based on grid width
  playerMsg.innerText = winMsg.innerText = "...";
  winMsg.style.width = playerMsg.style.width; // Match win message width to player message
  resetVars();
}

// to refresh the grid every time someone makes a move to all users of the website, including people who haven't joined the game
socket.on('gameState', (newState, msg) => {
  console.log(gameState);
  console.log(msg);
  gameState = newState;
  if (msg[0] === 'W') {
    winMsg.innerText = msg;
  }
  else {
    playerMsg.innerText = msg;
  }
  refreshBoard();
  if (token && !gameState.winner) {
    enablePartialGrid(grid);
    forfeitBtn.disabled = false;
  }
});

//TODO not finished
socket.on('win', message => {
  winMsg.innerText = message;
  startBtn.disabled = forfeitBtn.disabled = flipBtn.disabled = joinBtn.disabled = true;
  const nums = message.match(/\d+/g)
  if (nums) {
    nums = nums.map(n => Number(n) - 1);
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`tic${nums[i]}`);
      btn.style.backgroundColor = "red";
    }
  }
  disableGrid(grid);
  setTimeout(() => {
    joinBtn.innerText = "Join";
    joinBtn.disabled = false;
    startBtn.disabled = forfeitBtn.disabled = flipBtn.disabled = true;
    renderBoard();
    disableGrid(grid);
  }, 10000);
});

socket.on('connect', () => {
  console.log('Connected to server with socket ID:', socket.id);
  socketId = socket.id;
  disableGrid(grid);
});

function refreshBoard() {
  const buttons = document.querySelectorAll('.cell');
  buttons.forEach((btn, index) => {
    changeTooltipText(btn, gameState.board[index]);
  });
}

async function handleCellClick(event) {
  const btn = event.currentTarget;
  const index = parseInt(btn.id.slice(3));
  gameState.turn ? changeTooltipText(btn, 'x') : changeTooltipText(btn, 'o');
  const res = await updateBoard(index);
  gameState.board = res.board;
  gameState.turn = res.turn;
  disableGrid(grid);
  //refreshBoard(); // maybe not required because click event already changes tooltip
}

/**
 * These functions are ordered in how I want the buttons to be pressed in order.
 * 1. Join (only first two users)
 * 2. Flip (only for the first user)
 * 3. Start (only for the user who won the coin toss)
 * 4. Forfeit (for all players after the game starts)
 */
joinBtn.addEventListener('click', async () => {
  if (joinBtn.innerText === 'Join') {
    await handleJoin();
  } else {
    await handleLeave();
  }
});

// Update messages based on game state to flip coin
flipBtn.addEventListener('click', async () => {
  const input = prompt("Enter your guess for the coin flip [H/T]:");
  if (!input || !['H', 'T'].includes(input.toUpperCase())) {
    return alert("Invalid input. Please enter 'H' or 'T'.");
  }
  const guess = input.toUpperCase();
  const req = await fetch('/flip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: input.toUpperCase() })
  });
  const res = await req.json();
});

// Handle coin flip result
// Helper function for flipBtn
socket.on('flipResult', (data) => {
  gameState.turn = data.turn; // Update turn based on flip result
  playerMsg.innerText = data.message;
  if (token) {
    if (token.user === data.order) {
      startBtn.disabled = false;
    }
    flipBtn.disabled = true;
  }
});

// Update player and win messages
startBtn.addEventListener('click', async () => {
  const req = await fetch('/start', {
    method: 'POST'
    // headers: { 'Content-Type': 'application/json' },
    // body: JSON.stringify()
  });
  startBtn.disabled = true;
  enableGrid(grid);
  refreshBoard();
});

// Forfeit button to end the game
forfeitBtn.addEventListener('click', async () => {
  const req = await fetch('/forfeit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token)
  });
  const res = await req.json();
});

//join button
async function handleJoin() {
  let name = prompt("Enter your name to join:");
  if (!name) return alert("Name required.");

  try {
    token = setToken(name, socketId);
    const res = await postToken(token);
    const names = res.players.map(p => p.user).join(", ");
    alert(res.message + names);

    gameState.turn = res.turn; // Set initial turn
    joinBtn.innerText = 'Leave';

    if (res.players.length === 2) {
      flipBtn.disabled = false;
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleLeave() {
  const res = await removeToken(token);
  if (!res) {
    alert("Failed to leave the game");
    return;
  }
  token = null;
  gameState = { started: null, winner: null, turn: null, board: Array(16).fill(null) };
  joinBtn.innerText = 'Join';
  startBtn.disabled = forfeitBtn.disabled = flipBtn.disabled = true;
}

// helper var
function resetVars() {
  gameState = {
    turn: null,
    started: null, // null means not joined, false means not started, true means started
    winner: null, // Track the winner, once winner is set, game is over
    board: Array(16).fill(null) // 4x4 board initialized to null
  };
  token = null;
}

// makes player leave the game when the tab is closed/refreshed
window.addEventListener('beforeunload', () => {
  if (!token) return;
  fetch('/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token)
  });
});
