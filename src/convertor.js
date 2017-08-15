var config = require('../config.js');
var s3Fetcher = require('./s3Fetcher.js');
var promised = require("promised-io/promise");
var csvWriter = require('./csvWriter.js');
var convertor = {};

/**
 * Convertor takes S3 Fetcher and Config. On invocation of getS3Data returns 
 * object of type S3Data
 */
convertor.Convertor = function(s3Fetcher, config){
    this.s3Fetcher = s3Fetcher;
    this.config = config;
    getS3Data = function(callback){
        s3Fetcher.init(config.s3Params);
        s3Fetcher.listObjects(config.dataset, 1, []).then(function(keyArray){
            var promises = [];
            for(var key of keyArray){
                promises.push(s3Fetcher.getObject(config.dataset.Bucket, key));
            }
            //Need to wait for all promises to be resolved
            promised.all(promises).then(function(dataArray){
                callback(null, new convertor.S3Data(dataArray));
            }, function(err){
                callback(err);
            });         
        }, 
        function(err){
            callback(err);
        });
    }
    return{
        getS3Data
    }
}

/**
 * Basically an array of DynamoDB JSON files. On invocation of convertToTableData it converts
 * dynamodb json to a flattened out normal json.
 */
convertor.S3Data = function(s3Data){
    this.s3Data = s3Data;
    tableData = [];
    fields = [];

    convertToTableData = function(filter){
        var filteredArray = [];
        for(var data of s3Data){
            if(data == null || data === '')
                continue;
            var obj = JSON.parse(data);
            if(filter && filter.key && filter.value){
                var filterValue = obj[filter.key];
                if(filterValue && filterValue['S'] && filterValue['S'] == filter.value)
                    filteredArray.push(obj);
            }
            else{
                filteredArray.push(obj);
            }    
        }
        for(var data of filteredArray){
            addRow(data);   
        }
        return new convertor.Table(tableData, fields);
    }

    addRow = function(data){
        tableData.push({});
        var basicJson = parseDynamoDbJson("", data);
    }

    /**
     * Add a field if not already added
     */
    addField = function(key, value){
        if(key == null)
            return;
        tableData[tableData.length -1][key] = value;
        if(fields.indexOf(key) == -1)
            fields.push(key);
    }

    /**
     * Parses DynamoDB json to normal json format. Nested fields are flattened out. For example a nested field
     * innerData in data is kept as data.innerData.
     * The functionality is limited to types S, N, L and M dynamodb types. 
     * @TODO: Extend for other types
     * Please read: http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.ResponseFormat
     */
    parseDynamoDbJson = function(prefixKey, dynamodbJson){
        var basicJson = {};
        for(var key in dynamodbJson){
            switch(key){
                case 'S' : {
                    addField(prefixKey, dynamodbJson[key]);
                    return dynamodbJson[key];
                }
                case 'N' : {
                    addField(prefixKey, dynamodbJson[key]);
                    return dynamodbJson[key];
                }
                case 'L' : {
                    var lArray = [];
                    for(var lValue of dynamodbJson[key]){
                        lArray.push(parseDynamoDbJson(null, lValue));
                    }
                    var arrayAsStr = JSON.stringify(lArray);
                    arrayAsStr = arrayAsStr.replace(/"/g, "'");
                    addField(prefixKey, '"' + arrayAsStr+ '"');
                    return arrayAsStr;
                }
                case 'M' : {
                    return parseDynamoDbJson(prefixKey, dynamodbJson[key]);
                }
                default : {
                    var newKey = key;
                    if(prefixKey && prefixKey != "")
                        newKey = prefixKey + "." + key;
                    basicJson[key] = parseDynamoDbJson(newKey, dynamodbJson[key]);
                }
            }
        }
        return basicJson;
    }
    return{
        convertToTableData,
        addRow,
        addField,
        parseDynamoDbJson,
        tableData,
        fields
    }
}

/**
 * Converts TableData to CSV sring. delimiter can be specified (not necessarily comma)
 */
convertor.Table = function(tableData, fields){
    this.tableData = tableData;
    this.fields = fields;
    mergeAsRowData = function(delimiter){
        var rowData = ""; 
        for(var index in fields){
            var key = fields[index];
            rowData += key;
            if(index < fields.length - 1)
                rowData += delimiter ;
        }
        rowData += '\n';
        for(var row of tableData){    
            rowData += "";  
            for(var index in fields){
                var key = fields[index];
                if(!row[key])
                    rowData += "";
                else
                    rowData += row[key] ;
                if(index < fields.length - 1)
                    rowData += delimiter ;
            }
            rowData += '\n';
        }
        return rowData;
    }

    return{
        mergeAsRowData
    }
}

module.exports = convertor;
