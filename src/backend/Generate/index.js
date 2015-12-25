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
        if (!isElmFile(filename)) return resolve(false);
        const filepath = directory + "/" + filename;
        return hasMain(filepath);
    });
};

const toPwd = function(filepath){
    if (filepath.startsWith('.')){
        return filepath.substr(1);
    }
    return filepath;
};
