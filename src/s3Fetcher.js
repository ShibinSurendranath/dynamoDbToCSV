var AWS = require('aws-sdk');
var Deferred = require("promised-io/promise").Deferred;
var s3Fetcher = {};
s3Fetcher.s3 = null;
/**
 * Setup S3 client
 */
s3Fetcher.init = function(s3Params){
    AWS.config.update(s3Params);
    this.s3 = new AWS.S3();
};

/**
 * List objects in S3 buckets. They should be DynamoDB JSON files.
 * Sample format givenn in data/input folder
 */
s3Fetcher.listObjects = function(dataset, page, keyArray){
    var deferred = new Deferred();
    this.s3.listObjects(dataset, function (err, data) {
        if(err){
            deferred.reject(err);
            return;
        }
        if(!data.Contents){
            deferred.reject('No Content');
            return;
        }
        for(var content of data.Contents){
            keyArray.push(content.Key);
        }
        if(!s3Fetcher.hasNextMarker(data.NextMarker)){
            deferred.resolve(keyArray);
        }
        else{
            dataset.Marker = data.NextMarker;
            //recursion
            s3Fetcher.listObjects(dataset, ++page, keyArray).then(function(data){
                deferred.resolve(keyArray);
            }, 
            function(err){
                //discarding existing data, not reading partially.
                //@TODO: Can save partial data and start from nextMarker next time on error
                deferred.reject(err);
            });
        }
    });
    return deferred.promise;
};

/**
 * Gets data for the key supplied. The data should be in dynamodb json format
 */
s3Fetcher.getObject = function(bucket, key){
    var deferred = new Deferred();
    this.s3.getObject({
        Bucket : bucket,
        Key : key
    }, function(err, data){
        if(err){
            deferred.reject(err);
            return;
        }
        deferred.resolve(data.Body.toString());
    });
    return deferred.promise;
};

/**
 * Checks next marker. maximum of 1000 files can be listed in one go, marker lets us know if there is another page to be read
 */
s3Fetcher.hasNextMarker = function(marker){
    if(marker && marker != '')
        return true;
    return false;
};
module.exports = s3Fetcher;

