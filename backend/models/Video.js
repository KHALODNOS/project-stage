const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        videoUrl: { type: String, required: true },
        description: { type: String },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        comments: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                text: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true },
);
module.exports = mongoose.model("Video", videoSchema);
