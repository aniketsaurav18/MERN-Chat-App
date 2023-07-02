const express = require("express");
const { isAuth } = require("../middleware/isAuth");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.post("/", isAuth, messageController.sendMessage);
router.get("/:chatId", isAuth, messageController.getAllMessages);

module.exports = router;
