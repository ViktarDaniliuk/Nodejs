module.exports.get = function (req, res) {
   const skills = require('../storage/storage');

   if (req.session.isAuth) {
      res.render('admin', { skills: skills.getSkills().skills });
   }
};