const expressAsyncHandler = require("express-async-handler");
const Message = require("../model/messageModel");
const Chat = require("../model/chatModel");

exports.sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId)
    return res.status(400).json({ message: "Invalid data" });

  try {
    const message = new Message({
      sender: req.user._id,
      content: content,
      chatId: chatId,
    });
    var createdMessage = await message.save();
    createdMessage = await createdMessage.populate("sender", "name pic");
    createdMessage = await createdMessage.populate("chatId");
    createdMessage = await Message.populate(createdMessage, {
      path: "chatId.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: createdMessage,
    });

    res.status(201).json(createdMessage);
  } catch (err) {
    console.log(err);
    res.status(500);
    throw new Error(err.message);
  }
});

exports.getAllMessages = expressAsyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  try {
    const messages = await Message.find({ chatId: chatId })
      .populate("sender", "name pic email")
      .populate("chatId");
    res.status(201).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500);
    throw new Error(err.message);
  }
});
