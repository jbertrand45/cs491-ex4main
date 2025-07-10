import { tokenState, setToken, putToken, getToken } from './TokenState.js';


const pingButton = document.getElementById('pingButton');
let token = null;

//pingButton on Click
pingButton.click = async () => {
  pingButton.disabled = true;

  //ask for name of user and sets the token
  if (!token) {
    const name = prompt("Enter your name:");
    if (!name) {
      alert("Name is required to ping.");
      pingButton.disabled = false;
      return;
    }
    //error handling for setToken
    token = await setToken(name);
    if (!token) {
      alert("Failed to create token.");
      pingButton.disabled = false;
      return;
    }

  }
}

//sending token to server
const complete = await putToken(token);
if (!complete) {
  alert("Failed to send token");
  pingButton.disabled = false;
  return;
}

console.log("waiting for response.....");

/*//getting token from server
const poll =  
*/