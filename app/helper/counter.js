const AWS = require('aws-sdk');
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';
require('dotenv').config();

AWS.config.update({
    region: process.env.region,
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    sessionToken: process.env.sessionToken
});

const BUCKET_NAME = "n10749527-counter";
const KEY = "counter.txt";
const s3 = new AWS.S3();

const params = {
    Bucket: BUCKET_NAME,
};

const params2 = {
    Bucket: BUCKET_NAME,
    Key: KEY
};


async function createBucket() {
    try {
        await s3.headBucket(params).promise();
        // console.log("Bucket Found");        
    }
    catch (e) {
        if (e.statusCode === 404) {
            await s3.createBucket(params).promise();
            console.log("Bucket Created");     
        }
    }
}


async function createCounter() {
    // create counter object if it doesn't exist
    try {
        await s3.headObject(params2).promise();
        // console.log("Counter object found");

    } catch (e) {
        // 404 counter not found
        if (e.statusCode === 404) {
            await s3.upload({
                Bucket: BUCKET_NAME,
                Key: 'counter.txt',
                Body: '0'
            }).promise();

            console.log('Counter object created');

        } else {
            console.log(e);
        }
    }
}

 
async function incrementCounter() {
    try {
        const data = await s3.getObject(params2).promise();

        if (data.Body) {
                let count = JSON.parse(data.Body.toString());
                count++;

            const params3 = {
                Bucket: BUCKET_NAME,
                Key: KEY,
                Body: JSON.stringify(count)
            }

            await s3.putObject(params3).promise();
            // console.log('Page views:', count);
            return count;
        }
    }
    catch (e) {
        console.log(e);
    }
}


async function addView() {
    await createBucket();
    await createCounter();
    let pageViews = await incrementCounter();
    return pageViews;
}

module.exports = addView;