//TokenState class 
export class tokenState {
  constructor(user, browser) {
    this.user = user;
    this.browser = browser;
  }
}

//creates a JS object
export function setToken(name) {
  const a = navigator.userAgent; // browser name string
  var agent = "Firefox"; // the default, ff order is important
  if (a.indexOf("OPR") > 0) var agent = "Opera";
  else if (a.indexOf("Chrome") > 0) var agent = "Chrome";
  else if (a.indexOf("Safari") > 0) var agent = "Safari";

  return new tokenState(name, agent);
}

//writes a token from Client to Server
export async function putToken(token) {
  const action = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(token)
  });
  return action.ok;
}

//Reads JSON file on the server, returns a JS token to the client
export async function getToken() {
  const response = await fetch('/token', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch token');
  }
  return await response.json();
}