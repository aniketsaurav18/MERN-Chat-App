const express = require("express");
const { isAuth } = require("../middleware/isAuth");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/", isAuth, chatController.accessChat);

router.get("/", isAuth, chatController.getAllChats);

module.exports = router;
