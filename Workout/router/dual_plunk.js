const express = require('express');
const router = new express.Router();
require('dotenv').config()

const dirname = __dirname.replace(process.env.DIR_REPLACE, '');

router.get("/plunk_dual", (req, res) => {
    res.sendFile(dirname + "/src/plunk_dual.html");
});

router.get("/plunk/dual", (req, res) => {
    res.sendFile(dirname + "/src/doubleTime_comp.html");
});

module.exports = router;