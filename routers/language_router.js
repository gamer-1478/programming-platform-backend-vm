const express = require('express');
const lang_router = express.Router();

lang_router.post('/python', async (req, res) => {
    var code_to_execute = req.body.code;
    var id = uuidv4();
    var outputDataSet = [];
    var running = true;

    //check for folder existence, if it doesn't exist create it
    if (fs.existsSync('./code_exec/python/')) {
        console.log('The path exists.');
    } else {
        fs.mkdirSync('./code_exec/python/', { recursive: true });
    }

    //create a file with the id
    fs.writeFileSync(`./code_exec/python/${id}.py`, code_to_execute, { flag: 'w' });

    // 1. spawn a child process to run the python script
    const python = spawn('python', [`./code_exec/python/${id}.py`]);

    // 2. collect data from script
    python.stdout.on('data', function (data) {
        outputDataSet.push(data.toString());
        //console.log(data.toString(), end = '');
    });

    // 3. send data to client
    python.on('close', (code) => {
        //console.log(`child process close all stdio with code ${code}`);
        res.send({
            data: outputDataSet,
            code: code
        });
        running = false;
        // console.log({
        //     data: outputDataSet,
        //     code: code
        // })
        fs.unlinkSync(`./code_exec/python/${id}.py`);
    });

    // 4. if the program has not executed within a given time frame lets say x seconds, its terminated.
    //    NOTE: We Depend On Close Event Broadcast To Send Response To Client. 
    //          No Response Handling is needed here.
    setTimeout(() => {
        if (running) {
            console.log('kill');
            python.stdin.pause();
            python.kill();
        }
    }, 15000);
});

module.exports = lang_router;