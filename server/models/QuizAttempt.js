import mongoose from 'mongoose';

// Sub-schema for individual questions
const questionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    options: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },
    // IMPORTANT: correctAnswer is NOT sent to client before submission
    // Stored server-side only and revealed after submission
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    explanation: { type: String, default: '' },
    // Set only after submission
    userAnswer: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: null,
    },
    // Source of quiz generation
    sourceType: {
      type: String,
      enum: ['document', 'topic'],
      default: 'topic',
    },
    questions: [questionSchema],
    totalQuestions: {
      type: Number,
      required: true,
    },
    // Submission state
    status: {
      type: String,
      enum: ['pending', 'submitted'],
      default: 'pending',
    },
    // Scoring - set after submission
    score: {
      type: Number,
      default: null, // number of correct answers
    },
    scorePercentage: {
      type: Number,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    // Time taken in seconds
    timeTaken: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizAttemptSchema.index({ userId: 1, createdAt: -1 });
quizAttemptSchema.index({ userId: 1, status: 1 });
quizAttemptSchema.index({ userId: 1, documentId: 1 });

// Virtual: pass/fail threshold (60%)
quizAttemptSchema.virtual('passed').get(function () {
  if (this.scorePercentage === null) return null;
  return this.scorePercentage >= 60;
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
