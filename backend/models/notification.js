const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },

  toggleRole: {
    type: [String],
    enum: ["admin", "user"],
  },

  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
