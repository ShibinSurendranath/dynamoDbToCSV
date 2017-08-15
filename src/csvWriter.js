var fs = require('fs');
var moment = require('moment');
var config = require('../config.js')
var csvWriter = {}

const OUTPUT_FOLDER = "output/";
const NAME_SEPARATOR = "_";
const FILE_EXTENSION = ".csv";

/**
 * Takes input data and writes to local file as specified in configuration
 */
csvWriter.writeFile = function(data, callback){
    var filePrefix = config.fileNamePrefix || NAME_SEPARATOR;
    var fileName =  OUTPUT_FOLDER + filePrefix +  moment().valueOf()+ FILE_EXTENSION;
    fs.openSync(fileName, 'w+');
    fs.writeFile(fileName, data, function(err) {
        if(err)
            throw err;
        callback(fileName);
    }); 
}

module.exports = csvWriter;
