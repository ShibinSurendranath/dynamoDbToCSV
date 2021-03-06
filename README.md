# Introduction
The project provides a way to export DynamoDB `JSON` data stored in S3 as a single CSV file. 
If you are not using AWS Data pipeline (for example cost or regional avialibility reasons), backing up dynamodb data periodically in S3 (in `JSON` format) is an alternative. Each row of a table is stored seperately (in `JSON` format). It is imperative to view this stored data together in a readbale format such as CSV (comma seperated values).

For the dynamodb `JSON` format please refer the 
[link](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.ResponseFormat)

For data backup to S3 you could use [dynamodb-backup-restore](https://www.npmjs.com/package/dynamodb-backup-restore) or [dynamo-backup-to-s3](https://github.com/markitx/dynamo-backup-to-s3)

# Installation
You need to jave [nodejs](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) to use the program. You can use 
[git](https://git-scm.com/) to clone the repository.
* `git clone https://github.com/ShibinSurendranath/dynamoDbToCSV.git` 

To start please do
* `npm install`

# Usage
You can run the program by 
* `node src/main.js`

The output is written to `output` folder. You need to have permission to write files to the folder.

You need to make relevant configuration changes to run the program in `config.js`.

The Mapped data is flattened out in the CSV file. So if you have a `JSON` with nested attribute `inner` inside `outer` attribute, you would see the field mapping in CSV file as `outer.inner`.
List data is not flatted and written in `JSON` format (including any nested data).

Alternatively you can pass following command line arguments in order (keys corresponding to `config.js` also given)
1. AWS access key to access S3
    * `config.s3Params.accessKeyId`
2. AWS secret key to access S3
    * `config.s3Params.secretAccessKey`
3. AWS bucket name
    * `config.dataset.Bucket`
4. Key prefix (folder in S3) where files are stored
    * `config.dataset.Prefix`
5. delimiter for CSV (to be used instead of comma(`,`))
    * `config.delimiter`
6. Filter key (If you need to filter data based on an attribute/value). Default is none
    * `config.filter.key`
7. Filter value (If you need to filter data based on an attribute/value). Default is none
    * `config.filter.value`
8. CSV filename prefix (Default is `File_`)
    * `config.fileNamePrefix`

If you need to skip an argument please provide a value `X`. You could also choose to not give any arguments

## Sample Data
Please see some sample `JSON` in folder `data/input`. For sample CSV file refer `sample.csv` 

# Testing
Unit tests are written using mocha. You can run by command
* `node-modules/mocha/bin/mocha`

A few tests are available in the source file `test/convertorTest.js`

The data used for testing is stored in 'data/input'

# Source code
Following are the source files (src folder)
1. `main.js` 
    * Start point of program
2. `convertor.js`
    * Entire conversion logic resides here
3. `s3Fetcher.js` 
    * S3 reading functions
4. `csvWriter.js`
    * File writer

# Limitations
1. Data Types: Only following datatypes in dynamodb `JSON` are support
    * `S` (String)
    * `N` (Number)
    * `L` (List)
    * `M` (Map)
Other types can be supported easily by adding handling in parseDynamoDbJson method

2. comma seperation
The CSV logic can have issues if your data contains the same delimiter as used by CSV

# Contact and support
Please contact `shibin@pathtracker.io` for any queries.

# Contributing
Please contact me if you like to contribute to the project.

# Issues
1. Error: ENOENT: no such file or directory, open 'output .....
* This error occurs when you the output folder is not created.


# Improvements
Some possible improvements
* Support for all DynamoDB datatypes
* Support for direct DynamoDB access (direct export from dynamoDb)
* Support S3 write of CSV file

# Copyright

Distributed under MIT license