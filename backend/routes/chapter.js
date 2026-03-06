const express = require('express')
const Chapter = require('../models/chapter')
const Novel = require('../models/novel')
const { authorize, authenticate } = require('../middleware/middleware')
const User = require('../models/user') // Adjust the path as needed
const ChapterChunk = require('../models/chapterChunk')
const { splitIntoChunks } = require('../utils/chunkText')
const { getEmbeddings } = require('../utils/embedding')

const router = express.Router()

//         /novels/:novelId/chapters

// Get all chapters of a novel
router.get('/:novelId', async (req, res) => {
  try {
    const { novelId } = req.params
    const chapters = await Chapter.find({ novelId }, '-content') // Exclude content field
    res.send(chapters)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapters', error })
  }
})

// Get a specific chapter of a novel
router.get('/:novelId/:chapterId', async (req, res) => {
  try {
    const { novelId, chapterId } = req.params

    // Fetch the current chapter
    const currentChapter = await Chapter.findOne({ _id: chapterId, novelId })

    if (!currentChapter) {
      return res.status(404).send('Chapter not found')
    }

    // Fetch the next and previous chapters
    const nextChapter = await Chapter.findOne({
      novelId,
      chapterNumber: { $gt: currentChapter.chapterNumber },
    })
      .sort({ chapterNumber: 1 })
      .select('_id')

    const prevChapter = await Chapter.findOne({
      novelId,
      chapterNumber: { $lt: currentChapter.chapterNumber },
    })
      .sort({ chapterNumber: -1 })
      .select('_id')

    // Add next and prev chapter IDs to the response
    const chapterWithNavigation = {
      ...currentChapter.toObject(),
      nextChapterId: nextChapter ? nextChapter._id : null,
      prevChapterId: prevChapter ? prevChapter._id : null,
    }

    res.json(chapterWithNavigation)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// Add a new chapter to a novel (admin or translator only)
router.post(
  '/:novelId',
  authenticate,
  authorize(['admin', 'translator']),
  async (req, res) => {
    try {
      const novel = await Novel.findById(req.params.novelId)
      if (!novel) return res.status(404).send({ message: 'Novel not found' })

      const chapter = new Chapter({
        ...req.body,
        novelId: req.params.novelId,
        translators: [req.user.username],
      })
      await chapter.save()
      console.log('Chapter is saved')

      // Split + embed
      const chunks = splitIntoChunks(chapter.content)
      console.log('The chunks', chunks)
      const embeddings = await getEmbeddings(chunks)
      // console.log('Embeddings generated', embeddings)
      const chunkDocs = chunks.map((chunkText, idx) => ({
        novelId: chapter.novelId,
        chapterId: chapter._id,
        chapterNumber: chapter.chapterNumber,
        chunkIndex: idx,
        content: chunkText,
        embedding: embeddings[idx],
      }))
      await ChapterChunk.insertMany(chunkDocs)
      console.log('Chunks with embeddings inserted')

      // Update novel
      novel.chapter_info.numberOfChapters += 1
      novel.chapter_info.lastThreeChapters.unshift({
        chapterNumber: chapter.chapterNumber,
        chapterId: chapter._id.toString(),
        createdAt: Date.now(),
      })
      if (novel.chapter_info.lastThreeChapters.length > 3) {
        novel.chapter_info.lastThreeChapters.pop()
      }
      await novel.save()
      console.log('Novel updated')

      // Update user
      const user = req.user
      await User.findByIdAndUpdate(user._id, {
        $push: { ChaptersCreated: chapter._id },
      })
      console.log("Chapter added to user's ChaptersCreated")

      res.status(201).send(chapter)
    } catch (error) {
      console.log('Error:', error)
      res.status(400).send(error)
    }
  }
)

// Update a chapter
router.put(
  '/:novelId/:chapterId',
  authenticate,
  authorize(['admin', 'translator']),
  async (req, res) => {
    try {
      const { chapterNumber } = req.body
      const { chapterId, novelId } = req.params

      //this for update chapterNumber in novel if exists in update request
      if (chapterNumber) {
        const novel = await Novel.findById(novelId)

        if (!novel) {
          return res.status(404).send({ error: 'Novel not found' })
        }

        novel.chapter_info.lastThreeChapters.forEach((c) => {
          if (c.chapterId === chapterId) {
            c.chapterNumber = chapterNumber
            c.createdAt = Date.now()
          }
        })

        novel.updatedAt = Date.now()
        await novel.save()
      }
      const updateData = req.body
      updateData.updatedAt = Date.now()
      const chapter = await Chapter.findOneAndUpdate(
        { _id: req.params.chapterId, novelId: req.params.novelId },
        updateData,
        { new: true, runValidators: true }
      )
      if (!chapter)
        return res.status(404).send({ message: 'Chapter not found' })
      res.send(chapter)
    } catch (error) {
      res.status(400).send(error)
    }
  }
)

// Delete  chapter (admin or translator only)
router.delete(
  '/:novelId/:chapterId',
  authenticate,
  authorize(['admin', 'translator']),
  async (req, res) => {
    try {
      const { chapterId, novelId } = req.params
      const chapter = await Chapter.findByIdAndDelete(chapterId)
      if (!chapter) {
        return res.status(404).send({ message: 'Chapter not found' })
      }

      // Update novel's chapter_info
      const novel = await Novel.findById(novelId)
      novel.chapter_info.numberOfChapters--

      // Remove the deleted chapter from lastThreeChapters
      novel.chapter_info.lastThreeChapters =
        novel.chapter_info.lastThreeChapters.filter(
          (c) => c.chapterId !== chapterId
        )

      // Re-populate lastThreeChapters if there are fewer than 3 chapters left
      const remainingChapters = await Chapter.find({ novelId })
        .sort({ chapterNumber: -1 })
        .limit(3)
      remainingChapters.forEach((chap) => {
        if (
          !novel.chapter_info.lastThreeChapters.some(
            (c) => c.chapterId === chap._id.toString()
          )
        ) {
          novel.chapter_info.lastThreeChapters.push({
            chapterNumber: chap.chapterNumber,
            chapterId: chap._id.toString(),
          })
        }
      })

      // Ensure only the last three chapters are stored
      if (novel.chapter_info.lastThreeChapters.length > 3) {
        novel.chapter_info.lastThreeChapters =
          novel.chapter_info.lastThreeChapters.slice(0, 3)
      }

      novel.updatedAt = Date.now()
      await novel.save()
      // Remove the chapter from the user's ChaptersCreated list
      const user = await User.findOne({ ChaptersCreated: chapterId })
      if (user) {
        user.ChaptersCreated = user.ChaptersCreated.filter(
          (id) => id.toString() !== chapterId
        )
        await User.findByIdAndUpdate(user._id, {
          $pull: { ChaptersCreated: chapterId },
        })
      }

      res.send({ message: 'Chapter deleted' })
    } catch (error) {
      res.status(400).send(error)
    }
  }
)

module.exports = router
