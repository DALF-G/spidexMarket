const express = require("express");
const router = express.Router();
const msg = require("../controllers/messageController");
const { auth } = require("../middleware/auth");

router.post("/send", auth, msg.sendMessage);
router.get("/:senderId/:receiverId", auth, msg.getConversation);
router.put("/seen/:messageId", auth, msg.markSeen);

// messages
router.get("/", auth, msg.getAllMessages);

module.exports = router;
