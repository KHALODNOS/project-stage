const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function getEmbedding(text) {
  if (!text) {
    throw new Error('Text to embed cannot be empty');
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function getEmbeddings(texts) {
  if (!texts || texts.length === 0) {
    return [];
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  // Format requests for the batch API
  const requests = texts.map((text) => ({
    content: { role: 'user', parts: [{ text }] },
  }));

  try {
    const result = await model.batchEmbedContents({ requests });
    return result.embeddings.map((e) => e.values);
  } catch (error) {
    console.warn("Batch embedding failed, falling back to Promise.all...", error.message);
    // Fallback if batch request is malformed or unsupported
    const embeddings = await Promise.all(
      texts.map(async (text) => {
        const result = await model.embedContent(text);
        return result.embedding.values;
      })
    );
    return embeddings;
  }
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
}

module.exports = { getEmbedding, getEmbeddings, cosineSimilarity };
