const HttpError = require("../models/errorModel");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization; // Use lowercase `authorization`
  if (authorization && authorization.startsWith("Bearer")) {
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.secret_key, (err, info) => {
      if (err) {
        return next(new HttpError("Unauthorized Token", 403));
      }
      req.user = info;
      next();
    });
  } else {
    return next(new HttpError("Unauthorized, No Token", 403));
  }
};

module.exports = authMiddleware;
