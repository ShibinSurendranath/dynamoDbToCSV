var config = {};
config.dataset = { 
    Bucket: 'myBucket',//S3 bucket
    Delimiter: '/',
    Prefix: 'myFolder/'//put a single slash (/) at the end
};
config.s3Params = { 
    accessKeyId: 'testKey', //give access keyId
    secretAccessKey: 'testSecret', //give secret key
    region: 'ap-south-1'
};
config.filter = { 
    key: '', //give value for filter (would not work for nested keys)
    value: '' //value for the above key
};
config.fileNamePrefix = "File_";
config.delimiter = ","
module.exports = config;