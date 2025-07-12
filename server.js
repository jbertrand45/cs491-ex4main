const express = require('express');

const app = express();
const port = 3000;

let tokens = {
  players: [],
  currentTurn: 0
}

app.use(express.static('public'));
app.use(express.json());

app.post('/join', (req, res) => {
  const player = req.body;
  if (tokens.players.length < 2) {
    tokens.players.push(player);
    tokens.turn = true; //TODO: optimize
    console.log('Player joined:', player);
    res.status(200).json({message: "Joined", players: tokens.players});
  }
  else {
    return res.status(403).json({message: "Room full"});
  }
})

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

app.get('/players', (req,res) => {
  res.json({
    players: tokens.players,
    turn: tokens.turn
  })
})

// save token from /token
app.post('/token', (req, res) => {
  tokens.players = req.body;
  console.log('token successfully stored', tokens.players);
  res.status(200).send("received token");
})

// get token from /token
app.get('/token', (req, res) => {
  if (tokens.players.length === 0) {
    return res.status(404).send("token not created");
  }
  res.json(tokens.players);
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
})