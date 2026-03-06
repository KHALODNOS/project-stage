const mongoose = require('mongoose');


const novelSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['مستمرة', 'متوقفة',"مكتملة"], default: 'مستمرة' },
  genres: [String],
  author: { type: String, required: true },
  publisher: String,
  translators: [String],
  rating: Number,
  numberOfReaders: Number,
  numberOfAllChapters: Number,
  originalLanguage: { type: String, required: true },
  dateOfPublication: { type: Number, required: true },
  englishName: String,
  image: { type: String, default: 'images.png' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  views: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  chapter_info: {
    numberOfChapters: { type: Number, default: 0 },
    lastThreeChapters: {
        type: [{ chapterNumber: Number, chapterId: String,createdAt: Date}],
        default: []
    }
  }
});
novelSchema.index({ genres: 1 });
novelSchema.pre('save', async function(next) {
  const novel = this;
  const existingNovel = await mongoose.models.Novel.findOne({ customId: novel.customId });
  if (existingNovel && existingNovel._id.toString() !== novel._id.toString()) {
    const error = new Error('Duplicate customId');
    error.name = 'Duplicate customId';
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Novel', novelSchema);