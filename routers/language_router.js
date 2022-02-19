const express = require('express');
const fs = require('fs');
const { spawn } = require('child_process');
const { serialiseOutput } = require('../utils/reuse');
const uuidv4 = require('uuid').v4;
const lang_router = express.Router();
const verifyServerIdentity = require('.././utils/serverAuthUtils').verifyServerIdentity;

lang_router.get('/', (req, res) => {
    res.send('Language router');
})

lang_router.post('/python3', verifyServerIdentity, async (req, res) => {
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
        newOutputDataSet = serialiseOutput(outputDataSet);

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
            python.stdin.pause();
            python.kill();
            console.log('Python3 Killed');
        }
    }, 15000);
});

lang_router.post('/python2', verifyServerIdentity, async (req, res) => {
    var code_to_execute = req.body.code;
    var input_exec = req.body.input_exec;
    var id = uuidv4();
    var outputDataSet = [];
    var errDataSet = [];
    var exitData = { code: 99, signal: 0 };
    var running = true;

    //check for folder existence, if it doesn't exist create it
    if (!fs.existsSync('./code_exec/python2/')) {
        fs.mkdirSync('./code_exec/python2/', { recursive: true });
    }

    //create a file with the id
    fs.writeFileSync(`./code_exec/python2/${id}.py`, code_to_execute, { flag: 'w' });

    // spawn a child process to run the python script
    const python = spawn('python2', [`./code_exec/python2/${id}.py`]);

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
        newOutputDataSet = serialiseOutput(outputDataSet);

        //console.log(`child process close all stdio with code ${code}`);
        res.send({
            data: newOutputDataSet,
            code: code,
            err: errDataSet,
            exit: exitData
        });
        running = false;
        fs.unlinkSync(`./code_exec/python2/${id}.py`);
    });

    /* if the program has not executed within a given time frame lets say x seconds, its terminated.
       NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.*/
    setTimeout(() => {
        if (running) {
            console.log('Python2 Killed');
            python.stdin.pause();
            python.kill();
        }
    }, 15000);
});

lang_router.post('/gcc', verifyServerIdentity, async (req, res) => {
    var outputDataSet = [];
    var code_to_execute = req.body.code;
    var input_exec = req.body.input_exec;
    var id = uuidv4();
    var errDataSet = [];
    var sysExitData = { code: 99, signal: 0 };
    var exitData = { code: 99, signal: 0 };
    var sysRunning = true;
    var running = true;

    //check for folder existence, if it doesn't exist create it
    if (!fs.existsSync('./code_exec/gcc/')) {
        fs.mkdirSync('./code_exec/gcc/', { recursive: true });
    }

    //create a file with the id
    fs.writeFileSync(`./code_exec/gcc/${id}.c`, code_to_execute, { flag: 'w' });

    // spawn a child process to build compile the c file
    const gcc = spawn('gcc', [`./code_exec/gcc/${id}.c`, '-o', `./code_exec/gcc/${id}.exe`]);

    // store errors raised during execution
    gcc.stderr.on('data', function (data) {
        //console.log('stdout: ' + data);
        errDataSet.push(data.toString());
    });

    // store spawn error
    gcc.on('error', (err) => {
        errDataSet.push(err.toString());
        //console.log(err.toString(), end = '');
    });

    // store exit data
    gcc.on('exit', (code, signal) => {
        // console.log("exit", code, signal);
        sysExitData.code = code;
        sysExitData.signal = signal;
    });

    // send data to client
    gcc.on('close', (code) => {
        if (code === 0 || errDataSet.length === 0) {

            sysRunning = false;

            //spawn a child process to run the compiled file
            const exe = spawn(`./code_exec/gcc/${id}.exe`);

            // collect data from script
            exe.stdout.on('data', function (data) {
                outputDataSet.push(data.toString());
            });

            if (input_exec.length > 0) {
                try {
                    // send input to spawned process
                    exe.stdin.write(input_exec.join('\n') + '\n');
                    exe.stdin.end();
                }
                catch (e) {
                    errDataSet.push(e.toString());
                    exe.stdin.pause();
                    exe.kill();
                    running = false;
                }
            }

            // store errors raised during execution
            exe.stderr.on('data', function (data) {
                errDataSet.push(data.toString());
            });

            // store spawn error
            exe.on('error', (err) => {
                errDataSet.push(err.toString());
            });

            // store exit data
            exe.on('exit', (code, signal) => {
                exitData.code = code;
                exitData.signal = signal;
            });

            // send data to client
            exe.on('close', (code) => {
                newOutputDataSet = serialiseOutput(outputDataSet);
                res.send({
                    data: newOutputDataSet,
                    code: code,
                    err: errDataSet,
                    exit: exitData
                });
                running = false;
                fs.unlinkSync(`./code_exec/gcc/${id}.c`);
                fs.unlinkSync(`./code_exec/gcc/${id}.exe`);
            });

            exe.stdout.on('error', function (err) {
                if (err.code == "EPIPE") {
                    exe.exit(0);
                    errDataSet.push(err);
                }
            });

            // if the program has not executed within a given time frame lets say x seconds, its terminated.
            // NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.
            setTimeout(() => {
                if (running) {
                    console.log('GCC Killed');
                    exe.stdin.pause();
                    exe.kill();
                }
            }, 15000);

        } else {
            if (code) {
                sysRunning = false;
            }

            if (fs.existsSync(`./code_exec/gcc/${id}.c`)) {
                fs.unlinkSync(`./code_exec/gcc/${id}.c`);
            }
            if (fs.existsSync(`./code_exec/gcc/${id}.exe`)) {
                fs.unlinkSync(`./code_exec/gcc/${id}.exe`);
            }

            res.send({
                exit: sysExitData,
                err: errDataSet
            });
        }

    });

    /* if the program has not executed within a given time frame lets say x seconds, its terminated.
       NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.*/
    setTimeout(() => {
        if (sysRunning) {
            console.log("build timeout, if this is reached 💀🤨");
            gcc.stdin.pause();
            gcc.kill();
        }
    }, 15000);
});

lang_router.post('/gpp', verifyServerIdentity, async (req, res) => {
    var outputDataSet = [];
    var code_to_execute = req.body.code;
    var input_exec = req.body.input_exec;
    var id = uuidv4();
    var errDataSet = [];
    var sysExitData = { code: 99, signal: 0 };
    var exitData = { code: 99, signal: 0 };
    var sysRunning = true;
    var running = true;

    //check for folder existence, if it doesn't exist create it
    if (!fs.existsSync('./code_exec/gpp/')) {
        fs.mkdirSync('./code_exec/gpp/', { recursive: true });
    }

    //create a file with the id
    fs.writeFileSync(`./code_exec/gpp/${id}.c`, code_to_execute, { flag: 'w' });

    // spawn a child process to build compile the c file
    const gpp = spawn('g++', [`./code_exec/gpp/${id}.c`, '-o', `./code_exec/gpp/${id}.exe`]);

    // store errors raised during execution
    gpp.stderr.on('data', function (data) {
        //console.log('stdout: ' + data);
        errDataSet.push(data.toString());
    });

    // store spawn error
    gpp.on('error', (err) => {
        errDataSet.push(err.toString());
        //console.log(err.toString(), end = '');
    });

    // store exit data
    gpp.on('exit', (code, signal) => {
        // console.log("exit", code, signal);
        sysExitData.code = code;
        sysExitData.signal = signal;
    });

    // send data to client
    gpp.on('close', (code) => {
        if (code === 0 || errDataSet.length === 0) {

            sysRunning = false;

            //spawn a child process to run the compiled file
            const exe = spawn(`./code_exec/gpp/${id}.exe`);

            // collect data from script
            exe.stdout.on('data', function (data) {
                outputDataSet.push(data.toString());
            });

            // send input to spawned process
            exe.stdin.write(input_exec.join('\n') + '\n');
            exe.stdin.end();

            // store errors raised during execution
            exe.stderr.on('data', function (data) {
                errDataSet.push(data.toString());
            });

            // store spawn error
            exe.on('error', (err) => {
                errDataSet.push(err.toString());
            });

            // store exit data
            exe.on('exit', (code, signal) => {
                exitData.code = code;
                exitData.signal = signal;
            });

            // send data to client
            exe.on('close', (code) => {
                newOutputDataSet = serialiseOutput(outputDataSet);
                res.send({
                    data: newOutputDataSet,
                    code: code,
                    err: errDataSet,
                    exit: exitData
                });
                running = false;
                fs.unlinkSync(`./code_exec/gpp/${id}.c`);
                fs.unlinkSync(`./code_exec/gpp/${id}.exe`);
            });
            // if the program has not executed within a given time frame lets say x seconds, its terminated.
            // NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.
            setTimeout(() => {
                if (running) {
                    console.log('GPP Killed');
                    exe.stdin.pause();
                    exe.kill();
                }
            }, 15000);

        } else {
            if (code) {
                sysRunning = false;
            }

            if (fs.existsSync(`./code_exec/gpp/${id}.c`)) {
                fs.unlinkSync(`./code_exec/gpp/${id}.c`);
            }
            if (fs.existsSync(`./code_exec/gpp/${id}.exe`)) {
                fs.unlinkSync(`./code_exec/gpp/${id}.exe`);
            }

            res.send({
                exit: sysExitData,
                err: errDataSet
            });
        }

    });

    /* if the program has not executed within a given time frame lets say x seconds, its terminated.
       NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.*/
    setTimeout(() => {
        if (sysRunning) {
            console.log("build timeout, if this is reached 💀🤨");
            gpp.stdin.pause();
            gpp.kill();
        }
    }, 15000);
});

lang_router.post('/mcs', verifyServerIdentity, async (req, res) => {
    var outputDataSet = [];
    var code_to_execute = req.body.code;
    var input_exec = req.body.input_exec;
    var id = uuidv4();
    var errDataSet = [];
    var sysExitData = { code: 99, signal: 0 };
    var exitData = { code: 99, signal: 0 };
    var sysRunning = true;
    var running = true;

    //check for folder existence, if it doesn't exist create it
    if (!fs.existsSync('./code_exec/mcs/')) {
        fs.mkdirSync('./code_exec/mcs/', { recursive: true });
    }

    //create a file with the id
    fs.writeFileSync(`./code_exec/mcs/${id}.cs`, code_to_execute, { flag: 'w' });

    // spawn a child process to build compile the c file
    const mcs = spawn('mcs', [`./code_exec/mcs/${id}.cs`, '-o', `./code_exec/mcs/${id}.exe`]);

    // store errors raised during execution
    mcs.stderr.on('data', function (data) {
        //console.log('stdout: ' + data);
        errDataSet.push(data.toString());
    });

    // store spawn error
    mcs.on('error', (err) => {
        errDataSet.push(err.toString());
        //console.log(err.toString(), end = '');
    });

    // store exit data
    mcs.on('exit', (code, signal) => {
        // console.log("exit", code, signal);
        sysExitData.code = code;
        sysExitData.signal = signal;
    });

    // send data to client
    mcs.on('close', (code) => {
        if (code === 0 || errDataSet.length === 0) {

            sysRunning = false;

            //spawn a child process to run the compiled file
            const exe = spawn(`./code_exec/mcs/${id}.exe`);

            // collect data from script
            exe.stdout.on('data', function (data) {
                outputDataSet.push(data.toString());
            });

            // send input to spawned process
            exe.stdin.write(input_exec.join('\n') + '\n');
            exe.stdin.end();

            // store errors raised during execution
            exe.stderr.on('data', function (data) {
                errDataSet.push(data.toString());
            });

            // store spawn error
            exe.on('error', (err) => {
                errDataSet.push(err.toString());
            });

            // store exit data
            exe.on('exit', (code, signal) => {
                exitData.code = code;
                exitData.signal = signal;
            });

            // send data to client
            exe.on('close', (code) => {
                newOutputDataSet = serialiseOutput(outputDataSet);
                res.send({
                    data: newOutputDataSet,
                    code: code,
                    err: errDataSet,
                    exit: exitData
                });
                running = false;
                fs.unlinkSync(`./code_exec/mcs/${id}.cs`);
                fs.unlinkSync(`./code_exec/mcs/${id}.exe`);
            });
            // if the program has not executed within a given time frame lets say x seconds, its terminated.
            // NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.
            setTimeout(() => {
                if (running) {
                    console.log('MCS Killed');
                    exe.stdin.pause();
                    exe.kill();
                }
            }, 15000);

        } else {
            if (code) {
                sysRunning = false;
            }

            if (fs.existsSync(`./code_exec/mcs/${id}.cs`)) {
                fs.unlinkSync(`./code_exec/mcs/${id}.cs`);
            }
            if (fs.existsSync(`./code_exec/mcs/${id}.exe`)) {
                fs.unlinkSync(`./code_exec/mcs/${id}.exe`);
            }

            res.send({
                exit: sysExitData,
                err: errDataSet
            });
        }

    });

    /* if the program has not executed within a given time frame lets say x seconds, its terminated.
       NOTE: We Depend On Close Event Broadcast To Send Response To Client. No Response Handling is needed here.*/
    setTimeout(() => {
        if (sysRunning) {
            console.log("build timeout, if this is reached 💀🤨");
            mcs.stdin.pause();
            mcs.kill();
        }
    }, 15000);
});

module.exports = lang_router;