import OpenAI from 'openai';

// ─── Groq Client (FREE — no credit card needed) ───────────────────────────────
// Used for: AI Tutor, Quiz, Summarizer, RAG answers
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const CHAT_MODEL      = 'openai/gpt-oss-20b'; // Free Groq model
const MAX_TOKENS_CHAT = 1500;

// ─── System Prompts ───────────────────────────────────────────────────────────

const TUTOR_SYSTEM_PROMPT = `You are an expert AI study tutor helping students learn effectively.
Your role is to:
- Explain concepts clearly with relevant examples
- Break down complex topics into understandable parts
- Encourage students and guide them step by step
- Provide accurate, educational content
- Ask clarifying questions when needed
- Keep explanations concise but thorough

Always be encouraging, patient, and educational in your responses.
If you are unsure about something, say so honestly rather than guessing.`;

const RAG_SYSTEM_PROMPT = `You are an AI study assistant that answers questions based ONLY on the provided document context.

Rules you MUST follow:
1. Answer ONLY using the information in the provided context sections
2. If the context does not contain enough information to answer, clearly say: "The uploaded documents don't contain enough information to answer this question."
3. Always cite which source (Source 1, Source 2, etc.) your answer comes from
4. Do not make up or hallucinate information
5. If multiple sources support the answer, mention all of them
6. Be precise and educational in your explanations`;

// ─── AI Tutor Chat (Groq FREE) ────────────────────────────────────────────────

export const chatWithAI = async (history) => {
  const messages = [
    { role: 'system', content: TUTOR_SYSTEM_PROMPT },
    ...history,
  ];

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    max_tokens: MAX_TOKENS_CHAT,
    temperature: 0.7,
  });

  return {
    content: response.choices[0].message.content,
    usage: response.usage,
  };
};

// ─── RAG Response (Groq FREE) ─────────────────────────────────────────────────

export const generateRAGResponse = async (question, context, history = []) => {
  const contextMessage = `Here is the relevant content from the uploaded documents:\n\n${context}\n\n---\nBased ONLY on the above context, answer the following question.`;

  const messages = [
    { role: 'system', content: RAG_SYSTEM_PROMPT },
    ...history.slice(-4),
    { role: 'user', content: `${contextMessage}\n\nQuestion: ${question}` },
  ];

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    max_tokens: MAX_TOKENS_CHAT,
    temperature: 0.3,
  });

  return {
    content: response.choices[0].message.content,
    usage: response.usage,
  };
};

// ─── Summary Generation (Groq FREE) ──────────────────────────────────────────

const SUMMARY_PROMPTS = {
  short:        `Create a concise summary (2-3 paragraphs) of the following text. Capture the most important ideas clearly.`,
  detailed:     `Create a comprehensive, detailed summary of the following text. Cover all major points, arguments, and conclusions.`,
  key_points:   `Extract and list the key points from the following text as clear bullet points. Each point should be a complete, standalone idea.`,
  definitions:  `Extract all important terms, concepts, and definitions from the following text. Format as: **Term**: Definition`,
  revision:     `Create revision notes from the following text. Use headings, bullet points, and highlight key facts important for an exam.`,
  chapter_wise: `Organize the following text into a chapter-wise or section-wise summary. Identify natural topic breaks and summarize each section separately with a heading.`,
};

export const generateSummary = async (text, summaryType) => {
  const promptInstruction = SUMMARY_PROMPTS[summaryType] || SUMMARY_PROMPTS.short;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert study notes writer. Your summaries are clear, accurate, and well-structured. You preserve the original meaning and never add information that isn't in the source text.`,
      },
      {
        role: 'user',
        content: `${promptInstruction}\n\nText to summarize:\n\n${text}`,
      },
    ],
    max_tokens: 2000,
    temperature: 0.4,
  });

  return response.choices[0].message.content;
};

// ─── Quiz Generation (Groq FREE) ─────────────────────────────────────────────

export const generateQuiz = async (source, sourceType, numQuestions = 5) => {
  const prompt =
    sourceType === 'document'
      ? `Create ${numQuestions} multiple choice questions based on the following text. Test understanding of key concepts.\n\nText:\n${source}`
      : `Create ${numQuestions} multiple choice questions about the topic: "${source}". Cover different aspects of the topic.`;

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert quiz creator. Generate multiple choice questions in EXACTLY this JSON format (return ONLY a JSON array, no other text, no markdown):
[
  {
    "questionNumber": 1,
    "questionText": "Question here?",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "B",
    "explanation": "Brief explanation of why B is correct"
  }
]
IMPORTANT: Return ONLY the JSON array. No markdown. No extra text.`,
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 3000,
    temperature: 0.6,
  });

  try {
    let raw = response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    raw = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    // Extract JSON array
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) raw = match[0];

    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

    return questions
      .filter(
        (q) =>
          q.questionText &&
          q.options?.A && q.options?.B && q.options?.C && q.options?.D &&
          ['A', 'B', 'C', 'D'].includes(q.correctAnswer)
      )
      .slice(0, numQuestions)
      .map((q, idx) => ({
        questionNumber: idx + 1,
        questionText:   q.questionText,
        options:        { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D },
        correctAnswer:  q.correctAnswer,
        explanation:    q.explanation || '',
      }));
  } catch (err) {
    console.error('Failed to parse quiz JSON:', err.message);
    throw new Error('AI returned malformed quiz data. Please try again.');
  }
};

// ─── Embeddings — 100% FREE (No OpenAI needed) ───────────────────────────────
// Smart TF-IDF + bigram hash-based embeddings
// Works for PDF RAG — cosine similarity search still accurate for same-language docs
// Dimensions: 1536 (matches MongoDB vector search config)

const generateFallbackEmbedding = (text) => {
  const DIMS = 1536;
  const embedding = new Array(DIMS).fill(0);
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);

  // Unigram weights
  words.forEach((word) => {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) + hash) + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % DIMS;
    embedding[idx] += 1.0;
  });

  // Bigram weights (improves phrase matching)
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = words[i] + '_' + words[i + 1];
    let hash = 5381;
    for (let j = 0; j < bigram.length; j++) {
      hash = ((hash << 5) + hash) + bigram.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % DIMS;
    embedding[idx] += 0.5; // bigrams weighted less than unigrams
  }

  // L2 Normalize so cosine similarity works correctly
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0)) || 1;
  return embedding.map((v) => v / magnitude);
};

// Export embedding functions — 100% local, no API calls
export const generateEmbedding = async (text) => {
  return generateFallbackEmbedding(text);
};

export const generateEmbeddingsBatch = async (texts) => {
  return texts.map(generateFallbackEmbedding);
};
