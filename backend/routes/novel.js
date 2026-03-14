const express = require("express");
const { authorize, authenticate } = require("../middleware/middleware");
const multer = require("multer");
const {
  allNovels,
  searchNovel,
  getNovel,
  addNovel,
  editNovel,
  deleteNovel,
  staticNovels,
} = require("../controller/NovelController");
const router = express.Router();

// const {
//   deleteImageFromFirebase,
//   uploadImageToFirebase,
// } = require('../config/firebase')
// Make sure to install moment.js: npm install moment

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB limit for novel cover
});

// Get all novels
router.get("/", authenticate, allNovels);

//Get novels by search
router.get("/search", searchNovel);

// Get a specific novel by ID
router.get("/:id", getNovel);

// Add a new novel (admin only)
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  upload.single("image"),
  addNovel,
);

// Update a novel
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  upload.single("image"),
  editNovel,
);

// Delete a novel
router.delete("/:id", authenticate, authorize(["admin"]), deleteNovel);
router.post("/:id/views", staticNovels);

module.exports = router;
