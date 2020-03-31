module.exports.post = function (req, res) {
   console.log(req.body);
   console.log(req.files);

   if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
   }

   let sampleFile = req.files.sampleFile;

   sampleFile.mv('/public/img/products/filename.jpg', function(err) {
      if (err) return res.status(500).send(err);

      // res.send('File uploaded!');
   });

   res.redirect(301, '../admin');
};