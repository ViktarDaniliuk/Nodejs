require('dotenv').config()
const http = require('http');
const PORT = process.env.PORT;
const delayInterval = process.env.DELAYINTERVAL;
const delayTimeout = process.env.DELAYTIMEOUT;

const server = http.createServer((req, res) => {

   if (req.url === '/') {
   let currentTime = null;
   const timer = setInterval(() => {
      currentTime = new Date();
      currentUTCTime = `${currentTime.getUTCFullYear()}-${currentTime.getUTCMonth() + 1}-${currentTime.getUTCDate()} ${currentTime.getUTCHours()}:${currentTime.getUTCMinutes()}:${currentTime.getUTCSeconds()}`;

      console.log(currentUTCTime);
   }, delayInterval);

   setTimeout(() => {
      clearInterval(timer);
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      res.end(`<h1>${currentUTCTime}</h1>`);
      server.close();
   }, delayTimeout);
   } 
   else if (req.url === '/favicon.ico') {
      process.exit();
   };
});

server.listen(PORT, () => {
   console.log('Сервер работает');
});