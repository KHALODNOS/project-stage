const express = require("express");
const Novel = require("../models/novel"); // Adjust the path to your model
const router = express.Router();
const {
  Popular,
  Updated,
  Completed,
  New,
  Views,
} = require("../controller/NovelCategoryController");

// Get popular novels
router.get(["/popular", "/popular/:viewType"], Popular);

// Get recently updated novels
router.get("/updated", Updated);

// Get completed novels
router.get("/completed", Completed);

// Get new novels
router.get("/new", New);

// Route to fetch novels by views
router.get("/views/:viewType", Views);
module.exports = router;
