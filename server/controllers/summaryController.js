import Summary from '../models/Summary.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateSummary } from '../services/openaiService.js';

const SUMMARY_TYPE_LABELS = {
  short: 'Short Summary',
  detailed: 'Detailed Summary',
  key_points: 'Key Points',
  definitions: 'Important Definitions',
  revision: 'Revision Notes',
  chapter_wise: 'Chapter-wise Summary',
};

/**
 * @route   POST /api/summaries/generate
 * @desc    Generate a summary from a document or custom text
 * @access  Private
 */
export const generateSummaryHandler = asyncHandler(async (req, res) => {
  const { summaryType, documentId, customText, title } = req.body;

  let sourceText = '';
  let sourceType = 'custom_text';
  let finalTitle = title || `${SUMMARY_TYPE_LABELS[summaryType]}`;
  let resolvedDocumentId = null;

  if (documentId) {
    // Ownership check
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

    // Get all chunks text for this document
    const chunks = await DocumentChunk.find({ documentId })
      .sort({ chunkIndex: 1 })
      .select('text');

    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document has no extractable text content.',
      });
    }

    sourceText = chunks.map((c) => c.text).join('\n\n');
    sourceType = 'document';
    finalTitle = title || `${SUMMARY_TYPE_LABELS[summaryType]} — ${document.title}`;
    resolvedDocumentId = documentId;
  } else if (customText) {
    sourceText = customText;
    sourceType = 'custom_text';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Either documentId or customText is required.',
    });
  }

  // Truncate very long texts to avoid token limits
  const maxChars = 12000;
  if (sourceText.length > maxChars) {
    sourceText = sourceText.substring(0, maxChars) + '\n\n[Content truncated for length]';
  }

  // Generate summary via AI
  let summaryContent = '';
  try {
    summaryContent = await generateSummary(sourceText, summaryType);
  } catch (err) {
    console.error('Summary generation error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again.',
    });
  }

  // Save to database
  const summary = await Summary.create({
    userId: req.user.id,
    documentId: resolvedDocumentId,
    title: finalTitle,
    summaryType,
    content: summaryContent,
    sourceType,
    inputText: sourceType === 'custom_text' ? customText?.substring(0, 500) : null,
    wordCount: summaryContent.split(/\s+/).length,
  });

  res.status(201).json({
    success: true,
    message: 'Summary generated successfully.',
    data: summary,
  });
});

/**
 * @route   GET /api/summaries
 * @desc    Get all summaries for the user
 * @access  Private
 */
export const getSummaries = asyncHandler(async (req, res) => {
  const { summaryType, documentId } = req.query;
  const filter = { userId: req.user.id };
  if (summaryType) filter.summaryType = summaryType;
  if (documentId) filter.documentId = documentId;

  const summaries = await Summary.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('documentId', 'title originalName')
    .select('-inputText'); // Don't return input text in list

  res.status(200).json({
    success: true,
    data: summaries,
  });
});

/**
 * @route   GET /api/summaries/:id
 * @desc    Get a single summary (owner only)
 * @access  Private
 */
export const getSummary = asyncHandler(async (req, res) => {
  const summary = await Summary.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate('documentId', 'title originalName');

  if (!summary) {
    return res.status(404).json({
      success: false,
      message: 'Summary not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * @route   DELETE /api/summaries/:id
 * @desc    Delete a summary (owner only)
 * @access  Private
 */
export const deleteSummary = asyncHandler(async (req, res) => {
  const summary = await Summary.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!summary) {
    return res.status(404).json({
      success: false,
      message: 'Summary not found.',
    });
  }

  await summary.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Summary deleted successfully.',
  });
});
