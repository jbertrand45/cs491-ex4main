import { tokenState, setToken, putToken, getToken } from './TokenState.js';

const pingBtn = document.getElementById('pingButton');
pingBtn.disabled = true;
const joinBtn = document.getElementById('joinButton');
let token = null;

joinBtn.onclick = async () => {
  const name = prompt("Enter your name to join:");
  if (joinBtn.innerText[0] === 'J') {
    if (!name) return alert("Name required.");
    const token = setToken(name);
    const res = await fetch('/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token)
    })
    const data = await res.json();
    if (res.ok) {
      alert("Joined. Players: " + data.players.map(p => p.user).join(", "))
    }
    else {
      alert(data.message);
    }
    joinBtn.innerText = 'Leave'
  }
  else {
    const res = await fetch('/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token)
    })
  }
}

// //pingButton on Click
// pingBtn.onclick = async () => {
//   pingBtn.disabled = true;

//   //ask for name of user and sets the token
//   if (!token) {
//     const name = prompt("Enter your name:");
//     if (!name) {
//       alert("Name is required to ping.");
//       pingBtn.disabled = false;
//       return;
//     }
//     //error handling for setToken
//     token = await setToken(name);
//     if (!token) {
//       alert("Failed to create token.");
//       pingBtn.disabled = false;
//       return;
//     }

//   }
// }

// //sending token to server
// const complete = await putToken(token);
// if (!complete) {
//   alert("Failed to send token");
//   pingBtn.disabled = false;
//   return;
// }

console.log("waiting for response.....");

/*//getting token from server
const poll =  
*/