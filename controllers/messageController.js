// controllers/messageController.js
// Robust, backward-compatible message controller

const { Message, User, Product } = require("../models/MarketDb");

/**
 * Helper to safely obtain an id from many possible fields
 */
const pickId = (obj, ...keys) => {
  for (const k of keys) {
    if (!obj) continue;
    const v = obj[k];
    if (v) return v;
  }
  return null;
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    // Accept multiple field names so old clients still work:
    // receiver || receiverId
    // sender || senderId (but prefer authenticated user)
    // content (required)
    // product (optional)
    const body = req.body || {};

    const content = body.content || body.message || "";

    // Prefer authenticated sender if available
    const authSender =
      (req.user && (req.user.userId || req.user._id || req.user.id)) || null;

    const senderFromBody = pickId(body, "sender", "senderId");
    const senderId = authSender || senderFromBody;

    const receiverId = pickId(body, "receiver", "receiverId");
    const productId = pickId(body, "product", "productId");

    if (!receiverId || !content) {
      return res.status(400).json({
        message: "Missing fields: 'receiver' (or 'receiverId') and 'content' are required",
      });
    }

    // ensure sender exists (if provided)
    if (!senderId) {
      return res.status(401).json({ message: "Sender not identified (authenticate or provide senderId)" });
    }

    // Optional: check that sender and receiver exist in DB (recommended)
    const [senderExists, receiverExists] = await Promise.all([
      User.findById(senderId).select("_id").lean(),
      User.findById(receiverId).select("_id").lean(),
    ]);

    if (!senderExists) return res.status(404).json({ message: "Sender not found" });
    if (!receiverExists) return res.status(404).json({ message: "Receiver not found" });

    const payload = {
      sender: senderId,
      receiver: receiverId,
      content,
    };

    if (productId) {
      // Optionally validate product id exists (not required)
      payload.product = productId;
    }

    const message = await Message.create(payload);

    // populate for response (sender, receiver, product)
    const populated = await Message.findById(message._id)
      .populate("sender", "name email phone profileImage")
      .populate("receiver", "name email phone profileImage")
      .populate("product", "title photos price")
      .lean();

    return res.status(201).json({ message: "Sent", data: populated });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Send failed", error: err.message });
  }
};

// FETCH ONLY LOGGED-IN USER MESSAGES
exports.getUserMessages = async (req, res) => {
  try {
    const userId =
      (req.user && (req.user.userId || req.user._id || req.user.id)) ||
      (req.body && (req.body.userId || req.body.user));

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email phone profileImage")
      .populate("receiver", "name email phone profileImage")
      .populate("product", "title photos price")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ messages });
  } catch (err) {
    console.error("getUserMessages error:", err);
    res.status(500).json({ message: "Failed loading messages", error: err.message });
  }
};

// GET CHAT LIST (Latest messages grouped by conversation partner + product)
exports.getMyChats = async (req, res) => {
  try {
    const userId =
      (req.user && (req.user.userId || req.user._id || req.user.id)) ||
      (req.body && (req.body.userId || req.body.user));

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // Simple approach: get latest messages involving user, then group by conversation (partner+product)
    const msgs = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email profileImage")
      .populate("receiver", "name email profileImage")
      .populate("product", "title photos price")
      .sort({ createdAt: -1 })
      .lean();

    // reduce into latest-per-conversation map: key = partnerId + (productId||'')
    const map = new Map();
    for (const m of msgs) {
      const partnerId = String(m.sender._id) === String(userId) ? String(m.receiver._id) : String(m.sender._id);
      const prod = m.product ? String(m.product._id) : "";
      const key = `${partnerId}::${prod}`;
      if (!map.has(key)) map.set(key, m);
    }

    // convert map to array
    const chats = Array.from(map.values());

    res.json({ chats });
  } catch (err) {
    console.error("getMyChats error:", err);
    res.status(500).json({ message: "Chat load failed", error: err.message });
  }
};

// MARK AS SEEN
exports.markSeen = async (req, res) => {
  try {
    const { messageId } = req.body;
    if (!messageId) return res.status(400).json({ message: "messageId required" });

    await Message.findByIdAndUpdate(messageId, { seen: true });
    res.json({ message: "Seen" });
  } catch (err) {
    console.error("markSeen error:", err);
    res.status(500).json({ message: "Failed to update seen", error: err.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId =
      (req.user && (req.user.userId || req.user._id || req.user.id)) ||
      null;

    const partnerId = req.params.partnerId;

    if (!userId || !partnerId)
      return res.status(400).json({ message: "Missing user or partner ID" });

    // Get all messages between logged-in user & partner
    const msgs = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    })
      .populate("sender", "name email profileImage")
      .populate("receiver", "name email profileImage")
      .populate("product", "title photos price")
      .sort({ createdAt: 1 }) // sort oldest → newest
      .lean();

    res.json({ messages: msgs });
  } catch (err) {
    console.error("getConversation error:", err);
    res.status(500).json({ message: "Failed to load conversation" });
  }
};

