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
  try {
    const res = await fetch('/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null; // Only map if data is an array
    return data.map(item => new tokenState(item.user, item.browser));
  } catch (err) {
    console.error("getToken error:", err);
    return null;
  }
}