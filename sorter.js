const fs = require('fs');

const moveFile = (path, newFolderName, file, index) => {
   fs.rename(path, `${newFolderName}/${file}`, err => {
      if (err) throw err;

      
   });
}

const deleteFolders = (path) => {
   fs.readdir(`${__dirname}/${path}`, (err, data) => {
      if (err) throw err;

      if (data.length === 0) {
         fs.rmdir(`${__dirname}/${path}`, err => {
            if (err) throw err;
         });
      } else {
         data.forEach(item => {
            const nextLevelPath = `${path}/${item}`;

            deleteFolders(nextLevelPath);
         })
      };
   });
};

const sorter = (path, newPath) => {
   const newFolders = new Set();
   
   fs.mkdir(`${__dirname}/${newPath}`, err => {
      if (err) throw err;
      
      const readDir = (path) => {
         
         fs.readdir(`${__dirname}/${path}`, (err, data) => {
            if (err) throw err;

            data.forEach((item, i) => {
               const pathToItem = `${__dirname}/${path}/${item}`;
               const firstLetterOfTheFileName = `${__dirname}/${newPath}/${item.slice(0,1).toUpperCase()}`;

               fs.stat(pathToItem, (err, stats) => {
                  if (err) throw err;
                  
                  if (stats.isDirectory()) {
                     const nextLevelPath = `${path}/${item}`;
                     
                     readDir(`${nextLevelPath}`);
                  } else {
                     if (!newFolders.has(item.slice(0,1).toUpperCase())) {
                        newFolders.add(item.slice(0,1).toUpperCase());
                        
                        fs.mkdir(firstLetterOfTheFileName, err => {
                           if (err) throw err;

                           // moveFile(pathToItem, firstLetterOfTheFileName, item, i);
                           fs.rename(pathToItem, `${firstLetterOfTheFileName}/${item}`, err => {
                              if (err) throw err;
                        
                              fs.readdir(`${__dirname}/${path}`, (err, data) => {
                                 if (err) throw err;

                                 if (data.length !== 0) return;
                                 
                                 fs.rmdir(`${__dirname}/${path}`, err => {
                                    if (err) throw err;
                                 });
                              });
                           });
                        });
                     } else {
                        // moveFile(pathToItem, firstLetterOfTheFileName, item, i);
                        fs.rename(pathToItem, `${firstLetterOfTheFileName}/${item}`, err => {
                           if (err) throw err;
                           
                           fs.readdir(`${__dirname}/${path}`, (err, data) => {
                              if (err) throw err;

                              if (data.length !== 0) return;
                              
                              fs.rmdir(`${__dirname}/${path}`, err => {
                                 if (err) throw err;
                              });
                           });
                        });
                     };
                  };
               });
            });
         });
         // const deleteFolders = (path) => {
         //    fs.readdir(`${__dirname}/${path}`, (err, data) => {
         //       if (err) throw err;

         //       if (data.length === 0) {
         //          fs.rmdir(`${__dirname}/${path}`, err => {
         //             if (err) throw err;
         //          });
         //       } else {
         //          data.forEach(item => {
         //             const nextLevelPath = `${path}/${item}`;
   
         //             deleteFolders(nextLevelPath);
         //          })
         //       };
         //    });
         // };

      };
      
      readDir(path)
   });
};

sorter( ...process.argv.slice(2) );