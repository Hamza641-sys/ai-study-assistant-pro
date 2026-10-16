import fs from 'fs';
import { asyncHandler } from '../middleware/errorHandler.js';
import { transcribeAudio } from '../services/voiceService.js';

/**
 * @route   POST /api/voice/transcribe
 * @desc    Convert audio to text using Groq Whisper
 * @access  Private
 */
export const transcribeAudioHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No audio file uploaded.',
    });
  }

  const audioFilePath = req.file.path;

  try {
    const transcribedText = await transcribeAudio(audioFilePath);

    res.status(200).json({
      success: true,
      data: {
        text: transcribedText.trim(),
      },
    });
  } catch (err) {
    console.error('Transcription error:', err.message);
    res.status(502).json({
      success: false,
      message: 'Voice transcription failed. Please try again.',
    });
  } finally {
    // Always clean up uploaded audio file
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }
  }
});
