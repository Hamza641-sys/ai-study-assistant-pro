import Document from '../models/Document.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Summary from '../models/Summary.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get user-specific learning statistics
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Run all queries in parallel for performance
  const [
    totalDocuments,
    readyDocuments,
    totalSummaries,
    totalQuizzes,
    submittedQuizzes,
    recentConversations,
    recentDocuments,
    recentSummaries,
    quizScores,
  ] = await Promise.all([
    // Total documents uploaded
    Document.countDocuments({ userId }),

    // Ready documents (successfully processed)
    Document.countDocuments({ userId, status: 'ready' }),

    // Total summaries created
    Summary.countDocuments({ userId }),

    // Total quiz attempts
    QuizAttempt.countDocuments({ userId }),

    // Submitted quiz attempts (for avg score calculation)
    QuizAttempt.find({ userId, status: 'submitted' })
      .select('score scorePercentage totalQuestions title createdAt')
      .sort({ createdAt: -1 })
      .limit(10),

    // Recent conversations (last 5)
    Conversation.find({ userId, isArchived: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title mode messageCount updatedAt'),

    // Recent documents (last 5)
    Document.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title originalName status fileSize createdAt'),

    // Recent summaries (last 5)
    Summary.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title summaryType createdAt')
      .populate('documentId', 'title'),

    // All scores for average calculation
    QuizAttempt.find({ userId, status: 'submitted' })
      .select('scorePercentage'),
  ]);

  // Calculate average quiz score
  const avgScore =
    quizScores.length > 0
      ? Math.round(
          quizScores.reduce((sum, q) => sum + (q.scorePercentage || 0), 0) /
            quizScores.length
        )
      : null;

  // Recent activity feed (combine and sort)
  const recentActivity = [
    ...recentDocuments.map((d) => ({
      type: 'document',
      title: d.title,
      subtitle: `${(d.fileSize / 1024 / 1024).toFixed(1)} MB`,
      status: d.status,
      date: d.createdAt,
    })),
    ...recentSummaries.map((s) => ({
      type: 'summary',
      title: s.title,
      subtitle: s.summaryType.replace('_', ' '),
      date: s.createdAt,
    })),
    ...submittedQuizzes.slice(0, 3).map((q) => ({
      type: 'quiz',
      title: q.title,
      subtitle: `Score: ${q.scorePercentage}%`,
      date: q.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalDocuments,
        readyDocuments,
        totalSummaries,
        totalQuizzes,
        submittedQuizzes: submittedQuizzes.length,
        avgQuizScore: avgScore,
        totalConversations: recentConversations.length,
      },
      recentConversations,
      recentDocuments,
      recentSummaries,
      recentQuizzes: submittedQuizzes,
      recentActivity,
    },
  });
});
