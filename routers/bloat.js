const bloat_router = require('express').Router();
const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require("cors");

const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

bloat_router.use(cors(corsOptions)) // Use this after the variable declaration

//serve public folder
bloat_router.use(express.static('public'));

bloat_router.use(bodyParser.json({
    parameterLimit: 100000,
    limit: '50mb'
}));
bloat_router.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
}));

//export routers
module.exports = bloat_router;
