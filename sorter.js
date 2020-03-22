const fs = require('fs');

function promisify(fn) {
   return function(...args) {
      return new Promise((resolve, reject) => {
         fn(...args, (err, data) => {
            if (err) return reject(err);

            resolve(data);
         });
      });
   };
};

const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const moveFile = (path, newFolderName, file) => {
   rename(path, `${newFolderName}/${file}`)
      .catch(err => { throw err });
};

const sorter = (path, newPath) => {
   const newFolders = new Set();
   
   mkdir(`${__dirname}/${newPath}`)
      .then(() => {
         const readDir = (path) => {
            
            readdir(`${__dirname}/${path}`)
               .then(data => {
                  data.forEach(item => {
                     const pathToItem = `${__dirname}/${path}/${item}`;
                     const firstLetterOfTheFileName = `${__dirname}/${newPath}/${item.slice(0,1).toUpperCase()}`;
      
                     stat(pathToItem)
                        .then(stats => {
                           if (stats.isDirectory()) {
                              const nextLevelPath = `${path}/${item}`;
                              
                              readDir(`${nextLevelPath}`);
                           } else {
                              if (!newFolders.has(item.slice(0,1).toUpperCase())) {
                                 newFolders.add(item.slice(0,1).toUpperCase());
                                 mkdir(firstLetterOfTheFileName)
                                    .then(moveFile(pathToItem, firstLetterOfTheFileName, item))
                              } else {
                                 moveFile(pathToItem, firstLetterOfTheFileName, item);
                              };
                           }
                        })
                  });
               })
         };
         
         readDir(path);
      })
      .catch(err => { throw err })
};

sorter( ...process.argv.slice(2) );