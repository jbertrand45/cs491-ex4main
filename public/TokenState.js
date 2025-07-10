export class tokenState {
  constructor(user, browser) {
    this.user = user;
    this.browser = browser;
  }
}

export async function setToken(name) {
  const a = navigator.userAgent; // browser name string
  var agent = "Firefox"; // the default, ff order is important
  if (a.indexOf("Safari") > 0) agent = "Safari";
  if (a.indexOf("Chrome") > 0) agent = "Chrome";
  if (a.indexOf("OPR") > 0) agent = "Opera";

  return new tokenState(name, agent);
}

export async function putToken(token) {
  const action = await fetch('/putToken',{
    method : 'POST',
    headers : {'Content-Type': 'application/json'},
    body : JSON.stringify(needaname)
  })
}

export async function getToken() {
  const url = "https://example.org" //TODO

}