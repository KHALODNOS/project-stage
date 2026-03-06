const express = require("express");
const Message = require("../models/Message");
const { authenticate } = require("../middleware/middleware");
const router = express.Router();

// Only authenticated users can fetch message history
router.get("/messages", authenticate, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

module.exports = router;
