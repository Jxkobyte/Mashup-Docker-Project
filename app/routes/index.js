const express = require('express');
const logger = require('morgan');
const axios = require('axios');
const addView = require('../helper/counter');


const router = express.Router();
router.use(logger('tiny'));

router.get('/', async (req, res) => {

    const views = await addView();
    const s = createPage('Home Page', views);

    res.writeHead(200, {'content-type': 'text/html'});
    res.write(s);
    res.end();
});

function createPage(title, views) {
    const str = `<html>
                    <head>
                        <title> ${title}</title>
                    </head>
                    <body>
                        <h1>Pokemon Gallery</h1>    
                        Total Visits: ${views}
                        <h2>Search for a Pokemon</h2>
                        <form action="/pokemon" method="GET">
                            <input type="text" name="name">
                            <button type="submit">Search</button>
                        </form>
                        <h2>Submit a Pokemon</h2>

                        <form action="/submit" method="POST">
                        <label for="pokemonName">Pokemon Name:</label>
                        <input autocomplete="off" type="text" id="pokemonName" name="pokemonName" required><br><br>

                        <label for="imageURL">Image URL:</label>
                        <input autocomplete="off" type="text" id="imageURL" name="imageURL" required><br><br>

                        <input type="submit" value="Submit">
</form>

                    </body>
                </html>`;
    return str;
}

module.exports = router