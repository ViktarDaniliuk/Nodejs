require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const uuidv4 = require('uuid/v4');
const PORT = process.env.PORT;

const app = express();

//----------------------
//--- MongoDB START ----
//----------------------
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
mongoose.set('debug', true);

const userScheme = new Schema({
   firstName: String,
   id: mongoose.Schema.Types.ObjectId,
   image: String,
   middleName: String,
   permission: {
      chat: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
      news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
      settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean }
   },
   surName: String,
   username: String,
   password: String
});

mongoose.connect('mongodb://localhost:27017/usersdb', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('users', userScheme);
// const user = new User({
//    firstName: "Viktar",
//    surName: "Daniliuk",
//    username: "DVS"
// });

// user.save()
//    .then(function (doc) {
//       console.log("Сохраненный объект: ", doc);
//       mongoose.disconnect();
//    })
//    .catch(function (err) {
//       console.log(err);
//       mongoose.disconnect();
//    });

// User.remove({ 'firstName': 'Ivan'}, function (err, person) {
//    if (err) return handleError(err);
// });

// User.find({ 'firstName': 'Viktar'}, function (err, user) {
//    if (err) throw err;

//    console.log('User: ',user);
// });
//----------------------
//---- MongoDB END -----
//----------------------



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

sessionMW = session({
   secret: "common:session",
   key: "sessionkey",
   store: new FileStore(),
   cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 86400000
   },
   saveUninitialized: false,
   resave: false,
   rolling: true
});

app.use(sessionMW);

passport.use(
   new LocalStrategy(
      {
         usernameField: 'username'
      },
      (username, userPassword, done) => {
         User.findOne({ 'username': username }, function (err, user) {
            if (err) throw err;

            // console.log('user: ', userPassword);
            // console.log('user: ', user.password);
            if (userPassword === user.password) {
               console.log('Password is correct!');
               return done(null, user);
            } else {
               console.log('Password is incorrect!');
               return done(null, false);
            };
         });
      }
   )
);

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser((id, done) => {
   User.findOne({where: {id}}).then((user) => {
      done(null, user);
      return null;
   });
});

app.use(passport.initialize());
app.use(passport.session());
// отдаем статические файлы
app.use(express.static(path.join(__dirname, 'build')));
// на все запросы отправляем заголовки
app.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
   res.setHeader('Access-Control-Allow-Credentials', true);

   next();
});
// на все get-запросы '/' отправляем index.html
app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// обработка запроса на регистрацию
app.post('/api/registration', function (req, res) {
   // console.log(req.body);

   const user = new User({
      firstName: req.body.firstName,
      surName: req.body.surName,
      middleName: req.body.middleName,
      username: req.body.username,
      password: req.body.password
   });

   user.save()
      .then(function (doc) {
         console.log("Сохраненный объект: ", doc);
         mongoose.disconnect();
      })
      .catch(function (err) {
         console.log(err);
         mongoose.disconnect();
      });

   res.status(201).json({
      username: req.body.username,
      surName: req.body.surName,
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      // permission: {
         // chat: { C: true, R: true, U: true, D: true },
         // news: { C: false, R: true, U: false, D: false },
         // settings: { C: false, R: false, U: false, D: false }
      // },
      // acceptToken: 'string',
      // refreshToken: 'string',
      // accessTokenExpiredAt: 'string',
      // refreshTokenExpiredAt: 'string',
   })
});
// обработка запроса на логирование
app.post('/api/login', function (req, res, next) {
   passport.authenticate('local', (err, user, info) => {
      if (err) {
         return next(err);
      }
      if (!user) {
         return res.send('Укажите правильный логин и пароль!');
      }
      req.login(user, err => {
         return res.status(200).json({
            firstName: user.firstName,
            id: user._id,
            image: user.image,
            middleName: user.middleName,
            permission: {
               chat: { C: true, R: true, U: true, D: true },
               news: { C: false, R: true, U: false, D: false },
               settings: { C: false, R: false, U: false, D: false }
            },
            surName: user.surName,
            username: user.username,

            accessToken: uuidv4(),
            refreshToken: uuidv4(),
            accessTokenExpiredAt: new Date(+new Date() + 86400000),
            refreshTokenExpiredAt: new Date(+new Date() + 7200000),
         });
      });
   })(req, res, next);
});

app.post('/api/refresh-token', function (req, res) {
   
   console.log(req.body);
});

// app.get('/login', function (req, res) {
//    res.render('login', { msgslogin: req.flash('msgslogin')[0] });
// });

// app.post('/login', function (req, res) {
//    const storage = require('../server/storage/storage');
//    const adminData = storage.getAdminData().admin[0];
//    console.log('req.body: ', req.body);
   
//    if (req.body.email === adminData.email && req.body.password === adminData.password) {
//       req.flash('msgslogin', 'Логирование прошло успешно.');
//       req.session.isAuth = true;
//       return res.redirect(301, '/admin');
//    }
//    res.render('login');
//    // res.redirect(301, '/');
// });

// app.get('/admin', function (req, res) {
//    const storage = require('../server/storage/storage');

//    if (req.session.isAuth) {
//       res.render('admin', { skills: storage.getSkills().skills, msgskill: req.flash('msgskill')[0], msgfile: req.flash('msgfile')[0] });
//    }
// });

// app.post('/admin/skills', function (req, res) {
//    console.log(req.body);
//    const storage = require('../server/storage/storage')

//    storage.setSkills(req.body);

//    req.flash('msgskill', 'Данные изменены успешно.');
//    res.redirect(301, '/admin');
// });

// app.use('/admin/upload', fileUpload(), function (req, res) {
//    const storage = require('../server/storage/storage');
//    const product = {};
   
//    if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).send('No files were uploaded.');
//    };
   
//    let sampleFile = req.files.photo;
   
//    product.src = `./img/products/${req.files.photo.name}`;
//    product.name = req.body.name;
//    product.price = req.body.price;
//    storage.setProducts(product);

//    sampleFile.mv(`${__dirname}/public/img/products/${req.files.photo.name}`, function(err) {
//       if (err) return res.status(500).send(err);
//    });
   
//    req.flash('msgfile', 'Продукт добавлен успешно.');
//    res.redirect(301, '/admin');
// });

// app.use((req, res, next) => {
//    let err = new Error('Not Found');

//    err.status = 404;
//    next(err);
// });

// app.use((err, req, res, next) => {
//    res.status(err.status || 500);
//    res.render('error', { message: err.message, error: err });
// });

app.listen(PORT, () => {
   console.log(`Server: localhost:${PORT}`)
});