import DocumentChunk from '../models/DocumentChunk.js';
import Document from '../models/Document.js';
import { generateEmbedding } from './openaiService.js';

/**
 * Cosine similarity between two vectors
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} similarity score between -1 and 1
 */
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Retrieve the most relevant text chunks for a given question
 * Uses cosine similarity on stored embeddings (fallback for when
 * MongoDB Atlas Vector Search index is not configured).
 *
 * For production, replace with MongoDB Atlas $vectorSearch aggregation
 * when the Atlas Vector Search index is set up.
 *
 * @param {string}   question    - User's question text
 * @param {string[]} documentIds - Array of document IDs to search within
 * @param {string}   userId      - Owner's user ID (enforces access control)
 * @param {number}   topK        - Number of top chunks to return
 * @returns {Array} Top-k relevant chunks with scores and metadata
 */
export const retrieveRelevantChunks = async (
  question,
  documentIds,
  userId,
  topK = 5
) => {
  // Generate embedding for the question
  let questionEmbedding;
  try {
    questionEmbedding = await generateEmbedding(question);
  } catch (err) {
    console.error('Failed to generate question embedding:', err.message);
    throw new Error('Could not process your question for document search.');
  }

  // Try MongoDB Atlas Vector Search first (if index exists)
  try {
    const vectorResults = await vectorSearch(
      questionEmbedding,
      documentIds,
      userId,
      topK
    );
    if (vectorResults && vectorResults.length > 0) {
      return vectorResults;
    }
  } catch (err) {
    // Vector search index not configured — fall back to in-memory similarity
    console.warn('Atlas Vector Search not available, using cosine fallback:', err.message);
  }

  // Fallback: fetch all chunks and compute cosine similarity in-memory
  return await cosineSearchFallback(
    questionEmbedding,
    documentIds,
    userId,
    topK
  );
};

/**
 * MongoDB Atlas Vector Search
 * Requires a vector search index named "vector_index" on the document_chunks collection
 */
const vectorSearch = async (queryEmbedding, documentIds, userId, topK) => {
  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: topK * 10,
        limit: topK * 2, // over-fetch then filter by ownership
      },
    },
    {
      $match: {
        documentId: { $in: documentIds.map((id) => id) },
        userId: userId,
      },
    },
    { $limit: topK },
    {
      $project: {
        _id: 1,
        documentId: 1,
        chunkIndex: 1,
        text: 1,
        metadata: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  // Enrich with document titles
  return await enrichWithDocumentTitles(results);
};

/**
 * In-memory cosine similarity fallback
 * Used when Atlas Vector Search is not available
 */
const cosineSearchFallback = async (queryEmbedding, documentIds, userId, topK) => {
  // Fetch all chunks for the specified documents (ownership enforced)
  const chunks = await DocumentChunk.find({
    documentId: { $in: documentIds },
    userId,
    embedding: { $exists: true, $ne: null },
  })
    .select('documentId chunkIndex text metadata embedding')
    .lean();

  if (chunks.length === 0) return [];

  // Score each chunk
  const scored = chunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by score descending and take top-k
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK).filter((c) => c.score > 0.2); // min threshold

  return await enrichWithDocumentTitles(topChunks);
};

/**
 * Add document title to each chunk result
 */
const enrichWithDocumentTitles = async (chunks) => {
  if (chunks.length === 0) return [];

  // Get unique document IDs
  const docIds = [...new Set(chunks.map((c) => c.documentId.toString()))];
  const documents = await Document.find({ _id: { $in: docIds } })
    .select('title')
    .lean();

  const docMap = {};
  documents.forEach((d) => {
    docMap[d._id.toString()] = d.title;
  });

  return chunks.map((chunk) => ({
    ...chunk,
    documentTitle: docMap[chunk.documentId.toString()] || 'Unknown Document',
    // Remove embedding from response (large array, not needed by caller)
    embedding: undefined,
  }));
};
