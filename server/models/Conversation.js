import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    // Mode: general = AI Tutor only, rag = document-grounded Q&A
    mode: {
      type: String,
      enum: ['general', 'rag'],
      default: 'general',
    },
    // Documents attached to this conversation (for RAG mode)
    attachedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, isArchived: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
