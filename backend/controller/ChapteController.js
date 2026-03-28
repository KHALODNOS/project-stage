const Chapter = require("../models/chapter");
const Novel = require("../models/novel");
const User = require("../models/user"); // Adjust the path as needed
const ChapterChunk = require("../models/chapterChunk");
const { splitIntoChunks } = require("../utils/chunkText");
const { getEmbeddings } = require("../utils/embedding");
const Notification = require("../models/notification");

exports.allChapters = async (req, res) => {
  try {
    const { novelId } = req.params;
    const chapters = await Chapter.find({ novelId }, "-content"); // Exclude content field
    res.send(chapters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chapters", error });
  }
};

exports.getChapter = async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;

    // Fetch the current chapter
    const currentChapter = await Chapter.findOne({ _id: chapterId, novelId });

    if (!currentChapter) {
      return res.status(404).send("Chapter not found");
    }

    // Fetch the next and previous chapters
    const nextChapter = await Chapter.findOne({
      novelId,
      chapterNumber: { $gt: currentChapter.chapterNumber },
    })
      .sort({ chapterNumber: 1 })
      .select("_id");

    const prevChapter = await Chapter.findOne({
      novelId,
      chapterNumber: { $lt: currentChapter.chapterNumber },
    })
      .sort({ chapterNumber: -1 })
      .select("_id");

    // Add next and prev chapter IDs to the response
    const chapterWithNavigation = {
      ...currentChapter.toObject(),
      nextChapterId: nextChapter ? nextChapter._id : null,
      prevChapterId: prevChapter ? prevChapter._id : null,
    };

    res.json(chapterWithNavigation);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.addChapter = async (req, res) => {
  try {
    const targetNovel = await Novel.findById(req.params.novelId);
    if (!targetNovel)
      return res.status(404).send({ message: "Novel not found" });

    const chapter = new Chapter({
      ...req.body,
      novelId: req.params.novelId,

    });
    await chapter.save();
    console.log("Chapter is saved");

    const notif = await Notification.create({
      message: `قام ${req.user.role} بنشر فصل جديد من رواية ${targetNovel.title}`,
      toggleRole: ["user"],
    });

    const io = require("../socket").getIO();
    io.to("user").emit("newNotification", notif);


    // Split + embed
    const chunks = splitIntoChunks(chapter.content);
    console.log("The chunks", chunks);
    const embeddings = await getEmbeddings(chunks);
    // console.log('Embeddings generated', embeddings)
    const chunkDocs = chunks.map((chunkText, idx) => ({
      novelId: chapter.novelId,
      chapterId: chapter._id,
      chapterNumber: chapter.chapterNumber,
      chunkIndex: idx,
      content: chunkText,
      embedding: embeddings[idx],
    }));
    await ChapterChunk.insertMany(chunkDocs);
    console.log("Chunks with embeddings inserted");

    // Update novel
    targetNovel.chapter_info.numberOfChapters += 1;
    targetNovel.chapter_info.lastThreeChapters.unshift({
      chapterNumber: chapter.chapterNumber,
      chapterId: chapter._id.toString(),
      createdAt: Date.now(),
    });
    if (targetNovel.chapter_info.lastThreeChapters.length > 3) {
      targetNovel.chapter_info.lastThreeChapters.pop();
    }



    await targetNovel.save();
    console.log("Novel updated");

    // Update user
    const user = req.user;
    await User.findByIdAndUpdate(user._id, {
      $push: { ChaptersCreated: chapter._id },
      $addToSet: { NovelsCreated: targetNovel._id },
    });
    console.log("Chapter and Novel added to user's tracking");

    res.status(201).send(chapter);
  } catch (error) {
    console.log("Error:", error);
    res.status(400).send(error);
  }
};

exports.editChapter = async (req, res) => {
  try {
    const { chapterNumber } = req.body;
    const { chapterId, novelId } = req.params;

    //this for update chapterNumber in novel if exists in update request
    if (chapterNumber) {
      const novel = await Novel.findById(novelId);

      if (!novel) {
        return res.status(404).send({ error: "Novel not found" });
      }

      novel.chapter_info.lastThreeChapters.forEach((c) => {
        if (c.chapterId === chapterId) {
          c.chapterNumber = chapterNumber;
          c.createdAt = Date.now();
        }
      });

      novel.updatedAt = Date.now();
      await novel.save();
    }
    const updateData = req.body;
    updateData.updatedAt = Date.now();
    const chapter = await Chapter.findOneAndUpdate(
      { _id: req.params.chapterId, novelId: req.params.novelId },
      updateData,
      { new: true, runValidators: true },
    );
    if (!chapter) return res.status(404).send({ message: "Chapter not found" });
    res.send(chapter);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const { chapterId, novelId } = req.params;
    const chapter = await Chapter.findByIdAndDelete(chapterId);
    if (!chapter) {
      return res.status(404).send({ message: "Chapter not found" });
    }

    // Update novel's chapter_info
    const novel = await Novel.findById(novelId);
    novel.chapter_info.numberOfChapters--;

    // Remove the deleted chapter from lastThreeChapters
    novel.chapter_info.lastThreeChapters =
      novel.chapter_info.lastThreeChapters.filter(
        (c) => c.chapterId !== chapterId,
      );

    // Re-populate lastThreeChapters if there are fewer than 3 chapters left
    const remainingChapters = await Chapter.find({ novelId })
      .sort({ chapterNumber: -1 })
      .limit(3);
    remainingChapters.forEach((chap) => {
      if (
        !novel.chapter_info.lastThreeChapters.some(
          (c) => c.chapterId === chap._id.toString(),
        )
      ) {
        novel.chapter_info.lastThreeChapters.push({
          chapterNumber: chap.chapterNumber,
          chapterId: chap._id.toString(),
        });
      }
    });

    // Ensure only the last three chapters are stored
    if (novel.chapter_info.lastThreeChapters.length > 3) {
      novel.chapter_info.lastThreeChapters =
        novel.chapter_info.lastThreeChapters.slice(0, 3);
    }

    novel.updatedAt = Date.now();
    await novel.save();
    // Remove the chapter from the user's ChaptersCreated list
    const user = await User.findOne({ ChaptersCreated: chapterId });
    if (user) {
      user.ChaptersCreated = user.ChaptersCreated.filter(
        (id) => id.toString() !== chapterId,
      );
      await User.findByIdAndUpdate(user._id, {
        $pull: { ChaptersCreated: chapterId },
      });
    }

    res.send({ message: "Chapter deleted" });
  } catch (error) {
    res.status(400).send(error);
  }
};
