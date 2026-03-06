function splitIntoChunks(text, maxWords = 150) {
  const words = text.split(/\s+/)
  const chunks = []

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
  }

  return chunks
}

function stitchChunks(chunks, maxWords = 400) {
  const used = new Set()
  const stitched = []
  let wordCount = 0

  for (const chunk of chunks) {
    const key = `${chunk.chapterId}-${chunk.chunkIndex}`
    if (used.has(key)) continue

    const words = chunk.content.trim().split(/\s+/)
    if (wordCount + words.length > maxWords) break

    // Prepend chapterNumber before the chunk content
    stitched.push(`Ch: ${chunk.chapterNumber} ${chunk.content.trim()}`)
    wordCount += words.length
    used.add(key)
  }

  return stitched.join('\n\n') // Optional: add spacing between chunks
}

module.exports = { splitIntoChunks, stitchChunks }
