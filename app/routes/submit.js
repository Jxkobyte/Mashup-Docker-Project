const express = require('express');
const logger = require('morgan');
const axios = require('axios');
const { Submit } = require('../helper/database');

// submitPokemon("pikachu", "pikachu.jpg");

const router = express.Router();
router.use(logger('tiny'));

require('dotenv').config();
const pok_api_key = process.env.pok_api_key;
const dev_api_key = process.env.dev_api_key;
const dev_client_id = process.env.dev_client_id;


router.post('/', async (req, res) => {
    try {
       const name = req.body.pokemonName;
        const url = req.body.imageURL;

        // check if deviantart online and token is valid
        // check pokemon name exists
        nameCheck = await pokemonExists(name);
        devCheck = await deviantOnline();

        let success = false;

        if (nameCheck && devCheck) {
            success = await Submit(name, url);
        }
        const s = createPage(name, url, nameCheck, devCheck, success);  

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



function createPage(name, url, nameCheck, devCheck, success) {
    const css = `<style>
            .pokimage {
                width: 200px; 
                height: 280px;
            }
            </style>`;

    const str = `<html>
                    <head>
                        <title> Submit</title>
                        ${css}
                    </head>
                    <body>
                        <h1>${success ? "Submission successful" : "Submission failed"}</h1>    
                        <h2> Pokemon: ${nameCheck ? name : name + " not found"}</h2>
                        <img src="${url}" class="pokimage"><br><br>
                        <a>${devCheck ? "Deviantart: Online" : "Deviantart: Offline"}</a><br><br>
                        ${success ? '<a href="/pokemon?name=' + name + '">View Submission</a>' : ''}
                    </body>
                </html>`;
    return str;
}

const deviant_params = {
    grant_type: 'client_credentials',
    client_id: dev_client_id,
    client_secret: dev_api_key
};

async function deviantOnline() {
    const token = await axios.post('https://www.deviantart.com/oauth2/token', null, { 
        params: deviant_params,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        
        }}).then((rsp) => {
        if (rsp.status == 200) {
            return rsp.data.access_token;
        }
    });

    const devurl = `https://www.deviantart.com/api/v1/oauth2/placebo?access_token=${token}`;

    const rsp = await axios.get(devurl).then((rsp) => {
        if (rsp.status == 200) {
            return rsp;
        }
    });
    // console.log(rsp);
    return rsp.status == 200;
}


async function pokemonExists(pokname) {
    const headers = {
        'X-Api-Key': pok_api_key
    };

    const url = `https://api.pokemontcg.io/v2/cards?q=name:${pokname}&pageSize=1`;

    const rsp = await axios.get(url, {headers}).then((rsp) => {
        if (rsp.status == 200) {
            return rsp;
        }
    });
    // console.log(rsp);
    return rsp.data.count != 0;
}

module.exports = router