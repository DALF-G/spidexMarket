const { Message } = require("../models/MarketDb");

// send
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, product, content } = req.body;
    if (!sender || !receiver || !content) return res.status(400).json
    ({ message: "required fields" });

    const message = new Message({ sender, receiver, product, content });
    const saved = await message.save();
    res.status(201).json({ message: "Message sent", data: saved });
  } 
  catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    })
    .sort({ createdAt: 1 }).populate("sender", "name").
    populate("receiver", "name").populate("product", "title price");
    res.json(messages);
  }
   catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};

// mark seen
exports.markSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    const m = await Message.findByIdAndUpdate(messageId, { seen: true }, { new: true });
    res.json({ message: "Marked seen", data: m });
  } 
  catch (err) {
    res.status(400).json({ message: "Error", error: err.message });
  }
};
