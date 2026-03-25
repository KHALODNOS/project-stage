const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/middleware");
const {
  profile,
  addFavorite,
  deleteFavorite,
  LastViewChapter,
  updatViewChapter,
} = require("../controller/UserController");

router.get("/profile/:username", profile);

router.post("/favorite/:novelId", authenticate, addFavorite);

router.delete("/favorite/:novelId", authenticate, deleteFavorite);

//get last viewed chapter
router.get("/lastViewedChapter/:novelId", authenticate, LastViewChapter);

//update last viewed chapter
router.post("/lastViewedChapter/:novelId", authenticate, updatViewChapter);

module.exports = router;
