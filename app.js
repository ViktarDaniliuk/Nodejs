require('dotenv').config();
const path = require('path');
const express = require('express');
const PORT = process.env.PORT;
const bodyParser = require('body-parser');
const session = require('express-session');
// const fileUpload = require('express-fileupload');
// const formidable = require('formidable');

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

// app.use(fileUpload());

app.use(sessionMW);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'source', 'template', 'pages'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// app.post('/admin/upload', (req, res, next) => {
//    console.log('upload')
//    const form = formidable({ multiples: true });
  
//    form.parse(req, (err, fields, files) => {
//      if (err) {
//        next(err);
//        return;
//      }
//      console.log({ fields, files });
//    });
//  });

// app.post('/admin/upload', function (req, res) {

//    console.log(req.body);
//    console.log(req.body.photo);

//    // if (!req.body.photo) {
//    //    return res.status(400).send('No files were uploaded.');
//    // }

//    // let photo = req.body.photo;

//    // photo.mv('/public/img/products/filename.jpg', function(err) {
//    //    if (err) return res.status(500).send(err);

//    //    // res.send('File uploaded!');
//    // });

//       const form = formidable({ multiples: true });
   
//       form.parse(req, (err, fields, files) => {
//          res.writeHead(200, { 'content-type': 'application/json' });
//          console.log(JSON.stringify({ fields, files }, null, 2));
//       });

//    res.redirect(301, '../admin');
// });

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