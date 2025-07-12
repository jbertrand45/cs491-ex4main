import { tokenState, setToken, putToken, getToken } from './TokenState.js';

const pingBtn = document.getElementById('pingButton');
pingBtn.disabled = true;
const joinBtn = document.getElementById('joinButton');
let token = null;

joinBtn.onclick = async () => {
  if (joinBtn.innerText[0] === 'J') {
    const name = prompt("Enter your name to join:");
    if (!name) return alert("Name required.");
    token = setToken(name);
    const res = await fetch('/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token)
    })
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Room Full");
      return;
    }
    alert("Joined. Players: " + data.players.map(p => p.user).join(", "));
    joinBtn.innerText = 'Leave';
    pingBtn.disabled = false;
  }
  else {
    const res = await fetch('/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token)
    });

    token = null;
    pingBtn.disabled = true;
    joinBtn.innerText = 'Join';
  }
};

//pingButton on Click
pingBtn.onclick = async () => {
  pingBtn.disabled = true;

  //sending token to server
  const complete = await putToken(token);
  if (!complete) {
    alert("Failed to send token");
    pingBtn.disabled = false;
    return;

  }
  //polls the server for other player's ping
  const poll = setInterval(async () => {
    const serverToken = await getToken();
    if (!serverToken) return;

    if (serverToken.user !== token.user || serverToken.browser !== token.browser) {
      alert("It's your turn");
      console.log("It's your turn");
      pingBtn.disabled = false;
      clearInterval(poll);
    }
  }, 1000);
};

//


