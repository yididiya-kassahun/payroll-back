const express = require("express");
const auth = require("../API/authController");

const router = express.Router();

router.post("/signin", auth.signin);
router.post("/signup", auth.signup);

module.exports = router;
