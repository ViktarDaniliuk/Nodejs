module.exports.get = function (req, res) {
   res.render('login');
};

module.exports.post = function (req, res) {
   console.log(req.body);

   if (req.body.email === 'dvs@mail.ru' && req.body.password === '123') {
      req.session.isAuth = true;
      res.redirect(301, '/admin');
   }
   
   res.redirect(301, '/');
};