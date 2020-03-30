const low = require('lowdb');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(path.join(__dirname, 'storage.json'));
const db = low(adapter);

module.exports.getSkills = () => {

   return {
      skills: db.get("skills").value()
   };
};

module.exports.setSkills = (objSkills) => {
   db.get("skills").value().forEach(item => {
      const newValue = objSkills[item.id];
      db.get("skills")
         .find({ id: item.id })
         .assign({ number: parseInt(newValue) })
         .write();
   })
};