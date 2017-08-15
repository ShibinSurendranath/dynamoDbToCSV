var assert = require('assert');
var fs = require('fs');
var Deferred = require("promised-io/promise").Deferred;
var convertor = require('../src/convertor.js')

/**
 * For unit testing injecting S3 Fetcher
 */
var s3FetcherInject = {};
s3FetcherInject.init = function(){};
s3FetcherInject.listObjects = function(s3Config){
    s3FetcherInject.s3Config = s3Config;
    var deferred = new Deferred();
    fs.readdir(s3Config.Bucket + "/" + s3Config.Prefix, function(err, files){
        if(err){
            deferred.reject(err);
            return;
        }
        deferred.resolve(files);
    })
    return deferred.promise;
}
s3FetcherInject.getObject = function(bucket, key){
    var deferred = new Deferred();
    fs.readFile(bucket + "/" + s3FetcherInject.s3Config.Prefix + "/" + key, function(err, data){
        if(err){
            deferred.reject(err);
            return;
        }
        deferred.resolve(data);
    })
    return deferred.promise;
}

/**
 * Injecting basic configuration
 */
var configInject = {};
configInject.dataset = { 
    Bucket: 'data',
    Delimiter: '/',
    Prefix: 'input/'//put a single slash (/) at the end
}

/**
 * Mocha based tests. 
 * 1. Basic flow
 * 2. With filter
 * 3. With exception while fetching files
 */    
describe("ConvertorTest", function(){
    describe("basicConversion", function(){
        it("Gets 4 entries and convert them correctly. Checking correctness of a field in row 1", function(done){
            new convertor.Convertor(s3FetcherInject, configInject).getS3Data(function(err, s3Data){
                if(err)
                    throw err;
                var rowData = s3Data.convertToTableData(configInject.filter).mergeAsRowData('#');
                var rows = rowData.split('\n');
                var fields = rows[0].split('#');
                var index = fields.indexOf("tenantId");
                fields = rows[1].split('#');
                assert(rows.length == 6);//last row empty
                assert(fields.indexOf('test1') == index);
                done();
            });
        })
    });
    describe("basicConversionWithFilter", function(){
        it("Gets one entry based on filter supplied", function(done){
            configInject.filter = {};
            configInject.filter.key = "tenantId";
            configInject.filter.value = "test2";
            new convertor.Convertor(s3FetcherInject, configInject).getS3Data(function(err, s3Data){
                if(err)
                    throw err;
                var rowData = s3Data.convertToTableData(configInject.filter).mergeAsRowData('#');
                var rows = rowData.split('\n');
                var fields = rows[0].split('#');
                var index = fields.indexOf("tenantId");
                fields = rows[1].split('#');
                assert(rows.length == 3);//last row empty
                assert(fields.indexOf('test2') == index);
                done();
            });
        })
    });
    describe("errorInS3Fetch", function(){
        it("No data from S3", function(done){
            configInject.dataset.Bucket = 'nosuchfolder';
            new convertor.Convertor(s3FetcherInject, configInject).getS3Data(function(err, s3Data){
                if(err)
                    done();
            });
        })
    })
})