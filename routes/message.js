const express = require("express");
const router = express.Router();
const msg = require("../controllers/messageController");
const { auth } = require("../middleware/auth");

router.post("/send", auth, msg.sendMessage);

// only messages for logged-in user
router.get("/my", auth, msg.getUserMessages);

router.put("/seen", auth, msg.markSeen);

// all messages (admin only maybe)
router.get("/", auth, msg.getMyChats);

router.get("/conversation/:partnerId", auth, msg.getConversation);

router.get("/conversation/:userA/:userB", auth, msg.adminGetConversation);


module.exports = router;
