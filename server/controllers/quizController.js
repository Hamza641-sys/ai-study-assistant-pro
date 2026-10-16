import QuizAttempt from '../models/QuizAttempt.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateQuiz } from '../services/openaiService.js';

/**
 * @route   POST /api/quizzes/generate
 * @desc    Generate a new quiz from topic or document
 * @access  Private
 */
export const generateQuizHandler = asyncHandler(async (req, res) => {
  const { sourceType, documentId, topic, numQuestions = 5 } = req.body;

  let sourceText = '';
  let quizTitle = '';
  let resolvedDocumentId = null;

  if (sourceType === 'document') {
    // Ownership + status check
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: 'ready',
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or not yet processed.',
      });
    }

    const chunks = await DocumentChunk.find({ documentId })
      .sort({ chunkIndex: 1 })
      .select('text');

    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document has no extractable text content.',
      });
    }

    sourceText = chunks.map((c) => c.text).join('\n\n').substring(0, 10000);
    quizTitle = `Quiz — ${document.title}`;
    resolvedDocumentId = documentId;
  } else {
    sourceText = topic;
    quizTitle = `Quiz — ${topic}`;
  }

  // Generate quiz via AI
  let questions = [];
  try {
    questions = await generateQuiz(sourceText, sourceType, numQuestions);
  } catch (err) {
    console.error('Quiz generation error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again.',
    });
  }

  if (!questions || questions.length === 0) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz questions. Please try again.',
    });
  }

  // Save quiz attempt (pending = not yet submitted)
  const quizAttempt = await QuizAttempt.create({
    userId: req.user.id,
    documentId: resolvedDocumentId,
    title: quizTitle,
    topic: sourceType === 'topic' ? topic : null,
    sourceType,
    questions,
    totalQuestions: questions.length,
    status: 'pending',
  });

  // IMPORTANT: Return questions WITHOUT correctAnswer to prevent cheating
  const safeQuestions = quizAttempt.questions.map((q) => ({
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    options: q.options,
    // correctAnswer is INTENTIONALLY omitted here
  }));

  res.status(201).json({
    success: true,
    message: 'Quiz generated successfully.',
    data: {
      _id: quizAttempt._id,
      title: quizAttempt.title,
      topic: quizAttempt.topic,
      sourceType: quizAttempt.sourceType,
      totalQuestions: quizAttempt.totalQuestions,
      status: quizAttempt.status,
      questions: safeQuestions,
      createdAt: quizAttempt.createdAt,
    },
  });
});

/**
 * @route   POST /api/quizzes/:id/submit
 * @desc    Submit quiz answers and get results
 * @access  Private
 */
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;

  const quizAttempt = await QuizAttempt.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!quizAttempt) {
    return res.status(404).json({
      success: false,
      message: 'Quiz not found.',
    });
  }

  if (quizAttempt.status === 'submitted') {
    return res.status(400).json({
      success: false,
      message: 'This quiz has already been submitted.',
    });
  }

  // Server-side scoring — trustedlogic only
  let correctCount = 0;
  const gradedQuestions = quizAttempt.questions.map((question) => {
    const submission = answers.find(
      (a) => a.questionNumber === question.questionNumber
    );
    const userAnswer = submission ? submission.answer : null;
    const isCorrect = userAnswer === question.correctAnswer;
    if (isCorrect) correctCount++;

    return {
      ...question.toObject(),
      userAnswer,
      isCorrect,
    };
  });

  const scorePercentage = Math.round((correctCount / quizAttempt.totalQuestions) * 100);

  // Update quiz attempt
  quizAttempt.questions = gradedQuestions;
  quizAttempt.status = 'submitted';
  quizAttempt.score = correctCount;
  quizAttempt.scorePercentage = scorePercentage;
  quizAttempt.submittedAt = new Date();
  quizAttempt.timeTaken = timeTaken || null;
  await quizAttempt.save();

  // Now safe to return correct answers and explanations
  res.status(200).json({
    success: true,
    message: 'Quiz submitted successfully.',
    data: {
      _id: quizAttempt._id,
      title: quizAttempt.title,
      totalQuestions: quizAttempt.totalQuestions,
      score: correctCount,
      scorePercentage,
      passed: scorePercentage >= 60,
      timeTaken: quizAttempt.timeTaken,
      submittedAt: quizAttempt.submittedAt,
      questions: gradedQuestions.map((q) => ({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect,
        explanation: q.explanation,
      })),
    },
  });
});

/**
 * @route   GET /api/quizzes
 * @desc    Get all quiz attempts for the user
 * @access  Private
 */
export const getQuizAttempts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;

  const attempts = await QuizAttempt.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('documentId', 'title')
    .select('-questions'); // Don't return questions in list view

  res.status(200).json({
    success: true,
    data: attempts,
  });
});

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get a single quiz attempt result (owner only)
 * @access  Private
 */
export const getQuizAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate('documentId', 'title');

  if (!attempt) {
    return res.status(404).json({
      success: false,
      message: 'Quiz attempt not found.',
    });
  }

  // If pending, hide correct answers
  if (attempt.status === 'pending') {
    const safeQuestions = attempt.questions.map((q) => ({
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      options: q.options,
    }));
    return res.status(200).json({
      success: true,
      data: { ...attempt.toObject(), questions: safeQuestions },
    });
  }

  res.status(200).json({
    success: true,
    data: attempt,
  });
});
