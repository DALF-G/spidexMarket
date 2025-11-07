const { Message } = require("../models/MarketDb");

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, product, content } = req.body;

    if (!sender || !receiver || !content) {
      return res.status(400).json({ message: "sender, receiver, and content are required" });
    }

    const message = new Message({ sender, receiver, product, content });
    const saved = await message.save();

    res.status(201).json({ message: "Message sent successfully", data: saved });
  } catch (err) {
    res.status(400).json({ message: "Error sending message", error: err.message });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ message: "Error fetching messages", error: err.message });
  }
};