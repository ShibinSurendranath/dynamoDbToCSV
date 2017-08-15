var fs = require('fs');
var moment = require('moment');
var config = require('../config.js')
var csvWriter = {}

/**
 * Takes input data and writes to local file as specified in configuration
 */
csvWriter.writeFile = function(data, callback){
    var filePrefix = config.fileNamePrefix || "_";
    var fileName = "output/" + filePrefix +  moment().valueOf()+ ".csv";
    fs.openSync(fileName, 'w+');
    fs.writeFile(fileName, data, function(err) {
        if(err)
            throw err;
        callback(null, fileName);
    }); 
}

module.exports = csvWriter;
