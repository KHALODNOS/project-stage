const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String },           // user _id
    senderNickname: { type: String },   // display name
    senderImage: { type: String },      // avatar filename
    senderRole: { type: String },       // 'admin' | 'user'
    text: { type: String },
    reactions: [
      {
        userId: String,
        emoji: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
