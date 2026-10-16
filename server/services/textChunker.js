/**
 * Text chunking service
 * Splits large text into smaller, overlapping chunks for embedding and RAG retrieval.
 * Tries to split on sentence/paragraph boundaries for better semantic coherence.
 */

/**
 * Split text into chunks with optional overlap
 * @param {string} text         - Raw text to chunk
 * @param {Object} options
 * @param {number} options.chunkSize    - Target characters per chunk (default: 800)
 * @param {number} options.chunkOverlap - Characters of overlap between chunks (default: 100)
 * @returns {Array<{text, chunkIndex, startChar, endChar, pageNumber}>}
 */
export const chunkText = (text, { chunkSize = 800, chunkOverlap = 100 } = {}) => {
  if (!text || text.length === 0) return [];

  // Normalize whitespace
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < normalizedText.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= normalizedText.length) {
      // Last chunk — take whatever remains
      endIndex = normalizedText.length;
    } else {
      // Try to break at a sentence boundary (. ! ?) within the last 200 chars
      const searchZone = normalizedText.substring(endIndex - 200, endIndex);
      const sentenceBreak = findSentenceBreak(searchZone);

      if (sentenceBreak !== -1) {
        endIndex = endIndex - 200 + sentenceBreak + 1;
      } else {
        // Fall back to word boundary
        const wordBreak = normalizedText.lastIndexOf(' ', endIndex);
        if (wordBreak > startIndex) {
          endIndex = wordBreak;
        }
      }
    }

    const chunkText = normalizedText.substring(startIndex, endIndex).trim();

    if (chunkText.length > 20) {
      // Skip tiny chunks
      chunks.push({
        text: chunkText,
        chunkIndex,
        startChar: startIndex,
        endChar: endIndex,
        pageNumber: estimatePageNumber(startIndex, normalizedText.length),
      });
      chunkIndex++;
    }

    // Move start with overlap (ensures context continuity)
    startIndex = endIndex - chunkOverlap;
    if (startIndex <= 0) startIndex = endIndex; // safety guard
  }

  return chunks;
};

/**
 * Find the last sentence boundary (. ! ?) in a text string
 * Returns the index of the boundary character, or -1 if not found
 */
const findSentenceBreak = (text) => {
  // Look for '. ', '! ', '? ', or newline — in reverse order
  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i];
    const next = text[i + 1];
    if ((char === '.' || char === '!' || char === '?') && (next === ' ' || next === '\n')) {
      return i;
    }
    if (char === '\n' && next === '\n') {
      return i;
    }
  }
  return -1;
};

/**
 * Estimate page number based on character position
 * Rough heuristic: ~3000 chars per page
 */
const estimatePageNumber = (charPosition, totalChars) => {
  const CHARS_PER_PAGE = 3000;
  return Math.floor(charPosition / CHARS_PER_PAGE) + 1;
};

/**
 * Count approximate tokens in a string
 * Rule of thumb: 1 token ≈ 4 characters for English text
 */
export const estimateTokenCount = (text) => {
  return Math.ceil(text.length / 4);
};
