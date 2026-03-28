const express = require("express");
const { authorize, authenticate } = require("../middleware/middleware");
const {
  allChapters,
  getChapter,
  addChapter,
  editChapter,
  deleteChapter,
} = require("../controller/ChapteController");
const router = express.Router();

///novels/:novelId/chapters

// Get all chapters of a novel
router.get("/:novelId", allChapters);

// Get a specific chapter of a novel
router.get("/:novelId/:chapterId", getChapter);

// Add a new chapter to a novel (admin only)
router.post(
  "/:novelId",
  authenticate,
  authorize(["admin"]),
  addChapter,
);

// Update a chapter
router.put(
  "/:novelId/:chapterId",
  authenticate,
  authorize(["admin"]),
  editChapter,
);

// Delete  chapter (admin only)
router.delete(
  "/:novelId/:chapterId",
  authenticate,
  authorize(["admin"]),
  deleteChapter,
);

module.exports = router;
