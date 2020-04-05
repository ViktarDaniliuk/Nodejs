module.exports.get = async (ctx, next) => {
  const storage = require('../storage/storage');

  await ctx.render('index', { skills: storage.getSkills().skills, products: storage.getProducts().products, msgsemail: ctx.flash('email')[0] });
};

module.exports.post = async(ctx, next) => {
  console.log(ctx.request.body);

  ctx.flash('email', 'Сообщение отправлено успешно.');
  ctx.redirect('/');
};