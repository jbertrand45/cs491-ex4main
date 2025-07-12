const express = require('express');

const app = express();
const port = 3000;
const TIMEOUT = 10 * 1000; //10s

let tokens = {
  players: [],
  turn: ""
}

// Middleware to handle JSON requests
app.use(express.static('public'));
app.use(express.json());

/**
 * This is a simple game server that allows players to join a game,
 * leave the game, and ping each other.
 */
app.post('/join', (req, res) => {
  const player = req.body;
  if (tokens.players.length < 2) {
    tokens.players.push(player);
    if (tokens.players.length === 1) {
      tokens.turn = player.user; // Set the first player as the turn initiator
    }
    console.log('Player joined:', player);
    res.status(200).json({message: "Joined", players: tokens.players});
  }
  else {
    return res.status(403).json({message: "Room full"});
  }
})

/**
 * Handles player leaving the game.
 */
app.post('/leave', (req, res) => {
  const player = req.body;
  tokens.players = tokens.players.filter(existingPlayer => {
    const sameUser = existingPlayer.user === player.user;
    const sameBrowser = existingPlayer.browser === player.browser;
    return !(sameUser && sameBrowser);
  })
  console.log('Player left:', player);
  res.status(200).json({message: "Left", players: tokens.players});
})

/** 
 * Returns the current state of the game, including players and their tokens.
 */
app.get('/tokens', (req, res) => {
  res.status(200).json({ players: tokens.players });
})

/**
 * Handles the token state for players.
 * It allows players to send their token state to the server and retrieve it.
 */
app.post('/token', (req, res) => {
  const player = req.body;
  // Find if player exists
  const idx = tokens.players.findIndex(
    p => p.user === player.user && p.browser === player.browser
  );
  if (idx !== -1) {
    tokens.players[idx] = { ...tokens.players[idx], ...player };
  } else {
    tokens.players.push(player);
  }
  console.log('token successfully stored', tokens.players);
  res.status(200).send("received token");
})


/**
 * Returns the token state of the current player.
 */
app.get('/token', (req, res) => {
  if (tokens.players.length === 0) {
    return res.status(404).send("token not created");
  }
  res.json({ players: tokens.players });
})

/**
 * Starts the server and listens on the specified port.
 */
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
})