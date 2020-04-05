module.exports.post = async (ctx, next) => {
   const storage = require('../storage/storage');
   console.log(ctx.request.body);
   
   storage.setSkills(ctx.request.body);
   
   await ctx.flash('msgskill', 'Данные изменены успешно.');
   await ctx.redirect('/admin');
};