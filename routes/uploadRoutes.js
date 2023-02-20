const express = require('express');
const router = express.Router();
const path = require("path");

router.get("/images/:path", (req, res) => {
    res.sendFile(path.join(__dirname, "../uploads/images/" + req.params.path));
})

module.exports = router;