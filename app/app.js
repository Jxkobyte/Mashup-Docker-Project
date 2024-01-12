const express = require('express');
const logger = require('morgan');
const search = require('./routes/search');
const index = require('./routes/index');
const submit = require('./routes/submit');
const parser = require('body-parser');



const app = express();
app.use(logger('tiny'));
app.use(parser.urlencoded({ extended: true }));


const hostname = '127.0.0.1';
const port = 3000;

app.use('/', index);
app.use('/pokemon?', search);
app.use('/submit', submit)



app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});
