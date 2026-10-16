import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Groq supports Whisper for speech-to-text — FREE
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Transcribe audio file to text using Groq Whisper
 * @param {string} audioFilePath - Path to the uploaded audio file
 * @returns {string} Transcribed text
 */
export const transcribeAudio = async (audioFilePath) => {
  const audioStream = fs.createReadStream(audioFilePath);

  const transcription = await groq.audio.transcriptions.create({
    file: audioStream,
    model: 'whisper-large-v3-turbo', // Fast free Groq Whisper model
    response_format: 'text',
    language: 'en',
  });

  return transcription;
};
