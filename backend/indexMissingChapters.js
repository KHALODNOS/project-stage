require('dotenv').config();
const mongoose = require('mongoose');
const Chapter = require('./models/chapter');
const ChapterChunk = require('./models/chapterChunk');
const { splitIntoChunks } = require('./utils/chunkText');
const { getEmbeddings } = require('./utils/embedding');

async function indexMissingChapters() {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('Connected to DB');

        const totalChapters = await Chapter.countDocuments();
        console.log(`Found ${totalChapters} chapters in total`);

        for (const chapter of await Chapter.find({})) {
            // Check if this chapter is already indexed
            const existing = await ChapterChunk.findOne({ chapterId: chapter._id });
            if (existing) {
                console.log(`Skipping index for Ch ${chapter.chapterNumber} (Already indexed)`);
                continue;
            }

            console.log(`Indexing Ch ${chapter.chapterNumber}...`);
            const chunks = splitIntoChunks(chapter.content);

            if (chunks.length === 0) continue;

            try {
                const embeddings = await getEmbeddings(chunks);
                const chunkDocs = chunks.map((chunkText, idx) => ({
                    novelId: chapter.novelId,
                    chapterId: chapter._id,
                    chapterNumber: chapter.chapterNumber,
                    chunkIndex: idx,
                    content: chunkText,
                    embedding: embeddings[idx],
                }));

                await ChapterChunk.insertMany(chunkDocs);
                console.log(`Successfully indexed ${chunks.length} chunks for Ch ${chapter.chapterNumber}`);
            } catch (err) {
                console.error(`Failed to get embeddings for Ch ${chapter.chapterNumber}:`, err.message);
            }
        }

        console.log('All missing chapters indexed!');
        process.exit(0);
    } catch (error) {
        console.error('Critical Error in indexer:', error);
        process.exit(1);
    }
}

indexMissingChapters();
