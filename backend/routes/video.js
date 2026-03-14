const {
    uploadVideo,
    getVideos,
    deleteVideo,
    likeVideo,
    commentVideo,
} = require("../controller/videoController.js");

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authenticate } = require("../middleware/middleware");
const fs = require("fs");
const path = require("path");

// Ensure videos directory exists
const videosPath = path.join(__dirname, "../videos");
if (!fs.existsSync(videosPath)) {
    fs.mkdirSync(videosPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "videos/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, '-')),
});

const upload = multer({ storage });

router.get("/", getVideos);
router.post("/", authenticate, upload.single("video"), uploadVideo);
router.delete("/:id", authenticate, deleteVideo);
router.post("/:id/like", authenticate, likeVideo);
router.post("/:id/comment", authenticate, commentVideo);

module.exports = router;
