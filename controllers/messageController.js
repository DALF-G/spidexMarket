const Message = require("../models/Message");
const User = require("../models/User");

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
    });

    return res.status(201).json({ message: "Sent", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Send failed" });
  }
};

// GET ONLY MESSAGES OF LOGGED-IN USER
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed loading messages" });
  }
};

// GET CHAT LIST (Latest message per conversation)
exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Chat load failed" });
  }
};

// MARK MESSAGE AS SEEN
exports.markSeen = async (req, res) => {
  try {
    const { messageId } = req.body;

    await Message.findByIdAndUpdate(messageId, { seen: true });

    res.json({ message: "Seen" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update seen" });
  }
};
