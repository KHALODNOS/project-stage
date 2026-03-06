const express = require('express')
const router = express.Router()
const ChapterChunk = require('../models/chapterChunk')
const { getEmbedding, cosineSimilarity } = require('../utils/embedding')
const { stitchChunks } = require('../utils/chunkText')
const { getNovelAnswerFromGemini } = require('../utils/geminiApiConnect')

const { authenticate } = require('../middleware/middleware')

router.post('/search-chunks/:novelId', authenticate, async (req, res) => {
  try {
    const { question } = req.body
    const { novelId } = req.params

    console.log('The question is here:', question)

    if (!question) {
      return res.status(400).json({ message: 'Missing question in body' })
    }

    // Step 1: Get embedding for the question
    let questionEmbedding;
    let chunks = [];

    try {
      questionEmbedding = await getEmbedding(question);
      const allChunks = await ChapterChunk.find({ novelId });

      const scoredChunks = allChunks.map((chunk) => {
        const similarity = cosineSimilarity(questionEmbedding, chunk.embedding);
        return {
          content: chunk.content,
          chapterId: chunk.chapterId,
          chapterNumber: chunk.chapterNumber,
          chunkIndex: chunk.chunkIndex,
          similarity,
        };
      });

      scoredChunks.sort((a, b) => b.similarity - a.similarity);
      chunks = scoredChunks.slice(0, 5);
    } catch (embErr) {
      console.warn('Embedding failed, falling back to keyword search:', embErr.message);
      // Keyword fallback: search for words in content
      const keywords = question.split(' ').filter(w => w.length > 2).join('|');
      const textMatches = await ChapterChunk.find({
        novelId,
        content: { $regex: keywords || question, $options: 'i' }
      }).limit(5);

      chunks = textMatches.map(c => ({
        content: c.content,
        chapterId: c.chapterId,
        chapterNumber: c.chapterNumber,
        chunkIndex: c.chunkIndex,
        similarity: 0.5
      }));
    }

    if (chunks.length === 0) {
      console.log('No specific chunks found, getting latest chapters as context');
      const latest = await ChapterChunk.find({ novelId }).sort({ chapterNumber: -1, chunkIndex: -1 }).limit(3);
      chunks = latest.map(c => ({
        content: c.content,
        chapterId: c.chapterId,
        chapterNumber: c.chapterNumber,
        chunkIndex: c.chunkIndex,
        similarity: 0.1
      }));
    }

    console.log('Found chunks for context:', chunks.length);

    try {
      const answer = await getNovelAnswerFromGemini(chunks, question, 500);
      res.status(200).json({ answer: answer });
    } catch (aiError) {
      console.error('Gemini API Error:', aiError);
      res.status(502).json({
        message: 'AI Service Error',
        error: aiError.message,
        suggestion: 'Please try again in a moment'
      });
    }
  } catch (err) {
    console.error('Core Search logic error:', err)
    res.status(500).json({
      message: 'Internal server error in search logic',
      error: err.message
    });
  }
})

module.exports = router
