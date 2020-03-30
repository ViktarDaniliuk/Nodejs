module.exports.post = function (req, res) {
   console.log(req.body);

   res.redirect(301, '../admin');
};