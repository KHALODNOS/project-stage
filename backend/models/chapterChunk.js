const mongoose = require('mongoose')

const chapterChunkSchema = new mongoose.Schema(
  {
    novelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Novel',
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // an array of numbers (the vector)
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ChapterChunk', chapterChunkSchema)
