// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403); 
      }

      req.user = user; 
      next();
    });
  } else {
    return res.sendStatus(401); 
  }
};

module.exports = authenticateJWT;
