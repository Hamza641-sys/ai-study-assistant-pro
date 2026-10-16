import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true, // in bytes
    },
    mimeType: {
      type: String,
      required: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'uploading',
    },
    processingError: {
      type: String,
      default: null,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    // Brief AI-generated description of the document
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ title: 'text', originalName: 'text' });

const Document = mongoose.model('Document', documentSchema);
export default Document;
