const express = require('express');
const router = new express.Router();
require('dotenv').config()

const dirname = __dirname.replace(process.env.DIR_REPLACE, '');

router.get("/push-up", (req, res) => {
    res.sendFile(dirname + "/src/push-up.html");
});

router.get("/push-up/single", (req, res) => {
    res.sendFile(dirname + "/src/singleTime_count.html");
});

module.exports = router;