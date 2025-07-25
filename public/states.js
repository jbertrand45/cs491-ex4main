//TokenState class 
class tokenState {
  constructor(user, agent, socketId, role) {
    this.user = user;
    this.agent = agent;
    this.socketId = socketId; // Store socket ID
    this.role = role; // 'x' first, 'o' second
    //this.lastActive = Date.now(); // Track last active time
  }
}

class gameState {
  constructor(board, started, winner, turn, coinFlipped) {
    this.board = board;
    this.started = started; // Boolean indicating if the game has started
    this.winner = winner; // Player who won, null if no winner
    this.turn = turn; // Player whose turn it is, null if not set
    this.coinFlipped = coinFlipped; // Boolean indicating if the coin has been flipped
  }
}

//creates a JS object
function setToken(user, socketId, role) {
  const a = navigator.userAgent; // browser name string
  var agent = "Firefox"; // the default, ff order is important
  if (a.indexOf("OPR") > 0) var agent = "Opera";
  else if (a.indexOf("Chrome") > 0) var agent = "Chrome";
  else if (a.indexOf("Safari") > 0) var agent = "Safari";
  return new tokenState(user, agent, socketId, role);
}


//writes a token from Client to Server
async function postToken(token) {
  const req = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token)
  });
  const res = await req.json();
  if (!req.ok) {
    alert("Failed to post token: " + res.message);
    throw new Error("Failed to post token");
  }
  return res;
}

async function removeToken(token) {
  const req = await fetch('/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token)
  });
  const res = await req.json();
  if (!req.ok) {
    alert("Failed to leave: " + res.message);
    throw new Error("Failed to post token");
  }
  return true;
}

//Reads JSON file on the server, returns a JS token to the client
async function getToken() {
  const req = await fetch('/token', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const res = await req.json();
  if (!res.ok) {
    throw new Error('Failed to fetch token');
  }
  return await res.json();
}

async function changeToken(token) {
  const req = await fetch('/change-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token)
  });
  const res = await req.json();
  if (!res.ok) {
    alert("Failed to change token.");
    return false;
  }
  return true;
}

async function updateBoard(index) {
  const req = await fetch('/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({index: index})
  });
  const res = await req.json();
  if (!req.ok) {
    alert("Failed to update board: " + res.message);
    throw new Error("Failed to update board");
  }
  return res;
}

export { tokenState, setToken, postToken, removeToken, getToken, changeToken, updateBoard };