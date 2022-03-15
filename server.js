//require dot env
require('dotenv').config();

//imports
const express = require('express');

//file imports
const bloat_router = require('./routers/bloat.js');
const language_router = require('./routers/language_router.js');

//constants
const app = express();
const port = process.env.PORT || 4500;

//app uses
app.use(bloat_router);
app.use('/language', language_router);

//404 on all pages not found
app.get('*', (req, res) => {
    res.status(404).send('<h1>404</h1>');
})

app.listen(port, () => {
    console.log(`Example app listening on port! ${port}`);
});
