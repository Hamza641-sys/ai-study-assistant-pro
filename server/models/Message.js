import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // For RAG responses: store retrieved source information
    sources: [
      {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        documentTitle: String,
        chunkIndex: Number,
        pageNumber: Number,
        relevanceScore: Number,
        snippet: String,
      },
    ],
    // Token usage tracking
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    // Error handling
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
