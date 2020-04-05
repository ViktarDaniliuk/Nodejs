module.exports.get = async (ctx, next) => {
   await ctx.render('login', { msgslogin: ctx.flash('msgslogin')[0] });
};

module.exports.post = async (ctx, next) => {
   const storage = require('../storage/storage');
   const adminData = storage.getAdminData().admin[0];
   console.log(ctx.request.body);

   if (ctx.request.body.email === adminData.email && ctx.request.body.password === adminData.password) {
      ctx.flash('msgslogin', 'Логирование прошло успешно.');
      ctx.session.isAuth = true;
      return ctx.redirect('/admin');
   };

   await ctx.render('login');
};