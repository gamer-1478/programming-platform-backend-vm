const express = require('express');
const fs = require('fs');
const { spawn } = require('child_process');
const uuidv4 = require('uuid').v4;
const lang_router = express.Router();
const verifyServerIdentity = require('.././utils/serverAuthUtils').verifyServerIdentity;
lang_router.get('/', (req, res) => {
    res.send('Language router');
})
lang_router.post('/python', verifyServerIdentity, async (req, res) => {
    var code_to_execute = req.body.code;
    var input_exec = req.body.input_exec;
    var id = uuidv4();
    var outputDataSet = [];
    var errDataSet = [];
    var exitData = { code: 99, signal: 0 };
    var running = true;

    //check for folder existence, if it doesn't exist create it
    if (!fs.existsSync('./code_exec/python/')) {
        fs.mkdirSync('./code_exec/python/', { recursive: true });
    }

    //create a file with the id
    fs.writeFileSync(`./code_exec/python/${id}.py`, code_to_execute, { flag: 'w' });

    // spawn a child process to run the python script
    const python = spawn('python3', [`./code_exec/python/${id}.py`]);

    // collect data from script
    python.stdout.on('data', function (data) {
        outputDataSet.push(data.toString());
        //console.log(data.toString(), end = '');
    });

    // send input to spawned process
    python.stdin.write(input_exec.join('\n') + '\n');
    python.stdin.end();

    // store errors raised during execution
    python.stderr.on('data', function (data) {
        //console.log('stdout: ' + data);
        errDataSet.push(data.toString());
    });

    // store spawn error
    python.on('error', (err) => {
        errDataSet.push(err.toString());
        //console.log(err.toString(), end = '');
    });

    // store exit data
    python.on('exit', (code, signal) => {
        // console.log("exit", code, signal);
        exitData.code = code;
        exitData.signal = signal;
    });

    // send data to client
    python.on('close', (code) => {
        newOutputDataSet = [];
        for (i in outputDataSet) {
            newOutputDataSet = newOutputDataSet.concat(outputDataSet[i].split('\r\n'));
        }
        outputDataSet = []; // clear the array? What for, no idea. Lets just clear it.

        if (newOutputDataSet[newOutputDataSet.length - 1] == ''){
            newOutputDataSet.pop();
        }

        //console.log(`child process close all stdio with code ${code}`);
        res.send({
            data: newOutputDataSet,
            code: code,
            err: errDataSet,
            exit: exitData
        });
        running = false;
        fs.unlinkSync(`./code_exec/python/${id}.py`);
    });

    /* if the program has not executed within a given time frame lets say x seconds, its terminated.
       NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.*/
    setTimeout(() => {
        if (running) {
            console.log('kill');
            python.stdin.pause();
            python.kill();
        }
    }, 15000);
});

module.exports = lang_router;