import { tokenState, setToken, putToken, getToken } from './TokenState.js';


const pingButton = document.getElementById('pingBtn');
const joinButton = document.getElementById('joinBtn');

let token = null;
let isJoined = false;
pingButton.disabled = true;

//sending token to server
// const complete = await putToken(token);
// if (!complete) {
//   alert("Failed to send token");
//   pingButton.disabled = false;
//   //return;
// }

//pingButton on Click
pingButton.addEventListener('click', async () => {
  pingButton.disabled = true;

  //ask for name of user and sets the token
  if (!token) {
    const name = prompt("Enter your name:");
    if (!name) {
      alert("Name is required to ping.");
      pingBtn.disabled = false;
      return;
    }
    //error handling for setToken
    token = await setToken(name);
    if (!token) {
      alert("Failed to create token.");
      pingBtn.disabled = false;
      return;
    }
    console.log("Joined game", token);
  }
}

console.log("waiting for response.....");

/*//getting token from server
const poll =  
*/