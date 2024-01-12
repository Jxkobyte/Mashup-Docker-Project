const express = require('express');
const logger = require('morgan');
const axios = require('axios');
const { getSubmissions } = require('../helper/database');

const router = express.Router();
router.use(logger('tiny'));

require('dotenv').config();
const pok_api_key = process.env.pok_api_key;
const dev_api_key = process.env.dev_api_key;
const dev_client_id = process.env.dev_client_id;


router.get('/', async (req, res) => {
    let s = "";
    try {
        const name = req.query.name;
        
        const response1 = await pokapi(name);
        const response2 = await devapi(name);
        const response3 = await getSubmissions(name);
        // console.log(response3);
        s = createPage('Pokemon Search', response1, response2, response3);  
        
        res.writeHead(200, {'content-type': 'text/html'});
        res.write(s);
        res.end();
    }
    catch {
        res.writeHead(400, {'content-type': 'text/html'});
        res.write("Bad request");
        res.end();
    }
});



async function pokapi(pokname) {
    const headers = {
        'X-Api-Key': pok_api_key
    };

    const url = 'https://api.pokemontcg.io/v2/cards?q=name:' + pokname;

    const rsp = await axios.get(url, {headers}).then((rsp) => {
        if (rsp.status == 200) {
            return rsp;
        }
    });
    return rsp;
}

const deviant_params = {
    grant_type: 'client_credentials',
    client_id: dev_client_id,
    client_secret: dev_api_key
};

async function devapi(pokname) {
    const token = await axios.post('https://www.deviantart.com/oauth2/token', null, { 
        params: deviant_params,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        
        }}).then((rsp) => {
        if (rsp.status == 200) {
            return rsp.data.access_token;
        }
    });

    const devurl = `https://www.deviantart.com/api/v1/oauth2/browse/tags?tag=${pokname}&limit=50&access_token=${token}`;

    const rsp = await axios.get(devurl).then((rsp) => {
        if (rsp.status == 200) {
            return rsp;
        }
    });
    return rsp;
}


function parsePhotoRsp(rsp1, rsp2, rsp3) {
    let s = "";

    arr1 = rsp1.data.data;
    arr2 = rsp2.data.results;
    arr3 = rsp3;
    const length = arr1.length + arr2.length;
    s = `<h1>${length} results </h1><br/>`;


    if (arr3.length > 0) {
        s += `<h2>Our Submissions</h2>`;
        for (let i = 0; i < arr3.length; i++) {
            s += `<img src="${arr3[i]}" class="devimg"/>`;
        }
        s += "<br><h1>Results</h1><br>";
    }

    

    // alternate images from each api
    for (let i=0; i < length; i++) {

        if (i < arr1.length) {
            photo = arr1[i];
            p_url = photo.images.small;
            s += `<a href="${p_url}">
                        <img class="pokimage" alt="${photo.name} ${photo.id}" src="${p_url}"/>
                  </a>`;
        }

        if (i < arr2.length) {
            photo = arr2[i];
            p_url = photo.preview.src;
            s += `<a href="${p_url}">
                      <img class="devimg" src="${p_url}"/>
                  </a>`;
        }
    }
    return s;
}


function createPage(title, rsp1, rsp2, rsp3) {
    css = `<style>
            .pokimage {
                width: 200px; 
                height: 280px;
                clip-path: polygon(10% 10%, 90% 10%, 90% 50%, 10% 50%);
                margin-bottom: -140px;
                
            }

            .devimg {
                width: 160px;
                height: 107px;
            }

            h1 {
                text-align: center;
            }

        </style>`;

    str = `<html>
                <head>
                    <title> ${title}</title>
                    ${css}
                </head>
                <body>
                    ${parsePhotoRsp(rsp1, rsp2, rsp3)}
                </body>
          </html>`;

    return str;
}

module.exports = router;