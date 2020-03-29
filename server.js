require('dotenv').config();
const { format } = require('date-fns');
const http = require('http');
const PORT = process.env.PORT;
const delayInterval = process.env.DELAYINTERVAL;
const delayTimeout = process.env.DELAYTIMEOUT;
let timer = null;
let counter = 0;
let timeout = null;
let currentUTCTime = null;

const server = http.createServer((req, res) => {
         let currentTime = null;
   
         console.log('Запрос номер: ', ++counter);

         if (timeout) clearTimeout(timeout);
         
         res.writeHead(200, { 
            'Cache-Control': 'no-cache, max-age="0", no-store',
            'Content-Type': 'text/html; charset=utf-8',
            });
   
      if (!timer) {
         timer = setInterval(() => {
            currentTime = new Date();
            currentUTCTime = format(new Date(), 'RRRR-LL-dd HH:mm:ss');
   
            console.log(currentUTCTime);
         }, delayInterval);

         setTimeout(() => {
            console.log('response');
            res.write(`<h1>${currentUTCTime}</h1>`);
         }, delayTimeout);
      }
      timeout = setTimeout(() => {
         console.log('clearInterval');
         res.end(`<h1>${currentUTCTime}</h1>`);
         server.close();
         clearInterval(timer);
      }, delayTimeout);
   });

server.listen(PORT, () => {
   console.log('Сервер работает');
});