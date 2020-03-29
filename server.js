require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT;

const app = express();

app.get('/', (req, res) => {
   console.log(req);
});

app.listen(PORT);