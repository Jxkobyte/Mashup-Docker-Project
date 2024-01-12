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
const KEY = "database.csv";
const s3 = new AWS.S3();

const params = {
    Bucket: BUCKET_NAME,
    Key: KEY
};


async function createDatabase() {
    // create db object if it doesn't exist
    try {
        await s3.headObject(params).promise();
        // console.log("db object found");

    } catch (e) {
        // 404 counter not found
        if (e.statusCode === 404) {
            await s3.upload({
                Bucket: BUCKET_NAME,
                Key: KEY,
                Body: `name, url\n`
            }).promise();

            console.log('database file created');

        } else {
            console.log(e);
        }
    }
}

 
async function addPokemon(name, url) {
    try {
        const data = await s3.getObject(params).promise();

        if (data.Body) {
            
            let d = data.Body.toString();

            d += `${name},${url}\n`;

            params2 = {
                Bucket: BUCKET_NAME,
                Key: KEY,
                Body: d
            }

            await s3.putObject(params2).promise();
        }
    }
    catch (e) {
        console.log(e);
    }
}

async function getSubmissions(pokname) {
    let arr = [];
    try {
        const data = await s3.getObject(params).promise();

        if (data.Body) {
            
            let d = data.Body.toString();
            
            d.split('\n').forEach((line) => {
                let p = line.split(',');
                if (pokname === p[0]) arr.push(p[1]);
            });

            // console.log(arr);
        }
    }
    catch (e) {
        console.log(e);
    }

    return arr;
}


async function Submit(name, url) {
    await createDatabase();
    await addPokemon(name, url);
    return true;
}

module.exports = { Submit, getSubmissions };