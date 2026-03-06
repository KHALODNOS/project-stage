const express = require('express');
const Novel = require('../models/novel'); // Adjust the path to your model
const router = express.Router();



// Get popular novels
router.get(['/popular', '/popular/:viewType'], async (req, res) => {
  const viewType = req.params.viewType || 'daily';
  try {
    const novels = await Novel.find().sort({ [`views.${viewType}`]: -1 }).limit(10);
    res.json(novels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recently updated novels
router.get('/updated', async (req, res) => {
  try {
    const novels = await Novel.find().sort({ updatedAt: -1 }).limit(9);
    res.json(novels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get completed novels
router.get('/completed', async (req, res) => {
  try {
    const novels = await Novel.find({ status: 'مكتملة' }).sort({ updatedAt: -1 }).limit(9);
    res.json(novels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get new novels
router.get('/new', async (req, res) => {
  try {
    const novels = await Novel.find().sort({ createdAt: -1 }).limit(15);
    res.json(novels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Route to fetch novels by views
router.get('/views/:viewType', async (req, res) => {
  const { viewType } = req.params;
  try {
    const novels = await Novel.find().sort({ [`views.${viewType}`]: -1 }).limit(5);
    res.json(novels);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching novels' });
  }
});
module.exports = router;