const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "25d" });
};

module.exports = generateToken;
