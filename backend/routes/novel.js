const express = require('express')
const Novel = require('../models/novel')
const Chapter = require('../models/chapter')
const { authorize, authenticate } = require('../middleware/middleware')
const multer = require('multer')
const router = express.Router()
const {
  deleteImageFromFirebase,
  uploadImageToFirebase,
} = require('../config/firebase')
const User = require('../models/user') // Adjust the path as needed
const moment = require('moment') // Make sure to install moment.js: npm install moment

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB limit for novel cover
})

const generateUniqueId = async () => {
  let unique = false
  let customId
  while (!unique) {
    customId = Math.random().toString(36).substr(2, 9) // Generate a random string
    const existingNovel = await Novel.findOne({ customId })
    if (!existingNovel) {
      unique = true
    }
  }
  return customId
}

// Get all novels
router.get('/', authenticate, async (req, res) => {
  try {
    const novels = await Novel.find()
    res.send(novels)
  } catch (error) {
    res.status(500).send(error)
  }
})

//Get novels by search
router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.q
    const searchType = req.query.type || 'all' // Default to 'all' if not specified
    let novels = []

    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i') // case-insensitive regex
      let searchConditions = []

      if (searchType === 'all' || searchType === 'title') {
        searchConditions.push({ title: regex })
        searchConditions.push({ arabicTitle: regex })
      }
      if (searchType === 'all' || searchType === 'englishName') {
        searchConditions.push({ englishName: regex })
      }
      if (searchType === 'author') {
        searchConditions.push({ author: regex })
      }

      novels = await Novel.find({ $or: searchConditions })
    } else {
      novels = await Novel.find()
    }
    res.json(novels)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching novels', error })
  }
})

// Get a specific novel by ID
router.get('/:id', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id)
    if (!novel) return res.status(404).send({ message: 'Novel not found' })
    res.send(novel)
  } catch (error) {
    res.status(500).send(error)
  }
})

// Add a new novel (admin only)
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  upload.single('image'),
  async (req, res) => {
    try {
      let {
        customId,
        title,
        description,
        status,
        genres,
        author,
        publisher,
        rating,
        numberOfReaders,
        numberOfAllChapters,
        originalLanguage,
        dateOfPublication,
        englishName,
      } = req.body
      if (!customId) {
        customId = await generateUniqueId()
      }
      if (
        !customId ||
        !title ||
        !author ||
        !originalLanguage ||
        !dateOfPublication ||
        !englishName
      ) {
        return res
          .status(400)
          .send(
            "Fields 'customId', 'title', 'author', 'originalLanguage', 'englishName', 'imagenovel' , and 'dateOfPublication' are required"
          )
      }

      const imageUrl = req.file
        ? await uploadImageToFirebase(req.file, 'novels')
        : ''

      if (!imageUrl) {
        return res.status(400).send('imagenovel are required')
      }

      // Check if genres is a string (JSON string) and parse it if necessary
      if (typeof genres === 'string') {
        genres = JSON.parse(genres)
      }
      const novel = new Novel({
        customId,
        title,
        englishName,
        description,
        originalLanguage,
        status,
        genres,
        author,
        rating: rating ? Number(rating) : 0,
        numberOfReaders: numberOfReaders ? Number(numberOfReaders) : 0,
        numberOfAllChapters: numberOfAllChapters
          ? Number(numberOfAllChapters)
          : 0,
        dateOfPublication: dateOfPublication ? Number(dateOfPublication) : 0,
        publisher,
        translators: [req.user.username],
        image: imageUrl,
      })
      await novel.save()

      const user = req.user
      // Add novel to user's NovelsCreated field
      user.NovelsCreated.push(novel._id)
      await User.findByIdAndUpdate(user._id, {
        $push: { NovelsCreated: novel._id },
      })

      res.status(201).send(novel)
    } catch (error) {
      console.error('Error:', error)
      res.status(400).send(error)
    }
  }
)

// Update a novel
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  upload.single('image'),
  async (req, res) => {
    try {
      const novelId = req.params.id
      let novel = await Novel.findById(novelId)
      if (!novel) {
        return res.status(404).send('Novel not found')
      }

      let {
        customId,
        title,
        description,
        status,
        genres,
        author,
        publisher,
        rating,
        numberOfReaders,
        numberOfAllChapters,
        originalLanguage,
        dateOfPublication,
        englishName,
      } = req.body

      if (
        !title ||
        !author ||
        !originalLanguage ||
        !dateOfPublication ||
        !englishName
      ) {
        return res
          .status(400)
          .send(
            "Fields 'title', 'author', 'originalLanguage', 'englishName', and 'dateOfPublication' are required"
          )
      }
      // Check if genres is a string (JSON string) and parse it if necessary
      let parsedGenres = genres
      if (typeof genres === 'string') {
        parsedGenres = JSON.parse(genres)
      }

      // Remove the old image if a new one is uploaded
      if (req.file) {
        if (
          novel.image &&
          novel.image.startsWith('https://storage.googleapis.com')
        ) {
          await deleteImageFromFirebase(novel.image)
        }
        const imageUrl = await uploadImageToFirebase(req.file, 'novels')
        novel.image = imageUrl
      }

      // Update novel fields
      novel.customId = customId || novel.customId
      novel.title = title
      novel.englishName = englishName
      novel.description = description || novel.description
      novel.originalLanguage = originalLanguage
      novel.status = status || novel.status
      novel.genres = parsedGenres
      novel.author = author
      novel.rating = rating ? Number(rating) : novel.rating
      novel.numberOfReaders = numberOfReaders
        ? Number(numberOfReaders)
        : novel.numberOfReaders
      novel.numberOfAllChapters = numberOfAllChapters
        ? Number(numberOfAllChapters)
        : novel.numberOfAllChapters
      novel.dateOfPublication = dateOfPublication
        ? Number(dateOfPublication)
        : novel.dateOfPublication
      novel.publisher = publisher || novel.publisher
      novel.translators = [req.user.username] // Update this as needed
      novel.image = novel.image

      await novel.save()
      res.status(200).send(novel)
    } catch (error) {
      res.status(400).send(error)
    }
  }
)

// Delete a novel
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const novelId = req.params.id
    let novel = await Novel.findById(novelId)
    if (!novel) {
      return res.status(404).send('Novel not found')
    }

    // Remove the old image
    if (
      novel.image &&
      novel.image.startsWith('https://storage.googleapis.com')
    ) {
      await deleteImageFromFirebase(novel.image)
    }

    await Novel.findByIdAndDelete(novelId)

    await User.updateMany(
      { NovelsCreated: novel._id },
      { $pull: { NovelsCreated: novel._id } }
    )
    await User.updateMany(
      { favorite: novel._id },
      { $pull: { favorite: novel._id } }
    )
    await User.updateMany(
      { 'Lastview.novel': novel._id },
      { $pull: { Lastview: { novel: novel._id } } }
    )

    // Remove all chapters of the novel from ChaptersCreated list of users
    const chapters = await Chapter.find({ novelId: novel._id })
    const chapterIds = chapters.map((chapter) => chapter._id)

    await User.updateMany(
      { ChaptersCreated: { $in: chapterIds } },
      { $pull: { ChaptersCreated: { $in: chapterIds } } }
    )

    await Chapter.deleteMany({ novelId: novel._id })

    res.status(200).send({ message: 'Novel And chapters deleted successfully' })
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/:id/views', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id)
    if (!novel) {
      return res.status(404).json({ message: 'Novel not found' })
    }

    const now = moment()
    const lastUpdated = moment(novel.views.lastUpdated || 0)

    // Check if it's a new day
    if (!now.isSame(lastUpdated, 'day')) {
      novel.views.daily = 0
    }

    // Check if it's a new week
    if (!now.isSame(lastUpdated, 'week')) {
      novel.views.weekly = 0
    }

    // Check if it's a new month
    if (!now.isSame(lastUpdated, 'month')) {
      novel.views.monthly = 0
    }

    // Increment views
    novel.views.daily += 1
    novel.views.weekly += 1
    novel.views.monthly += 1
    novel.views.total += 1
    novel.views.lastUpdated = now.toDate()

    await novel.save()

    res.json({ message: 'Views updated successfully', views: novel.views })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating views', error: error.message })
  }
})

module.exports = router
