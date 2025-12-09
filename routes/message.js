const express = require("express");
const router = express.Router();
const msg = require("../controllers/messageController");
const { auth } = require("../middleware/auth");

// Send a message
router.post("/send", auth, msg.sendMessage);

// Fetch messages involving ONLY the logged-in user
router.get("/", auth, msg.getUserMessages);

// Fetch chat list
router.get("/my", auth, msg.getMyChats);

// Mark as seen
router.put("/seen", auth, msg.markSeen);

module.exports = router;
