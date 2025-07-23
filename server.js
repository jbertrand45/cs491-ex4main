const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 3001;

app.use(express.static('public'));
app.use(express.json());

let tokens = {
  players: [] // max is 2 players
};

let gameState = {
  turn: 'x',
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
  if (gameState.started) {
    socket.emit('gameState', gameState, "Waiting for a move...");
  }
});

app.post('/token', (req, res) => {
  const player = req.body;
  if ((!tokens.players.some(p => p.user === player.user))) {
    if (player.user.match(/\d+/)) {
      return res.status(400).json({ message: "No numbers in name allowed."});
    }
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
  res.status(200).json({ message: "Joined. Players: ", players: tokens.players });
});

app.post('/change-token', (req, res) => {
  const newToken = req.body;
  if (newToken.user === tokens.players[0].user) {
    tokens.players[0] = newToken;
  } else {
    tokens.players[1] = newToken;
  }
  res.status(200);
});

app.post('/leave', (req, res) => {
  const player = req.body;
  console.log('Player left:', player);
  io.emit('win', `${player.user} has left, ${tokens.players[0].user === player.user ? tokens.players[1].user : tokens.players[0].user} wins!`);
  res.status(200).json({ message: "Left", players: tokens.players });
  resetVars();
});

// Coin flip to decide turn
app.post('/flip', (req, res) => {
  // first player gets to choose heads or tails
  const { input } = req.body;
  const flipResult = Math.floor(Math.random() * 2) === 1 ? 'H' : 'T';
  gameState.started = false; // preserving game state vars
  const first = flipResult === input ? tokens.players[1].user : tokens.players[0].user;
  console.log(`Coin flipped: ${flipResult}. ${first} goes first.`);
  io.emit('flipResult', {
    message: `${tokens.players[1].user} chose ${input}, the coin flipped ${flipResult}, ${first} wins the first turn!`,
    turn: first,
  });
  res.status(200).json({ message: `Coin flipped ${flipResult}.` });
});

// starting game
app.post('/start', (req, res) => {
  gameState.started = true;
  gameState.board = Array(16).fill(null);

  console.log(`Game started. ${gameState.turn ? tokens.players[0].user : tokens.players[1].user} goes first.`);
  const msg = "Waiting for the game to end..."
  // io.emit('gameState', gameState, msg); // important--maybe?
  res.status(200).json({ message: `Game started.` });
});

app.post('/move', (req, res) => {
  const { index } = req.body;
  if (gameState.board[index] !== null) {
    return res.status(400).json({ message: "Invalid move" });
  }
  gameState.board[index] = gameState.turn; // Set the player's mark
  //CALCULATIONS FOR GAMESTATE GO HERE
  const currentPlayer = tokens.players.find(p => p.role === gameState.turn)?.user;
  const msg = `Player ${currentPlayer} has placed their ${gameState.turn} on square ${index + 1}`;
  gameState.turn = gameState.turn === 'x' ? 'o' : 'x' // change turn when its x to o, o to x
  io.emit('gameState', gameState, msg); // important
  res.status(200).json({ board: gameState.board, turn: gameState.turn });
  if (checkWin()) resetVars();
});

function checkWin() {
  const player = gameState.turn ? tokens.players[0].user : tokens.players[1].user;
  for (const pos of winPos) {
    const [a, b, c, d] = pos;
    if (gameState.board[a] &&
        gameState.board[a] === gameState.board[b] &&
        gameState.board[a] === gameState.board[c] &&
        gameState.board[a] === gameState.board[d]) {
          io.emit('win', `${player} wins by connecting ${a+1}, ${b+1}, ${c+1}, ${d+1}!`)
          return true;
    }
  }
  if (gameState.board.every(cell => cell !== null)) {
    io.emit('win', `Both players have reached a draw!`);
    return true;
  }
  return false;
}

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
  const message = `${token.user} has forfeited. ${gameState.winner} is the winner! Please wait ten seconds for the board to reset.`;
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
    turn: 'x',
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
