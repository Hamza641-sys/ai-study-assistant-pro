# System Architecture — AI Study Assistant Pro

## Overview

AI Study Assistant Pro is a full-stack GenAI web application built on a client-server architecture. The frontend is a React SPA, the backend is a Node.js/Express REST API, and AI capabilities are powered by the OpenAI API with a RAG pipeline grounded in MongoDB Atlas.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Student (Browser)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │  HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              React + Vite Frontend (Vercel)                     │
│  Pages: Landing, Dashboard, AI Tutor, Documents,                │
│         Summarizer, Quiz, Profile                               │
│  State: AuthContext, Custom Hooks (useDocuments, useChat, etc.) │
│  HTTP Client: Axios with JWT interceptor                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │  REST API (JSON)
                          │  Authorization: Bearer <JWT>
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│           Node.js + Express Backend (Render / Railway)          │
│                                                                 │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  Auth Routes │  │  API Routes   │  │  Rate Limiters       │ │
│  │  /api/auth   │  │  /documents   │  │  general / auth / ai │ │
│  │  JWT + bcrypt│  │  /rag         │  │  express-rate-limit  │ │
│  └──────────────┘  │  /summaries   │  └──────────────────────┘ │
│                    │  /quizzes     │                            │
│                    │  /dashboard   │                            │
│                    └───────────────┘                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Service Layer                          │   │
│  │  openaiService  │  ragService  │  pdfProcessor           │   │
│  │  textChunker    │              │                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────┬──────────────────────────────────┬────────────────────────┘
       │                                  │
       ▼                                  ▼
┌──────────────────┐            ┌──────────────────────────┐
│  MongoDB Atlas   │            │     OpenAI API            │
│  (Free Tier)     │            │                           │
│                  │            │  Models used:             │
│  Collections:    │            │  • gpt-3.5-turbo (chat)   │
│  • users         │            │  • text-embedding-3-small │
│  • documents     │            │    (1536-dim embeddings)  │
│  • doc_chunks    │            │                           │
│  • conversations │            │  Features:                │
│  • messages      │            │  • AI Tutor chat          │
│  • summaries     │            │  • RAG grounded answers   │
│  • quiz_attempts │            │  • Summary generation     │
│                  │            │  • Quiz generation (JSON) │
└──────────────────┘            └──────────────────────────┘
```

---

## Request / Response Flow

### 1. Standard API Request
```
Browser → React Component
       → Axios (attaches JWT from localStorage)
       → Express Router
       → Auth Middleware (verifies JWT, attaches req.user)
       → Validator Middleware (express-validator)
       → Controller (business logic)
       → MongoDB (Mongoose)
       → JSON Response
       → React State Update → UI Re-render
```

### 2. PDF Upload & Processing Flow
```
User selects PDF
  → Multer middleware (validates mime-type + size)
  → documentController.uploadDocument()
  → Document saved to DB (status: 'processing')
  → HTTP 202 returned to client immediately
  → processPDF() runs asynchronously:
       ├── pdf-parse extracts raw text
       ├── textChunker splits into ~800-char chunks
       ├── OpenAI text-embedding-3-small generates embeddings
       ├── Chunks + embeddings saved to document_chunks
       └── Document status updated to 'ready' (or 'failed')
  → Client polls /api/documents/:id/status every 3s
  → UI shows 'Ready' badge when complete
```

### 3. RAG Question Answering Flow
```
User asks question about a document
  → ragController.askQuestion()
  → Ownership check: all documentIds belong to req.user
  → generateEmbedding(question) → 1536-dim vector
  → retrieveRelevantChunks():
       ├── Try: MongoDB Atlas $vectorSearch (if index configured)
       └── Fallback: cosine similarity in-memory
  → Top-5 chunks retrieved with scores
  → Context string built from chunks with source labels
  → generateRAGResponse(question, context, history)
  → OpenAI GPT-3.5 generates grounded answer
  → Answer + source references returned to client
  → Sources show document title + page number + snippet
```

### 4. Quiz Generation & Submission Flow
```
User requests quiz
  → quizController.generateQuizHandler()
  → Source text prepared (document chunks or topic string)
  → generateQuiz() calls GPT with JSON response_format
  → Questions parsed and validated (A/B/C/D structure)
  → QuizAttempt saved (status: 'pending')
  → Client receives questions WITHOUT correctAnswer
  
User submits answers
  → quizController.submitQuiz()
  → Server-side scoring ONLY (correctAnswer never sent before submission)
  → Scores calculated, isCorrect set per question
  → QuizAttempt updated (status: 'submitted', scorePercentage)
  → Full results with correctAnswer + explanations returned
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Security Layers                    │
│                                                     │
│  1. Transport    HTTPS (enforced by hosting)        │
│  2. Auth         JWT (7d expiry) + bcrypt (10 rds)  │
│  3. Ownership    userId check on every resource     │
│  4. Input        express-validator on all routes    │
│  5. File         mime-type + size validation        │
│  6. Rate Limit   general:100/15m auth:10/15m        │
│                  ai:20/min upload:5/10m             │
│  7. Secrets      Environment variables only         │
│  8. Errors       Safe messages (no stack in prod)   │
│  9. AI Safety    Anti-hallucination RAG prompt      │
│ 10. CORS         CLIENT_URL whitelist only          │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack Summary

| Layer             | Technology                          | Purpose                              |
|-------------------|-------------------------------------|--------------------------------------|
| Frontend          | React 18 + Vite                     | SPA with fast HMR dev experience     |
| Styling           | Tailwind CSS 3                      | Utility-first responsive design      |
| Routing           | React Router v6                     | Client-side routing with guards      |
| HTTP Client       | Axios                               | API calls with interceptors          |
| Backend           | Node.js + Express.js                | REST API server                      |
| Database          | MongoDB Atlas (Free)                | Document store + vector search       |
| ODM               | Mongoose                            | Schema validation + queries          |
| AI Model          | OpenAI GPT-3.5-turbo               | Chat, summaries, quiz generation     |
| Embeddings        | text-embedding-3-small (1536-dim)  | Semantic vector search for RAG       |
| Authentication    | JWT + bcryptjs                      | Stateless auth + password hashing    |
| File Upload       | Multer                              | PDF upload with validation           |
| PDF Parsing       | pdf-parse                           | Text extraction from PDFs            |
| Validation        | express-validator                   | Server-side input validation         |
| Rate Limiting     | express-rate-limit                  | Abuse and cost protection            |
| Frontend Deploy   | Vercel                              | Global CDN edge deployment           |
| Backend Deploy    | Render / Railway                    | Node.js hosting                      |

---

## Deployment Architecture

```
GitHub Repository
     │
     ├── /client  ──→  Vercel (auto-deploy on push)
     │                 URL: https://ai-study-pro.vercel.app
     │                 Env: VITE_API_URL=<backend-url>
     │
     └── /server  ──→  Render / Railway
                       URL: https://api.ai-study-pro.onrender.com
                       Env: MONGODB_URI, JWT_SECRET, OPENAI_API_KEY
                            CLIENT_URL, PORT, NODE_ENV
                       Health: GET /health
```
