module.exports.post = function (req, res) {
   console.log(req.body);
   const skills = require('../storage/storage')

   skills.setSkills(req.body);

   res.redirect(301, '../admin');
};