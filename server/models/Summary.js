import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Summary title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    // Type of summary requested
    summaryType: {
      type: String,
      enum: [
        'short',        // Short summary (1-2 paragraphs)
        'detailed',     // Detailed summary
        'key_points',   // Bullet points of key ideas
        'definitions',  // Important terms and definitions
        'revision',     // Revision notes format
        'chapter_wise', // Chapter-by-chapter breakdown
      ],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Source: document-based or custom text input
    sourceType: {
      type: String,
      enum: ['document', 'custom_text', 'topic'],
      default: 'document',
    },
    // Custom input text if not from document
    inputText: {
      type: String,
      default: null,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
summarySchema.index({ userId: 1, createdAt: -1 });
summarySchema.index({ userId: 1, documentId: 1 });
summarySchema.index({ userId: 1, summaryType: 1 });

const Summary = mongoose.model('Summary', summarySchema);
export default Summary;
