import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { chunkText } from './textChunker.js';
import { generateEmbeddingsBatch } from './openaiService.js';

/**
 * Full PDF processing pipeline:
 * 1. Extract text from PDF file
 * 2. Split text into chunks
 * 3. Generate embeddings for all chunks
 * 4. Save chunks with embeddings to MongoDB
 * 5. Update document status to 'ready'
 *
 * @param {Object} document - MongoDB Document model instance
 * @param {string} userId   - Owner's user ID
 */
export const processPDF = async (document, userId) => {
  console.log(`📄 Starting PDF processing for: ${document.originalName}`);

  // ── 1. Read and parse PDF ──────────────────────────────────────────────────
  let pdfData;
  try {
    const fileBuffer = fs.readFileSync(document.filePath);
    pdfData = await pdfParse(fileBuffer);
  } catch (err) {
    console.error(`PDF parse error [${document._id}]:`, err.message);
    await Document.findByIdAndUpdate(document._id, {
      status: 'failed',
      processingError: `Could not read PDF: ${err.message}. The file may be encrypted, corrupted, or a scanned image.`,
    });
    return;
  }

  const rawText = pdfData.text?.trim();
  const pageCount = pdfData.numpages || 0;

  // ── 2. Validate extracted text ────────────────────────────────────────────
  if (!rawText || rawText.length < 50) {
    await Document.findByIdAndUpdate(document._id, {
      status: 'failed',
      processingError:
        'No readable text found in this PDF. The document may be a scanned image. Please use a text-based PDF.',
      pageCount,
    });
    console.warn(`⚠️  No text extracted from document ${document._id}`);
    return;
  }

  console.log(`✅ Extracted ${rawText.length} chars, ${pageCount} pages from ${document.originalName}`);

  // ── 3. Split text into manageable chunks ─────────────────────────────────
  const chunks = chunkText(rawText, {
    chunkSize: 800,    // ~800 chars per chunk
    chunkOverlap: 100, // 100 char overlap to preserve context across chunks
  });

  if (chunks.length === 0) {
    await Document.findByIdAndUpdate(document._id, {
      status: 'failed',
      processingError: 'Failed to split document into processable chunks.',
    });
    return;
  }

  console.log(`🔪 Split into ${chunks.length} chunks`);

  // ── 4. Generate embeddings in batch ──────────────────────────────────────
  let embeddings;
  try {
    embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.text));
  } catch (err) {
    console.error(`Embedding generation error [${document._id}]:`, err.message);
    await Document.findByIdAndUpdate(document._id, {
      status: 'failed',
      processingError: `AI embedding service error: ${err.message}`,
    });
    return;
  }

  // ── 5. Save chunks with embeddings to MongoDB ─────────────────────────────
  try {
    // Delete any existing chunks (in case of reprocessing)
    await DocumentChunk.deleteMany({ documentId: document._id });

    const chunkDocs = chunks.map((chunk, idx) => ({
      documentId: document._id,
      userId,
      chunkIndex: idx,
      text: chunk.text,
      embedding: embeddings[idx],
      metadata: {
        pageNumber: chunk.pageNumber || null,
        startChar: chunk.startChar,
        endChar: chunk.endChar,
        tokenCount: Math.ceil(chunk.text.length / 4), // approximate
      },
    }));

    // Insert in batches to avoid memory issues
    const BATCH_SIZE = 50;
    for (let i = 0; i < chunkDocs.length; i += BATCH_SIZE) {
      await DocumentChunk.insertMany(chunkDocs.slice(i, i + BATCH_SIZE));
    }

    console.log(`💾 Saved ${chunkDocs.length} chunks for document ${document._id}`);
  } catch (err) {
    console.error(`Chunk save error [${document._id}]:`, err.message);
    await Document.findByIdAndUpdate(document._id, {
      status: 'failed',
      processingError: `Failed to save document chunks: ${err.message}`,
    });
    return;
  }

  // ── 6. Update document to 'ready' ─────────────────────────────────────────
  await Document.findByIdAndUpdate(document._id, {
    status: 'ready',
    pageCount,
    chunkCount: chunks.length,
    wordCount: rawText.split(/\s+/).length,
    processingError: null,
  });

  console.log(`🎉 Document ${document._id} (${document.originalName}) processed successfully!`);
};
