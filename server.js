require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');
const bodyParser = require('body-parser');
// const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const uuidv4 = require('uuid/v4');
const io = require('socket.io')(server);
const PORT = process.env.PORT;

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
   password: String,
   accessToken: String,
   refreshToken: String,
   accessTokenExpiredAt: Date,
   refreshTokenExpiredAt: Date
});

const newsScheme = new Schema({
   id: mongoose.Schema.Types.ObjectId,
   created_at: Date,
   text: String,
   title: String,
   user: {
      firstName: String,
      id: String,
      image: String,
      middleName: String,
      surName: String,
      username: String
   }
});

mongoose.connect('mongodb://localhost:27017/usersdb', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('mongodb://vdaniliuk.ru/usersdb', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('users', userScheme);
const News = mongoose.model('news', newsScheme);

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
app.use(express.static(path.join(__dirname, 'public')));
// на все запросы отправляем заголовки
app.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
   res.setHeader('Access-Control-Allow-Credentials', true);

   next();
});

app.get('/api/profile', function (req, res) {

   User.findOne({ 'accessToken': req.headers.authorization }, function (err, user) {
      if (err) throw err;

      return res.status(200).json({
         firstName: user.firstName,
         id: user._id,
         image: user.image,
         middleName: user.middleName,
         permission: { ...user.permission },
         surName: user.surName,
         username: user.username
      });
   });
});
// возврат всех пользователей из базы
app.get('/api/users', function(req, res) {
   User.find(function (err, users) {
      if (err) throw err;

      res.status(200).json(users);
   });
});
// на все get-запросы '/' отправляем index.html
app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// обработка запроса на регистрацию
app.post('/api/registration', function (req, res) {

   const user = new User({
      firstName: req.body.firstName,
      surName: req.body.surName,
      middleName: req.body.middleName,
      username: req.body.username,
      password: req.body.password,
      permission: {
         chat: { C: true, R: true, U: true, D: true },
         news: { C: false, R: true, U: false, D: false },
         settings: { C: false, R: false, U: false, D: false }
      }
   });

   user.save()
      .then(function (doc) {
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
      middleName: req.body.middleName
   });
});
// обработка запроса на логирование
app.post('/api/login', function (req, res, next) {
   passport.authenticate('local', (err, user, info) => {
      if (err) {
         return next(err);
      }
      if (!user) {
         return res.send('Укажите правильный логин и пароль!');
      };

      const tokens = {
         accessToken: uuidv4(),
         refreshToken: uuidv4(),
         accessTokenExpiredAt: new Date(+new Date() + 86400000),
         refreshTokenExpiredAt: new Date(+new Date() + 7200000),
      };

      User.updateOne(
         { 'username': user.username }, 
         {$set: {...tokens }},
         function(err, data) {
            if (err) throw err;
         }
      );
            
      req.login(user, err => {
         return res.status(200).json({
            firstName: user.firstName,
            id: user._id,
            image: user.image,
            middleName: user.middleName,
            permission: { ...user.permission },
            surName: user.surName,
            username: user.username,

            ...tokens
         });
      });
   })(req, res, next);
});
// !!!!!!!НЕ РАБОТАЕТ!!!!!!!!
// обработка запроса на обновление токена доступа
// app.post('/api/refresh-token', function (req, res) {
//    console.log('251: ', req.body);
// });
// обработка запроса на получение новостей
app.get('/api/news', function(req, res) {

   News.find(function (err, news) {
      if (err) throw err;

      res.status(200).json(news);
   })
});
// app.patch('/api/news/:id', function(req, res) {
//    console.log('312: ', req.params);
// });
// обработка запроса на создание новой новости
app.post('/api/news', function(req, res) {
   const { text, title } = req.body;

   User.findOne({ 'accessToken': req.headers.authorization }, function (err, user) {
      if (err) throw err;
      
      return user;
   })
   .then((user = {}) => {
      const news = new News({
         created_at: new Date(),
         text: text,
         title: title,
         user: {
            firstName: user.firstName,
            id: user._id,
            image: user.image,
            middleName: user.middleName,
            surName: user.surName,
            username: user.username
         }
      });

      news.save()
         .then(function (doc) {
            return doc;
         })
         .then((doc) => {
            News.find(function (err, news) {
               if (err) throw err;
               
               mongoose.disconnect();
               return res.status(200).json(news);
            });
         })
         .catch(function (err) {
            console.log(err);
            mongoose.disconnect();
         });
   });
});
// обработка запроса на изменение новости
// app.patch('/api/news/:id', function(req, res) {
//    console.log('312: ', req.params);
// });
// обработка запроса на удаление новости
// app.delete('/api/news/:id', function(req, res) {
//    console.log('312: ', req.params);
// });
// !!!!!!!НЕ РАБОТАЕТ!!!!!!!!
// app.patch('/api/profile', function(req, res) {

//    console.log('317: req.body: ', req.body);
//    if (req.isAuthenticated()) {
//       console.log('319: req.body: ', req.body);
      
//    } else {
//       res.redirect(301, '/');
//    }
// });

const clients = {};

io.on('connection', socket => {
   clients[socket.id] = {};
   
   socket.on('users:connect', data => {
      User.find({ username: data.username }, function (err, user) {
         if (err) throw err;
         
         return user;
      })
      .then(user => {
         const chatUsers = Object.keys(clients).map(key => clients[key] );

         socket.emit('users:list', chatUsers);

         clients[socket.id]['username'] = user[0].username;
         clients[socket.id]['socketId'] = socket.id;
         clients[socket.id]['userId'] = user[0]._id;
         clients[socket.id]['activeRoom'] = null;

         socket.broadcast.emit('users:add', clients[socket.id]);
      });
   });
   

   socket.on('message:history', data => {
      console.log('message:history data: ', data);
   });

   socket.on('message:add', message => {
      socket.broadcast.emit('message:add', { ...message, senderId: socket.id });
      socket.emit('message:add', message);
   });

   socket.on('disconnect', () => {
      const id = socket.id;

      socket.broadcast.emit('users:leave', clients[id]['socketId']);
      delete clients[id];
   });
});

server.listen(PORT);