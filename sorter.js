const fs = require('fs');

const sorter = (path, newPath) => {
   const newFolders = new Set();

   fs.mkdir(`${__dirname}/${newPath}`, err => {
      if (err) throw err;

      const readDir = (path) => {
   
         fs.readdir(`${__dirname}/${path}`, (err, data) => {
            if (err) throw err;
   
            data.forEach((item, i) => {
               fs.stat(`${__dirname}/${path}/${item}`, (err, stats) => {
                  if (err) throw err;
                  
                  if (stats.isDirectory()) {
                     const nextLevelPath = `${path}/${item}`;
                     
                     readDir(`${nextLevelPath}`);
                  } else {
                     if (!newFolders.has(item.slice(0,1).toUpperCase())) {
                        newFolders.add(item.slice(0,1).toUpperCase());
                        
                        fs.mkdir(`${__dirname}/${newPath}/${item.slice(0,1).toUpperCase()}`, err => {
                           if (err) throw err;
                           
                           fs.rename(`${__dirname}/${path}/${item}`, `${__dirname}/${newPath}/${item.slice(0,1).toUpperCase()}/${item}`, err => {
                              if (err) throw err;
                           });
                        });
                     } else {
                        fs.rename(`${__dirname}/${path}/${item}`, `${__dirname}/${newPath}/${item.slice(0,1).toUpperCase()}/${item}`, err => {
                           if (err) throw err;
                        });
                     }
                  };
               });
            });
         });
      };
   
      readDir(path)
   });
};

sorter( ...process.argv.slice(2) );