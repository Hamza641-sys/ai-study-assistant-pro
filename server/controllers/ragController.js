import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Document from '../models/Document.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { retrieveRelevantChunks } from '../services/ragService.js';
import { generateRAGResponse } from '../services/openaiService.js';

/**
 * @route   POST /api/rag/ask
 * @desc    Ask a question grounded in uploaded documents (RAG)
 * @access  Private
 */
export const askQuestion = asyncHandler(async (req, res) => {
  const { question, documentIds, conversationId } = req.body;

  // Verify ownership of all specified documents
  const documents = await Document.find({
    _id: { $in: documentIds },
    userId: req.user.id,
    status: 'ready',
  });

  if (documents.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid processed documents found. Please upload and wait for processing to complete.',
    });
  }

  if (documents.length !== documentIds.length) {
    return res.status(400).json({
      success: false,
      message: 'Some documents were not found or are not yet processed.',
    });
  }

  // Retrieve relevant chunks using vector similarity
  const retrievedChunks = await retrieveRelevantChunks(
    question,
    documentIds,
    req.user.id,
    5 // top-k
  );

  if (retrievedChunks.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        answer: "I couldn't find relevant information in the uploaded documents to answer your question. Please try rephrasing, or make sure the document covers this topic.",
        sources: [],
        question,
      },
    });
  }

  // Build context string from retrieved chunks
  const contextText = retrievedChunks
    .map((chunk, i) => {
      const pageInfo = chunk.metadata?.pageNumber ? ` (Page ${chunk.metadata.pageNumber})` : '';
      return `[Source ${i + 1}] From "${chunk.documentTitle}"${pageInfo}:\n${chunk.text}`;
    })
    .join('\n\n---\n\n');

  // Get conversation history if provided
  let conversationHistory = [];
  let targetConversation = null;

  if (conversationId) {
    targetConversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    });

    if (targetConversation) {
      const recentMessages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('role content');
      conversationHistory = recentMessages.reverse().map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }
  }

  // Generate AI response grounded in context
  let answer = '';
  let tokenUsage = {};

  try {
    const result = await generateRAGResponse(question, contextText, conversationHistory);
    answer = result.content;
    tokenUsage = result.usage || {};
  } catch (err) {
    console.error('RAG AI generation error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again.',
    });
  }

  // Build source references to return to client
  const sources = retrievedChunks.map((chunk) => ({
    documentId: chunk.documentId,
    documentTitle: chunk.documentTitle,
    chunkIndex: chunk.chunkIndex,
    pageNumber: chunk.metadata?.pageNumber || null,
    snippet: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : ''),
    relevanceScore: chunk.score,
  }));

  // Save to conversation if one exists
  if (targetConversation) {
    const userMsg = await Message.create({
      conversationId: targetConversation._id,
      userId: req.user.id,
      role: 'user',
      content: question,
    });

    const aiMsg = await Message.create({
      conversationId: targetConversation._id,
      userId: req.user.id,
      role: 'assistant',
      content: answer,
      sources,
      tokenUsage,
    });

    await Conversation.findByIdAndUpdate(targetConversation._id, {
      $inc: { messageCount: 2 },
      lastMessageAt: new Date(),
    });
  }

  res.status(200).json({
    success: true,
    data: {
      answer,
      sources,
      question,
      documentsQueried: documents.map((d) => ({ _id: d._id, title: d.title })),
    },
  });
});
