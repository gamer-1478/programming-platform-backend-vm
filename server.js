//require dot env
require('dotenv').config();

//imports
const express = require('express');
const { spawn, execFile } = require('child_process');

//constants
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    var largeDataSet = [];
    // spawn new child process to call the python script
    const python = spawn('python', ['test.py']);
    python.stdout.setEncoding('utf8');
    // collect data from script
    python.stdout.on('data', function (data) {
        largeDataSet.push(data);
        console.log(data.toString(), end='');
    });
    // in close event we are sure that stream is from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(largeDataSet.join(""))
    });

});
app.get('/hmm', (req, res) => {
    res.send()
})
app.listen(port, () => {
    console.log(`Example app listening on port! ${port}`);
});