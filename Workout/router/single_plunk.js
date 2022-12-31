const express = require('express');
const router = new express.Router();
require('dotenv').config()

const dirname = __dirname.replace(process.env.DIR_REPLACE, '');

router.get("/plunk", (req, res) => {
    res.sendFile(dirname + "/src/plunk.html");
});

router.get("/plunk/single", (req, res) => {
    res.sendFile(dirname + "/src/singleTime_comp.html");
});

module.exports = router;