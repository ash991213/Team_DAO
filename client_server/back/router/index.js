const express = require('express');
const auth = require('./Auth');
const oauth = require('./Oauth');
const route = express.Router();

route.use('/auth', auth);
route.use('/oauth', oauth);

module.exports = route;
