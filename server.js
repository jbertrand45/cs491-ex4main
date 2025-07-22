const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

let tokens = {
  players: [] // max is 2 players
};

let gameState = {
  turn: null,
  started: null, // null means not joined, false means not started, true means started
  winner: null, // Track the winner, once winner is set, game is over
  board: Array(16).fill(null) // 4x4 board initialized to null
};

//moved to server for server calculations
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

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, socket.handshake.address);
  socket.emit('gameState', gameState);
});

app.post('/token', (req, res) => {
  const player = req.body;
  if ((!tokens.players.some(p => p.user === player.user))) {
    if (tokens.players.length < 2) {
      tokens.players.push(player);
    }
    else {
      return res.status(403).json({ message: "Room full" });
    }
  }
  else {
    return res.status(400).json({ message: "Token already exists" });
  }
  console.log('token successfully stored', tokens.players);
  res.status(200).json({ message: "Joined. Players: ", players: tokens.players, turn: gameState.turn });
});

app.post('/leave', (req, res) => {
  const player = req.body;
  tokens.players = tokens.players.filter(existingPlayer => {
    const sameUser = existingPlayer.user === player.user;
    const sameBrowser = existingPlayer.browser === player.browser;
    return !(sameUser && sameBrowser);
  }
  );
  if (tokens.players.length === 0) {
    gameState.turn = null;
  }
  else if (tokens.players.length === 1) {
    gameState.turn = true;
  }
  gameState.started = null;
  gameState.winner = null;
  gameState.board = Array(16).fill(null); // Reset the board
  console.log('Player left:', player);
  res.status(200).json({ message: "Left", players: tokens.players });
});

// Coin flip to decide turn
app.post('/flip', (req, res) => {
  // first player gets to choose heads or tails
  const { input } = req.body;
  const flipResult = Math.floor(Math.random() * 2) === 1 ? 'H' : 'T';
  if (input === flipResult) {
    gameState.turn = true;
  }
  else {
    gameState.turn = false;
  }
  gameState.started = false; // preserving game state vars
  const first = gameState.turn ? tokens.players[1].user : tokens.players[0].user;
  console.log(`Coin flipped: ${flipResult}. ${first} goes first.`);

  io.emit('flipResult', {
    message: `${tokens.players[1].user} chose ${input}, the coin flipped ${flipResult}, ${first} wins the first turn!`,
    turn: gameState.turn,
    order: first
  });
  res.status(200).json({ message: `Coin flipped ${flipResult}.` });
});

// starting game
app.post('/start', (req, res) => {
  gameState.started = true;
  gameState.board = Array(16).fill(null);

  console.log(`Game started. ${gameState.turn ? tokens.players[0].user : tokens.players[1].user} goes first.`);
  const msg = "Waiting for the game to end..."
  io.emit('start', msg);
  res.status(200).json({ message: `Game started.` });
});

app.post('/move', (req, res) => {
  const { index } = req.body;
  if (gameState.board[index] !== null) {
    return res.status(400).json({ message: "Invalid move" });
  }
  gameState.board[index] = gameState.turn ? 'x' : 'o'; // Set the player's mark
  const msg = `Player ${gameState.turn ? tokens.players[0].user : tokens.players[1].user} has placed their ${gameState.board[index]} on ${index}`;
  gameState.turn = !gameState.turn;
  io.emit('gameState', gameState);
  return res.status(200).json({ board: gameState.board, turn: gameState.turn });
});

// Forfeiting the game
app.post('/forfeit', (req, res) => {
  const token = req.body;

  if (token.user === tokens.players[0].user) {
    gameState.winner = tokens.players[1].user;
  }
  else {
    gameState.winner = tokens.players[0].user;
  }

  //reset the game state
  const message = `${token.user} has forfeited. ${gameState.winner} is the winner!`;
  io.emit('win', message)
  console.log(`${token.user} forfeited. Winner: ${gameState.winner || "None"}`);
  resetVars();
  res.status(200);
});

//helper function
function resetVars() {
  gameState = {
    started: null, // null means not joined, false means not started, true means started
    winner: null, // Track the winner, once winner is set, game is over
    turn: null,
    board: Array(16).fill(null) // 4x4 board initialized to null
  };
  tokens = {
    players: []
  };
}

app.get('/token', (req, res) => {
  res.json(tokens);
});

app.get('/state', (req, res) => {
  res.json(gameState);
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
