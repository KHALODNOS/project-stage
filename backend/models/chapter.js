const mongoose = require('mongoose')

const chapterSchema = new mongoose.Schema({
  novelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
  },
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  translators: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Unique index to prevent duplicate chapter numbers for the same novel
chapterSchema.index({ novelId: 1, chapterNumber: 1 }, { unique: true })

chapterSchema.pre('save', async function (next) {
  const chapter = this
  const existingChapter = await mongoose.models.Chapter.findOne({
    novelId: chapter.novelId,
    chapterNumber: chapter.chapterNumber,
  })
  if (
    existingChapter &&
    existingChapter._id.toString() !== chapter._id.toString()
  ) {
    const error = new Error('Duplicate chapterNumber within the same novel')
    error.name = 'Duplicate chapterNumber within the same novel'
    return next(error)
  }
  next()
})
chapterSchema.pre('findOneAndUpdate', async function (next) {
  const chapter = this
  const existingChapter = await mongoose.models.Chapter.findOne({
    novelId: chapter.novelId,
    chapterNumber: chapter.chapterNumber,
  })
  if (
    existingChapter &&
    existingChapter._id.toString() !== chapter._id.toString()
  ) {
    const error = new Error('Duplicate chapterNumber within the same novel')
    error.name = 'Duplicate chapterNumber within the same novel'
    return next(error)
  }
  next()
})

module.exports = mongoose.model('Chapter', chapterSchema)
