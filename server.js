const express = require('express');
const app = express();
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

app.post('/token', (req, res) => {
  const player = req.body;
  if ((!tokens.players.some(p => p.user === player.user && p.browser === player.browser))) {
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
  if (tokens.players.length === 1) {
    gameState.turn = { user: tokens.players[0].user, agent: tokens.players[0].agent};
  }
  console.log('token successfully stored', tokens.players);
  res.status(200).json({ message: "Joined. Players: ", players: tokens.players });
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
    gameState.turn = { user: tokens.players[0].user, agent: tokens.players[0].agent };
  }
  console.log('Player left:', player);
  res.status(200).json({ message: "Left", players: tokens.players });
});


app.get('/token', (req, res) => {
  res.json(tokens);
});

app.get('/state', (req, res) => {
  res.json(gameState);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


// //imports express and sets up the server
// const express = require('express');

// //initializes express app and sets the port
// const app = express();
// const port = 3000;
// const TIMEOUT = 10 * 1000; //10s

// //function that sets a token for player
// let tokens = {
//   players: [],
//   turn: ""
// }

// let allPlayers = [];

// // Middleware to handle JSON requests
// app.use(express.static('public'));
// app.use(express.json());

// function updateActivity(player) {
//   const p = tokens.players.find(
//     existingPlayer => existingPlayer.user === player.user && existingPlayer.browser === player.browser
//   );
//   if (p) p.lastActive = Date.now();
// }

// // Periodic cleanup
// setInterval(() => {
//   const now = Date.now();
//   const beforeCount = tokens.players.length;
//   tokens.players = tokens.players.filter(player => now - player.lastActive < TIMEOUT);
//   if (tokens.players.length !== beforeCount) {
//     console.log('Players removed due to timeout, resetting turn state');
//     if (tokens.players.length === 0) {
//       tokens.turn = "";
//     } else if (tokens.players.length === 1) {
//       tokens.turn = { user: tokens.players[0].user, browser: tokens.players[0].browser };
//     } else {
//       // Make sure current turn player still exists
//       const turnPlayerExists = tokens.players.find(
//         p => tokens.turn && p.user === tokens.turn.user && p.browser === tokens.turn.browser
//       );
//       if (!turnPlayerExists) {
//         tokens.turn = { user: tokens.players[0].user, browser: tokens.players[0].browser };
//       }
//     }
//   }
// }, 2000);

// /**
//  * This is a simple game server that allows players to join a game,
//  * leave the game, and ping each other.
//  */
// app.post('/join', (req, res) => {
//   const player = req.body;
//   if (tokens.players.length < 2) {
//     player.lastActive = Date.now();
//     tokens.players.push(player);
//     if (!allPlayers.some(p => p.user === player.user && p.browser === player.browser)) {
//       allPlayers.push({ ...player });
//     }
//     if (tokens.players.length === 1) {
//       tokens.turn = { user: player.user, browser: player.browser };
//     }
//     console.log('Player joined:', player);
//     res.status(200).json({ message: "Joined", players: tokens.players });
//   }
//   else {
//     return res.status(403).json({ message: "Room full" });
//   }
// })

// /**
//  * Handles player leaving the game.
//  */
// app.post('/leave', (req, res) => {
//   const player = req.body;
//   tokens.players = tokens.players.filter(existingPlayer => {
//     const sameUser = existingPlayer.user === player.user;
//     const sameBrowser = existingPlayer.browser === player.browser;
//     return !(sameUser && sameBrowser);
//   })
//   allPlayers = allPlayers.filter(existingPlayer => {
//     const sameUser = existingPlayer.user === player.user;
//     const sameBrowser = existingPlayer.browser === player.browser;
//     return !(sameUser && sameBrowser);
//   });
//   if (tokens.players.length === 0) {
//     tokens.turn = "";
//   } else if (tokens.players.length === 1) {
//     tokens.turn = { user: tokens.players[0].user, browser: tokens.players[0].browser };
//   } else {
//     // Make sure current turn player still exists
//     const turnPlayerExists = tokens.players.find(
//       p => tokens.turn && p.user === tokens.turn.user && p.browser === tokens.turn.browser
//     );
//     if (!turnPlayerExists) {
//       tokens.turn = { user: tokens.players[0].user, browser: tokens.players[0].browser };
//     }
//   }
//   console.log('Player left:', player);
//   res.status(200).json({ message: "Left", players: tokens.players });
// })

// /**
//  * Handles the token state for players.
//  * It allows players to send their token state to the server and retrieve it.
//  */
// app.post('/token', (req, res) => {
//   const player = req.body;
//   // Update player's info
//   const idx = tokens.players.findIndex(
//     p => p.user === player.user && p.browser === player.browser
//   );
//   if (idx !== -1) {
//     tokens.players[idx] = { ...tokens.players[idx], ...player, lastActive: Date.now() };
//   } else {
//     // Player not found in active players, don't allow ping
//     return res.status(404).send("Player not in active game");
//   }
//   // Advance turn to the other player
//   if (tokens.players.length === 2) {
//     const other = tokens.players.find(
//       p => p.user !== player.user && p.browser !== player.browser
//     );
//     if (other) {
//       tokens.turn = { user: other.user, browser: other.browser };
//     }
//   }
//   console.log('token successfully stored', tokens.players);
//   res.status(200).send("received token");
// });

// /**
//  * Returns the token state of the current player.
//  */
// app.get('/token', (req, res) => {
//   if (!tokens.turn) {
//     return res.status(404).send("No turn set");
//   }
//   const turnPlayer = tokens.players.find(
//     p => p.user === tokens.turn.user && p.browser === tokens.turn.browser
//   );
//   if (!turnPlayer) {
//     console.log('Turn player not found, resetting turn state');
//     // Reset turn state if turn player doesn't exist
//     if (tokens.players.length > 0) {
//       tokens.turn = { user: tokens.players[0].user, browser: tokens.players[0].browser };
//       return res.json(tokens.players[0]);
//     } else {
//       tokens.turn = "";
//       return res.status(404).send("No active players");
//     }
//   }
//   res.json(turnPlayer);
// })

// /**
//  * Updates the last active time of a player.
//  */
// app.post('/activity', (req, res) => {
//   updateActivity(req.body);
//   res.status(200).send("activity updated");
// });

// /**
//  * Returns the current state of the game, including players and their tokens.
//  */
// app.get('/tokens', (req, res) => {
//   res.status(200).json({ players: allPlayers });
// })

// /**
//  * Starts the server and listens on the specified port.
//  */
// app.listen(port, () => {
//   console.log(`app listening on port ${port}`);
// })