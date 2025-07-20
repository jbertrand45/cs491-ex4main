import { applyButtonFormat, applyTextFormat, showTooltip, hideTooltip } from './format.js';
import { createCellButton } from './button.js';
import { tokenState, setToken, putToken, getToken } from './TokenState.js';

const grid = document.getElementById('grid');
const joinBtn = document.getElementById('joinBtn');
const startBtn = document.getElementById('startBtn');
const forfeitBtn = document.getElementById('forfeitBtn');
const flipBtn = document.getElementById('flipBtn');

startBtn.disabled = forfeitBtn.disabled = flipBtn.disabled = true;

let turn = null; // Track whose turn it is
let token = null; // Player's token

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
    const button = createCellButton(i, turn);
    grid.appendChild(button);
  }
}




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