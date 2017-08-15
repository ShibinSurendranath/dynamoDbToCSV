/**
 * Start file to run program
 */
var config = require('../config.js');
var s3Fetcher = require('./s3Fetcher.js');
var csvWriter = require('./csvWriter.js');
var convertor = require('../src/convertor.js');

var valueArray = [];
process.argv.forEach((value, index) => {
    if(index > 1 && index < 10){
        if(value == 'X')
            value = null;
        valueArray.push(value);
    }
});

var setConfig = function(array){
    config.s3Params.accessKeyId = array[0] || config.s3Params.accessKeyId;
    config.s3Params.secretAccessKey = array[1] || config.s3Params.secretAccessKey;
    config.dataset.Bucket = array[2] || config.dataset.Bucket;
    config.dataset.Prefix = array[3] || config.dataset.Prefix;
    config.delimiter = array[4] || config.delimiter;
    config.filter.key = array[5] || config.filter.key ;
    config.filter.value = array[6] || config.filter.value;
    config.fileNamePrefix = array[7] || config.fileNamePrefix;
}
setConfig(valueArray);
/**
 * Calls convertor to get S3 data in async manner
 */
convertor.Convertor(s3Fetcher, config).getS3Data(function(err, s3Data){
    if(err)
        throw err;
    var rowData = s3Data.convertToTableData(config.filter).mergeAsRowData(config.delimiter);
    csvWriter.writeFile(rowData, function(data){
        console.log("File written succesfully " + data);
    });
}) 