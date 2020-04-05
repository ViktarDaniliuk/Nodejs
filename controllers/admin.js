module.exports.get = async (ctx, next) => {
   const storage = require('../storage/storage');

   if (ctx.session.isAuth) {
      await ctx.render('admin', { skills: storage.getSkills().skills, msgskill: ctx.flash('msgskill')[0], msgfile: ctx.flash('msgfile')[0] });
   } else {
      ctx.redirect('/login');
   }
};