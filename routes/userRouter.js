const express = require("express");
const userController = require("../controllers/usercontroller");
const { isAuth } = require("../middleware/isAuth");

const router = express.Router();

router.post("/", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/search", isAuth, userController.searchUser);

module.exports = router;
