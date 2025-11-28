const { Message } = require("../models/MarketDb");

// send
exports.sendMessage = async (req, res) => {
  try {
    const { sellerId, productId, message } = req.body;

    if (!message || !sellerId)
      return res.status(400).json({ error: "Missing fields" });

    const newMsg = await Message.create({
      sender: req.user.id,
      receiver: sellerId,
      product: productId,
      message,
    });

    res.json({ success: true, msg: newMsg });
  }
   catch (error) {
    console.error("sendMessage error", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};


exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;  // from auth middleware

    const chats = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .populate("sender", "name email phone")
      .populate("receiver", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ chats });
  } catch (error) {
    console.error("getMyChats error", error);
    res.status(500).json({ error: "Failed to fetch chats" });
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

// Get all the messages
exports.getAllMessages = async (req, res) => {
  try {
    const msgs = await Message.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json({ message: "Messages fetched", msgs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};
