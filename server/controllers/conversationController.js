import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Document from '../models/Document.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { chatWithAI } from '../services/openaiService.js';

/**
 * @route   POST /api/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
export const createConversation = asyncHandler(async (req, res) => {
  const { title, mode = 'general', documentIds = [] } = req.body;

  // Validate document ownership if RAG mode
  if (mode === 'rag' && documentIds.length > 0) {
    const docs = await Document.find({
      _id: { $in: documentIds },
      userId: req.user.id,
      status: 'ready',
    });
    if (docs.length !== documentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more documents not found or not yet processed.',
      });
    }
  }

  const conversation = await Conversation.create({
    userId: req.user.id,
    title: title || 'New Conversation',
    mode,
    attachedDocuments: documentIds,
  });

  res.status(201).json({
    success: true,
    data: conversation,
  });
});

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for the user
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    userId: req.user.id,
    isArchived: false,
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate('attachedDocuments', 'title originalName status');

  res.status(200).json({
    success: true,
    data: conversations,
  });
});

/**
 * @route   GET /api/conversations/:id
 * @desc    Get a single conversation with messages
 * @access  Private
 */
export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate('attachedDocuments', 'title originalName status');

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found.',
    });
  }

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .select('-tokenUsage'); // Don't expose token usage to client

  res.status(200).json({
    success: true,
    data: { conversation, messages },
  });
});

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Send a message and get AI response
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  // Verify conversation ownership
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    userId: req.user.id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found.',
    });
  }

  // Save user message
  const userMessage = await Message.create({
    conversationId: conversation._id,
    userId: req.user.id,
    role: 'user',
    content,
  });

  // Get recent conversation history for context (last 10 messages)
  const history = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('role content');

  const historyForAI = history.reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Get AI response
  let aiResponseContent = '';
  let tokenUsage = {};
  let aiError = null;

  try {
    const aiResult = await chatWithAI(historyForAI);
    aiResponseContent = aiResult.content;
    tokenUsage = aiResult.usage || {};
  } catch (err) {
    console.error('AI service error:', err.message);
    aiError = 'AI service temporarily unavailable.';
    aiResponseContent = 'Sorry, I am having trouble connecting to the AI service. Please try again in a moment.';
  }

  // Save AI message
  const aiMessage = await Message.create({
    conversationId: conversation._id,
    userId: req.user.id,
    role: 'assistant',
    content: aiResponseContent,
    tokenUsage,
    error: aiError,
  });

  // Update conversation metadata
  await Conversation.findByIdAndUpdate(conversation._id, {
    $inc: { messageCount: 2 },
    lastMessageAt: new Date(),
    // Auto-generate title from first user message
    ...(conversation.messageCount === 0 && {
      title: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
    }),
  });

  res.status(200).json({
    success: true,
    data: {
      userMessage,
      aiMessage: {
        _id: aiMessage._id,
        role: aiMessage.role,
        content: aiMessage.content,
        createdAt: aiMessage.createdAt,
        error: aiMessage.error,
      },
    },
  });
});

/**
 * @route   DELETE /api/conversations/:id
 * @desc    Delete a conversation and its messages
 * @access  Private
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found.',
    });
  }

  await Message.deleteMany({ conversationId: conversation._id });
  await conversation.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully.',
  });
});
