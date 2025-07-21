import { applyButtonFormat, applyTextFormat } from './format.js';
import { createCellButton, removeHover, addHover, showTooltip, hideTooltip, changeTooltipText, disableGrid, enableGrid } from './button.js';
import { setToken, postToken, removeToken, getToken, updateBoard } from './states.js';

const socket = io();

const grid = document.getElementById('grid');
const joinBtn = document.getElementById('join-btn');
const startBtn = document.getElementById('start-btn');
const forfeitBtn = document.getElementById('forfeit-btn');
const flipBtn = document.getElementById('flip-btn');
const playerMsg = document.getElementById('player-msg');
const winMsg = document.getElementById('win-msg');

startBtn.disabled = forfeitBtn.disabled = flipBtn.disabled = true;

let token = null; // token for checking player status
let gameState = { // state to store game info
  started: null, // null means not joined, false means not started, true means started
  winner: null, // Track the winner, once winner is set, game is over
  turn: null, // true is p1, false is p2
  board: Array(16).fill(null) // 4x4 board initialized to null
};

const winPos = [
  // Horizontal
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],

  // Vertical
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],

  // Diagonal
  [0, 5, 10, 15],
  [3, 6, 9, 12]
];

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
  playerMsg.innerText = winMsg.innerText = "No game started";
  winMsg.style.width = playerMsg.style.width; // Match win message width to player message
}

socket.on('gameState', newState => {
  gameState = newState;
  refreshBoard();
});

function refreshBoard() {
  const buttons = document.querySelectorAll('.cell');
  if (token) {
    enableGrid(grid);
    buttons.forEach((btn, index) => {
      changeTooltipText(btn, gameState.board[index] || '');
    });
  }
  else {
    disableGrid(grid);
    buttons.forEach((btn, index) => {
      changeTooltipText(btn, gameState.board[index] || '');
    });
  }
}

//TODO: add token sending
async function handleCellClick(event) {
  const btn = event.currentTarget;
  const index = parseInt(btn.id.slice(3));
  gameState.turn ? changeTooltipText(btn, 'x') : changeTooltipText(btn, 'o');
  const res = await updateBoard(index);
  gameState.board = res.board;
  gameState.turn = res.turn;
  disableGrid(grid);
  // refreshBoard();
}

//TODO: not use UI checking
joinBtn.addEventListener('click', async () => {
  if (joinBtn.innerText === 'Join') {
    await handleJoin();
  } else {
    await handleLeave();
  }
});

 // Update player and win messages
 startBtn.addEventListener('click', async () => {
   const res = await fetch('/start', { method: 'POST' });
   gameState = await res.json();
   renderBoard();
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
    body: JSON.stringify({ input: input })
  });
  const res = await req.json();
  alert(res.message);
});

// Forfeit button to end the game
 forfeitBtn.addEventListener('click', async () => {
   const res = await fetch('/forfeit', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ token })
   });
   gameState = await res.json();
   alert(`You forfeited. Winner is ${gameState.winner}`);
   renderBoard();
 });

//join button
async function handleJoin() {
  let name = prompt("Enter your name to join:");
  if (!name) return alert("Name required.");

  try {
    token = setToken(name);
    const res = await postToken(token);
    const names = res.players.map(p => p.user).join(", ");
    alert(res.message + names);

    gameState.turn = res.turn; // Set initial turn
    joinBtn.innerText = 'Leave';

    // buttonas are all functioning after players join
    if (res.players.length === 2) {
      startBtn.disabled = false;
      flipBtn.disabled = false;
      forfeitBtn.disabled = false;
    } else {
      // flip button is disabled until both players join
      flipBtn.disabled = false;
    }

  } catch (error) {
    alert("Error joining game.");
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

// makes player leave the game when the tab is closed/refreshed
window.addEventListener('beforeunload', () => {
  if (!token) return;
  fetch('/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token)
  });
});


// // Handles box cell clicks on the board
// async function handleCellClick(index) {
//   if (!gameState.started || gameState.board[index] !== "" || gameState.winner) return;
//   const res = await fetch("/move", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ index })
//   });
//   const newState = await res.json();
//   gameState = newState;
//   renderBoard();
//   updateButton();
// }

// // Action button to handle flip, clear, and start tasks
// actionBtn.onclick = async () => {
//   let route = "";
//   if (!gameState.coinFlipped) route = "flip";
//   else if (gameState.winner || gameState.board.some(c => c)) route = "clear";
//   else route = "start";

//   //post request to a dynamic route
//   const res = await fetch("/" + route, { method: "POST" });
//   const newState = await res.json();
//   gameState = newState;
//   renderBoard();
//   updateButton();
// };

// // Updates the action button based on the state of the game
// function updateButton() {
//   if (!gameState.coinFlipped) actionBtn.innerText = "Flip";
//   else if (gameState.winner || gameState.board.some(c => c)) actionBtn.innerText = "Clear";
//   else actionBtn.innerText = "Start";
// }

// // Loading intial state of the game from the server
// async function loadState() {
//   const res = await fetch("/state");
//   gameState = await res.json();
//   renderBoard();
//   updateButton();
// }

// loadState();

// import { tokenState, setToken, putToken, getToken } from './TokenState.js';
/*import { tokenState, setToken, putToken, getToken } from './TokenState.js';

// //initializing the variable to hold the user's token
// const pingBtn = document.getElementById('pingButton');
// pingBtn.disabled = true;
// const joinBtn = document.getElementById('joinButton');
// let token = null;

// //join button on click for user
// joinBtn.onclick = async () => {
//   if (joinBtn.innerText[0] === 'J') {
//     //join logic for the user
//     const name = prompt("Enter your name to join:");
//     //if user cancels the prompt, name equals null
//     if (!name) return alert("Name required.");
//     //creates token with a username
//     token = setToken(name);
//     //sends token to the server to join the ping game
//     const res = await fetch('/join', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(token)
//     })
//     //parses the json response on the server
//     const data = await res.json();

//     //if response is ok, server accepts the user
//     if (!res.ok) {
//       alert(data.message || "Room Full");
//       return;
//     }
//     alert("Joined. Players: " + data.players.map(p => p.user).join(", "));
//     joinBtn.innerText = 'Leave';
//     pingBtn.disabled = false;
//   }
//   else {
//     //sends a network request to server to exit the game
//     const res = await fetch('/leave', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(token)
//     });

//     //goes back to initial state
//     token = null;
//     pingBtn.disabled = true;
//     joinBtn.innerText = 'Join';
//   }
// };

// //pingButton on Click
// pingBtn.onclick = async () => {
//   pingBtn.disabled = true;

//   //sending token to server
//   const complete = await putToken(token);
//   if (!complete) {
//     alert("Failed to send token");
//     pingBtn.disabled = false;
//     return;

//   }
//   //polls the server for other player's ping
//   const poll = setInterval(async () => {
//     const serverToken = await getToken();
//     if (!serverToken) return;

//     //checks if the token matches the other player's token and outputs it's your turn notification
//     if (serverToken.user === token.user && serverToken.browser === token.browser) {
//       alert("It's your turn");
//       console.log("It's your turn");
//       pingBtn.disabled = false;
//       clearInterval(poll);
//     }
//   }, 1000);
// };
// //function for sending client a heartbeat data to the server
// function sendActivity() {
//   if (token) {
//     fetch('/activity', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(token)
//     });
//   }
// }

// // Notify server when tab closes
// window.addEventListener('beforeunload', () => {
//   if (!token) return;
//   fetch('/leave', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(token)
//   });
// });

// Periodically send activity
setInterval(sendActivity, 3000);

//
*/

// const boardEl = document.getElementById("board");
// const actionBtn = document.getElementById("actionButton");

// let gameState = null;