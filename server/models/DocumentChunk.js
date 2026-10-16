import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // Vector embedding for semantic search (1536 dimensions for text-embedding-3-small)
    embedding: {
      type: [Number],
      default: null,
    },
    metadata: {
      pageNumber: { type: Number, default: null },
      startChar: { type: Number, default: null },
      endChar: { type: Number, default: null },
      tokenCount: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient retrieval
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });
documentChunkSchema.index({ userId: 1, documentId: 1 });

// MongoDB Atlas Vector Search index (defined separately in Atlas UI)
// Index name: "vector_index" on "embedding" field with 1536 dimensions

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);
export default DocumentChunk;
