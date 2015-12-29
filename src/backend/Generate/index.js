const path = require('path');

const isElmFile = function(filename){
    return path.extname(filename) === '.elm';
};

const hasMain = function(filepath){
    return new Promise(function(resolve, reject){
        fs.readFile(filepath, function(err, data){
            if (err){
                return reject(err);
            }

            return resolve(data.indexOf('\nmain') > -1);
        });
    });
};

// This function is dumb because JS is dumb
const isValidMainFile = function(directory, filename){
    return new Promise(function(resolve, reject){
        if (!isElmFile(filename)){
            return resolve(false);
        }

        const filepath = path.join(directory, filename);
        return hasMain(filepath);
    });
};

const toPwd = function(filepath){
    if (filepath.startsWith('.')){
        return filepath.substr(1);
    }
    return filepath;
};


const isLegitFolder = function(path){
    const illegitFolders = [
        '.',
        '..',
        'elm-stuff'
    ];

    return illegitFolders.indexOf(path) === -1;
};

const getDirectoryInfo = function(directory){
    return new Promise(function(resolve, reject){
        fs.readdir(directory, function(err, files){
            if (err){
                return reject(err);
            }

            const fileStats = files.map(function(file){
                return new Promise(function(resolve, reject){
                    fs.stat(file, function(err, stat){
                        if (err) {
                            return reject(err);
                        }

                        return resolve({
                            file: file,
                            stat: stat
                        });
                    });
                });
            });


            Promise.all(fileStats).then(function(stats){
                const directories = [];
                const files = [];

                // files with main in
                const mainFiles = [];

                stats.forEach(function(meta){
                    const file = meta.file;
                    const stat = meta.stat;

                    if (stat.isDirectory()){
                        if (isLegitFolder(file)){
                            directories.push(file);
                        }
                    } else {
                        if (isValidMainFile(directory, file)){
                            mainFiles.push(file);
                        } else {
                            files.push(file);
                        }
                    }
                });


                return resolve({
                    directories: directories
                    files: files
                });
            });
        })
    });
};
