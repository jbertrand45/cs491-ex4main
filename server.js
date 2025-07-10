const express = require('express');

const app = express();
const port = 3000;

let tokenStore = null;

app.use(express.static('public'));
app.use(express.json());

// save token
app.post('/token', (req, res) => {
  tokenStore = req.body;
  console.log('token successfully stored', tokenStore);
})

// get token
app.get('/token', (req, res) => {
  if (!tokenStore) {
    return res.status(404).send("test");
  }
  res.json(tokenStore);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
