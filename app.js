require('dotenv').config();
const path = require('path');
const express = require('express');
const PORT = process.env.PORT;
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const app = express();

sessionMW = session({
   secret: "common:session",
   key: "sessionkey",
   cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
   },
   saveUninitialized: false,
   resave: false
});

app.use(fileUpload());

app.use(sessionMW);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'source', 'template', 'pages'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/admin/upload', function (req, res) {
   console.log(req.body.photo);

   if (!req.body.photo) {
      return res.status(400).send('No files were uploaded.');
   }

   let sampleFile = req.body.photo;
   console.log(sampleFile);

   sampleFile.mv('/public/img/products/filename.jpg', function(err) {
      if (err) return res.status(500).send(err);

      // res.send('File uploaded!');
   });

   res.redirect(301, '../admin');
});

app.use('/', require('./routes/index'));

app.use((req, res, next) => {
   let err = new Error('Not Found');

   err.status = 404;
   next(err);
});

app.use((err, req, res, next) => {
   res.status(err.status || 500);
   res.render('error', { message: err.message, error: err });
});

app.listen(PORT);