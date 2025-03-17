const express = require("express");
const auth = require("../API/authController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signin", auth.signin);
router.post("/signup", auth.signup);

router.post("/changepass",authenticateJWT, auth.changePassword);

module.exports = router;
