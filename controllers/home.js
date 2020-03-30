module.exports.get = function (req, res) {
  const skills = require('../storage/storage');

  res.render('index', { skills: skills.getSkills().skills });
};

module.exports.post = function (req, res) {
  const skills = require('../storage/storage');
  console.log(req.body);

  res.render('index', { skills: skills.getSkills().skills });
};