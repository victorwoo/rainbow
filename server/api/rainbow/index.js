'use strict';

var express = require('express');
var controller = require('./rainbow.controller');

var router = express.Router();


router.post('/uploads', controller.uploadFile);

module.exports = router;
