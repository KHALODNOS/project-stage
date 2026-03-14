const chapter = require("../models/chapter");

exports.allNovelts = async (req, res) => {
  try {
    const { novelId } = req.params;
    const chapters = await chapter.find({ novelId }, "-content"); // Exclude content field
    res.send(chapters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chapters", error });
  }
};
