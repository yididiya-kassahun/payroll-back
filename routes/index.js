// routes/index.js  (If you keep this file, it should only contain middleware
// that needs to be applied to all /api/v1 routes BEFORE they are routed
// to auth or employee routers.)

const express = require("express");
const router = express.Router();

// Example: Authentication middleware that applies to all /api/v1 routes
// router.use((req, res, next) => {
//   console.log("Middleware for all /api/v1 routes");
//   next();
// });

module.exports = router;
