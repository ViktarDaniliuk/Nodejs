require('dotenv').config();
const path = require('path');
const express = require('express');
const PORT = process.env.PORT;
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

sessionMW = session({
   secret: "common:session",
   key: "sessionkey",
   cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 86400000
   },
   saveUninitialized: false,
   resave: false
});

app.use(sessionMW);

app.use(flash());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'source', 'template', 'pages'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
   const storage = require('./storage/storage');

   res.render('index', { skills: storage.getSkills().skills, products: storage.getProducts().products, msgsemail: req.flash('email')[0] });
});

app.post('/', function (req, res) {
   // const storage = require('./storage/storage');
   console.log(req.body);

   req.flash('email', 'Сообщение отправлено успешно.');
   res.redirect(301, '/');
   // res.render('index', { skills: storage.getSkills().skills, products: storage.getProducts().products, msgsemail: req.flash('msgsemail') });
});

app.get('/login', function (req, res) {
   res.render('login', { msgslogin: req.flash('msgslogin')[0] });
});

app.post('/login', function (req, res) {
   const storage = require('./storage/storage');
   const adminData = storage.getAdminData().admin[0];
   console.log('req.body: ', req.body);
   
   if (req.body.email === adminData.email && req.body.password === adminData.password) {
      req.flash('msgslogin', 'Логирование прошло успешно.');
      req.session.isAuth = true;
      return res.redirect(301, '/admin');
   }
   res.render('login');
   // res.redirect(301, '/');
});

app.get('/admin', function (req, res) {
   const storage = require('./storage/storage');

   if (req.session.isAuth) {
      res.render('admin', { skills: storage.getSkills().skills, msgskill: req.flash('msgskill')[0], msgfile: req.flash('msgfile')[0] });
   }
});

app.post('/admin/skills', function (req, res) {
   console.log(req.body);
   const storage = require('./storage/storage')

   storage.setSkills(req.body);

   req.flash('msgskill', 'Данные изменены успешно.');
   res.redirect(301, '/admin');
});

app.use('/admin/upload', fileUpload(), function (req, res) {
   const storage = require('./storage/storage');
   const product = {};
   
   if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
   };
   
   let sampleFile = req.files.photo;
   
   product.src = `./img/products/${req.files.photo.name}`;
   product.name = req.body.name;
   product.price = req.body.price;
   storage.setProducts(product);

   sampleFile.mv(`${__dirname}/public/img/products/${req.files.photo.name}`, function(err) {
      if (err) return res.status(500).send(err);
   });
   
   req.flash('msgfile', 'Продукт добавлен успешно.');
   res.redirect(301, '/admin');
});

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