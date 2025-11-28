const express = require("express");
const router = express.Router();
const msg = require("../controllers/messageController");
const { auth } = require("../middleware/auth");

router.post("/send", auth, msg.sendMessage);
router.get("/my", auth, msg.getMyChats);
router.put("/seen", auth, msg.markSeen);

// messages
router.get("/", auth, msg.getAllMessages);

module.exports = router;
