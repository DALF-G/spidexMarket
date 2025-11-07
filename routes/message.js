const express = require("express");
const router = express.Router();
const { Message } = require("../models/MarketDb");

const { sendMessage, getConversation } = require("../controllers/messageController");

// Send a message
router.post("/", sendMessage);

// Get all messages between two users
router.get("/:senderId/:receiverId", getConversation);


module.exports = router;