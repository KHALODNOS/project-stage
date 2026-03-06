const { GoogleGenerativeAI } = require('@google/generative-ai')
const { stitchChunks } = require('./chunkText')
// Ensure your API key is loaded from an environment variable for security
// For development, you might put it directly, but in production, use process.env
const API_KEY = process.env.GEMINI_API_KEY // Recommended way

const genAI = new GoogleGenerativeAI(API_KEY)

async function getNovelAnswerFromGemini(
  novelChunks,
  userQuestion,
  maxWords = 400
) {
  // Choose the appropriate model. gemini-2.5-flash is generally good for this.
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  // Construct the prompt with the novel chunks and user question
  const chunksText = stitchChunks(novelChunks, maxWords) // Adjust chunk size as needed
  const prompt = `
You are a helpful AI assistant that analyzes excerpts from novels.
Based on the following chapter chunks, provide a structured and precise answer to the user's input.

---
**Novel Chunks:**
${chunksText}
---

**User Input:** ${userQuestion}

**Instructions for Answer:**
1. Be concise and to the point.
2. Only use the provided chunks to answer the question.
3. If the answer is not found in the chunks, reply with "I don't know" or "I can't answer that."
4. If possible, include a brief relevant excerpt and cite it.
5. Respond in the same language as the question.
6. If there is no clear question (e.g., "Hello", "Hi"), respond with a polite offer to help, such as "Hello! How can I help you today?"
7. Structure your answer clearly (use paragraphs, bullets, or numbered lists when appropriate) to enhance readability.
8. Use only one language per paragraph. If you need to include a quote or excerpt in a different language (e.g., English quote in an Arabic answer), place it on a new line to preserve clarity and avoid mixing languages mid-sentence.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    return text
  } catch (error) {
    console.error('Error generating content from Gemini:', error)
    if (error.response && error.response.promptFeedback) {
      console.error('Prompt Feedback:', error.response.promptFeedback)
    }
    throw new Error('Failed to get answer from Gemini.')
  }
}

module.exports = { getNovelAnswerFromGemini }
