const Video = require("../models/Video");
const path = require("path");
const fs = require("fs");
const notification = require("../models/notification");

exports.uploadVideo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    const video = new Video({
      user: userId,
      videoUrl: `/videos/${req.file.filename}`,
      description,
    });

    await video.save();

    // notify all roles about the new video
    const notif = await notification.create({
      message: `قام ${req.user.username} بنشر فيديو جديد`,
      toggleRole: ["admin", "user", "translator"],
      sender: userId
    });

    const io = require("../socket").getIO();
    io.to("admin").emit("newNotification", notif);
    io.to("user").emit("newNotification", notif);
    io.to("translator").emit("newNotification", notif);


    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("user", "username email image nickname")
      .populate("comments.user", "username email image nickname")
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const userId = req.user._id;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    if (
      video.user.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this video" });
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.likeVideo = async (req, res) => {
  try {
    const userId = req.user._id;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    if (!video.likes.includes(userId)) {
      video.likes.push(userId);
    } else {
      video.likes = video.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    }

    await video.save();

    const io = require("../socket").getIO();

    // Notify Admins (Only if the liker is not an admin)
    // if (req.user.role !== "admin") {
    //   const adminNotif = await notification.create({
    //     message: `قام ${req.user.username} بالإعجاب بفيديو`,
    //     toggleRole: ["admin"],
    //   });
    //   io.to("admin").emit("newNotification", adminNotif);
    // }

    // Notify the video owner if it's not the owner themselves liking
    if (video.user.toString() !== userId.toString()) {
      const ownerNotif = await notification.create({
        message: `قام ${req.user.username} بالإعجاب بفيديو خاص بك`,
        targetUser: video.user,
      });
      io.to(video.user.toString()).emit("newNotification", ownerNotif);
    }


    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.commentVideo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    video.comments.push({ user: userId, text });
    await video.save();

    const io = require("../socket").getIO();

    // Notify Admins (Only if the commenter is not an admin)
    if (req.user.role !== "admin") {
      const adminNotif = await notification.create({
        message: `قام ${req.user.username} بالتعليق على فيديو`,
        toggleRole: ["admin"],
      });
      io.to("admin").emit("newNotification", adminNotif);
    }

    // Notify the video owner if it's not the owner themselves commenting
    if (video.user.toString() !== userId.toString()) {
      const ownerNotif = await notification.create({
        message: `قام ${req.user.username} بالتعليق على فيديو خاص بك`,
        targetUser: video.user,
      });
      io.to(video.user.toString()).emit("newNotification", ownerNotif);
    }


    const populatedVideo = await Video.findById(req.params.id).populate(
      "comments.user",
      "username email image nickname",
    );

    res.json(populatedVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
