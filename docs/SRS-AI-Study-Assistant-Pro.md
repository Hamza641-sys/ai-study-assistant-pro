# Software Requirements Specification (SRS)

## AI Study Assistant Pro

---

| Document Information | Details |
|---------------------|---------|
| **Document Title** | Software Requirements Specification |
| **Project Name** | AI Study Assistant Pro |
| **Version** | 1.0.0 |
| **Date** | October 2026 |
| **Status** | Final |
| **Document Type** | Full-Stack GenAI Capstone Project |

---

## Table of Contents

1. Introduction
2. Overall Description
3. Stakeholders and Users
4. Functional Requirements
5. Non-Functional Requirements
6. System Architecture
7. Database Design
8. API Specifications
9. User Interface Requirements
10. Security Requirements
11. AI and GenAI Requirements
12. Constraints and Assumptions
13. Acceptance Criteria
14. Glossary

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the complete functional and non-functional requirements for **AI Study Assistant Pro** — a full-stack Generative AI web application designed to assist students in learning more effectively through AI-powered tools.

This document is intended for:
- Development team members
- Academic evaluators and supervisors
- Project stakeholders
- Quality assurance engineers

### 1.2 Project Scope

AI Study Assistant Pro is a web-based platform that enables students to:
- Upload PDF study materials and ask AI-powered questions about their content
- Interact with an AI Tutor for subject explanations and guidance
- Generate intelligent summaries in multiple formats
- Create and attempt AI-generated quizzes with automatic scoring
- Track their learning progress through a personalized dashboard
- Use voice input and output for hands-free interaction

The system integrates Retrieval-Augmented Generation (RAG) technology to ground AI responses in the actual content of uploaded documents, minimizing hallucinations and ensuring factual accuracy.

### 1.3 Problem Statement

Students today face several challenges in their studies:

- **Information overload** — Lengthy PDFs and textbooks are time-consuming to read
- **Lack of personalized guidance** — Traditional study methods offer no adaptive support
- **Difficulty creating practice material** — Creating quizzes and summaries manually is tedious
- **No centralized study platform** — Students switch between multiple tools for different tasks

AI Study Assistant Pro addresses all these problems within a single, secure, AI-powered platform.

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|-----------|
| **AI** | Artificial Intelligence |
| **GenAI** | Generative Artificial Intelligence |
| **RAG** | Retrieval-Augmented Generation |
| **LLM** | Large Language Model |
| **JWT** | JSON Web Token |
| **API** | Application Programming Interface |
| **SRS** | Software Requirements Specification |
| **MCQ** | Multiple Choice Question |
| **PDF** | Portable Document Format |
| **CORS** | Cross-Origin Resource Sharing |
| **TTS** | Text-to-Speech |
| **STT** | Speech-to-Text |
| **UI/UX** | User Interface / User Experience |
| **REST** | Representational State Transfer |
| **CRUD** | Create, Read, Update, Delete |

### 1.5 References

- IEEE Standard 830-1998 — Software Requirements Specification
- OpenAI API Documentation
- Groq API Documentation
- MongoDB Atlas Documentation
- React.js Official Documentation
- Node.js / Express.js Documentation

---

## 2. Overall Description

### 2.1 Product Perspective

AI Study Assistant Pro is a standalone full-stack web application. It consists of three primary components:

```
┌─────────────────────────────────────────────────────┐
│              AI Study Assistant Pro                  │
│                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────┐ │
│  │   Frontend   │   │   Backend   │   │ AI Engine │ │
│  │ React + Vite │◄──│  Node.js +  │◄──│   Groq    │ │
│  │ Tailwind CSS │   │  Express.js │   │    API    │ │
│  └─────────────┘   └─────────────┘   └───────────┘ │
│                            │                        │
│                    ┌───────┴──────┐                 │
│                    │  MongoDB     │                 │
│                    │  Atlas       │                 │
│                    └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

### 2.2 Product Functions

The system provides six core functional modules:

| Module | Description |
|--------|-------------|
| User Authentication | Secure registration, login, and profile management |
| AI Tutor | Conversational AI chat with context memory and voice support |
| Document Manager | PDF upload, text extraction, and document management |
| RAG Q&A | Document-grounded question answering with source references |
| Notes Summarizer | AI-generated summaries in six different formats |
| Quiz Generator | AI-generated MCQ quizzes with scoring and history |
| Dashboard | Learning statistics and activity tracking |

### 2.3 User Classes

| User Class | Description | Access Level |
|-----------|-------------|--------------|
| Student | Primary user — uploads documents, uses AI tools | Full access to own data |
| Teacher | Creates study material, generates quizzes | Same as student |
| Self-Learner | Independent study without institutional enrollment | Same as student |
| Administrator | System management | Extended system access |

### 2.4 Operating Environment

**Client Side:**
- Modern web browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Internet connection
- Microphone access (optional — for voice features)

**Server Side:**
- Node.js v18+
- MongoDB Atlas (Free Tier)
- 512 MB RAM minimum

**Development Environment:**
- Windows / macOS / Linux
- VS Code or any code editor
- Git version control

---

## 3. Stakeholders and Users

### 3.1 Primary Stakeholders

| Stakeholder | Role | Interest |
|------------|------|----------|
| Students | End users | Effective AI-powered learning tools |
| Teachers | Content creators | Easy quiz and material generation |
| Academic Institution | Project commissioner | Capstone project evaluation |
| Project Supervisor | Evaluator | Technical quality and completeness |

### 3.2 User Stories

#### Student User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-01 | Student | Register an account | I can access personalized study tools |
| US-02 | Student | Upload a PDF | I can ask AI questions about my study material |
| US-03 | Student | Ask the AI Tutor questions | I can understand difficult concepts |
| US-04 | Student | Generate a summary | I can review content efficiently |
| US-05 | Student | Take a quiz | I can test my understanding |
| US-06 | Student | Use voice input | I can ask questions hands-free |
| US-07 | Student | Hear AI responses | I can listen while multitasking |
| US-08 | Student | View my dashboard | I can track my learning progress |
| US-09 | Student | Delete my documents | I can manage my private data |
| US-10 | Student | Change my password | I can keep my account secure |

---

## 4. Functional Requirements

### 4.1 Module 1 — User Authentication

#### FR-AUTH-01: User Registration
- **Description:** New users can create an account with name, email, and password
- **Input:** name (2-50 chars), email (valid format), password (min 6 chars, must contain a number)
- **Output:** JWT token + user profile object
- **Validation:** Email uniqueness check, password strength validation
- **Security:** Password hashed with bcrypt (10 salt rounds), never stored in plaintext

#### FR-AUTH-02: User Login
- **Description:** Registered users can authenticate with email and password
- **Input:** email, password
- **Output:** JWT token (7-day expiry) + user profile
- **Error Handling:** Generic "Invalid email or password" message (no data leak)

#### FR-AUTH-03: Session Management
- **Description:** JWT token stored in localStorage, attached to all API requests
- **Expiry:** 7 days — user redirected to login on expiry
- **Auto-logout:** On 401 response from any API endpoint

#### FR-AUTH-04: Profile Management
- **Description:** Users can update their name and bio
- **Restrictions:** Email cannot be changed after registration

#### FR-AUTH-05: Password Change
- **Description:** Users can change their password by providing current and new password
- **Validation:** Current password verified before update, new password meets strength requirements

#### FR-AUTH-06: Protected Routes
- **Description:** All pages except Landing, Login, and Register require authentication
- **Behavior:** Unauthenticated users redirected to /login

---

### 4.2 Module 2 — AI Tutor

#### FR-TUTOR-01: Create Conversation
- **Description:** User can start a new AI chat conversation
- **Auto-title:** Conversation title auto-generated from first message

#### FR-TUTOR-02: Send Message
- **Description:** User sends a text message and receives AI response
- **AI Model:** Groq API (GPT-OSS-20B model)
- **Context:** Last 10 messages included for conversation continuity
- **Response Format:** Markdown-rendered response

#### FR-TUTOR-03: Conversation History
- **Description:** All conversations saved to database with timestamps
- **Access:** User can view and continue any previous conversation

#### FR-TUTOR-04: Delete Conversation
- **Description:** User can delete any of their conversations and all associated messages

#### FR-TUTOR-05: Voice Input (Speech-to-Text)
- **Description:** User can record audio via microphone; transcribed to text using Groq Whisper API
- **Supported Formats:** WebM, MP4, WAV, OGG
- **Max Size:** 25MB per recording

#### FR-TUTOR-06: Voice Output (Text-to-Speech)
- **Description:** AI responses can be read aloud using browser's built-in SpeechSynthesis API
- **Controls:** Manual "Read aloud" button per message + "Auto-speak" toggle for automatic reading

---

### 4.3 Module 3 — PDF Document Management

#### FR-DOC-01: PDF Upload
- **Description:** User uploads a PDF file via drag-and-drop or file browser
- **Validation:** File type validated by MIME type (not just extension), max 10MB
- **Processing:** Asynchronous — user gets immediate response, processing happens in background

#### FR-DOC-02: Document Processing Pipeline
1. Extract text using pdf-parse library
2. Validate extracted text (min 50 characters)
3. Split text into ~800 character chunks with 100 character overlap
4. Generate embeddings for each chunk (TF-IDF hash-based, local)
5. Save chunks with metadata to MongoDB
6. Update document status to "ready"

#### FR-DOC-03: Processing Status
- **States:** uploading → processing → ready / failed
- **Client Polling:** Frontend polls status every 3 seconds for processing documents
- **Error Handling:** Failed documents display error message; do not show as ready

#### FR-DOC-04: Document List
- **Description:** User can view all their uploaded documents with metadata
- **Info Displayed:** Title, filename, file size, page count, chunk count, status, upload date

#### FR-DOC-05: Document Deletion
- **Description:** User can delete their document
- **Cascade:** Deletes file from disk + all associated chunks from database
- **Ownership:** Only document owner can delete it

#### FR-DOC-06: Document Search
- **Description:** Client-side search/filter on document title and filename

---

### 4.4 Module 4 — RAG Document Q&A

#### FR-RAG-01: Ask Question
- **Description:** User asks a question about one or more uploaded documents
- **Ownership Check:** All specified document IDs verified to belong to authenticated user
- **Process:**
  1. Generate embedding for the question
  2. Retrieve top-5 most relevant chunks using cosine similarity
  3. Build context string from retrieved chunks
  4. Send question + context to Groq AI
  5. Return answer with source references

#### FR-RAG-02: Source References
- **Description:** AI response includes references to source documents
- **Info:** Document title, page number (estimated), relevance score, text snippet

#### FR-RAG-03: No-Context Handling
- **Description:** If no relevant chunks found, return clear message: "The uploaded documents don't contain enough information to answer this question"

#### FR-RAG-04: Conversation Integration
- **Description:** RAG Q&A can be linked to a conversation for history tracking

---

### 4.5 Module 5 — AI Notes Summarizer

#### FR-SUM-01: Generate Summary
- **Description:** Generate AI summary from document or custom text input
- **Summary Types:**

| Type | Description |
|------|-------------|
| Short Summary | 2-3 concise paragraphs |
| Detailed Summary | Comprehensive coverage of all points |
| Key Points | Bullet-point highlights |
| Important Definitions | Terms and definitions formatted list |
| Revision Notes | Exam-ready notes with headings |
| Chapter-wise | Section-by-section breakdown |

#### FR-SUM-02: Source Types
- **Document-based:** Summarizes entire document from stored chunks
- **Custom Text:** User pastes text directly (50 - 20,000 characters)

#### FR-SUM-03: Save Summary
- **Description:** Generated summaries automatically saved to user's account

#### FR-SUM-04: View Summaries
- **Description:** User can view list of all saved summaries with type and date

#### FR-SUM-05: Delete Summary
- **Description:** User can delete any of their summaries

---

### 4.6 Module 6 — AI Quiz Generator

#### FR-QUIZ-01: Generate Quiz
- **Description:** Generate multiple-choice quiz from topic or document
- **Source Types:** Topic-based (free text) or Document-based (from uploaded PDF)
- **Question Count:** 3 to 15 questions (configurable)
- **Format:** 4 options (A, B, C, D) per question with one correct answer

#### FR-QUIZ-02: Security — Answer Protection
- **Description:** Correct answers NOT sent to client before submission
- **Implementation:** Server stores correctAnswer; client only receives questionText and options

#### FR-QUIZ-03: Submit Answers
- **Description:** User submits answers; scoring performed server-side only
- **Input:** Array of {questionNumber, answer} objects + optional timeTaken
- **Output:** Full results with correct answers, explanations, score, pass/fail

#### FR-QUIZ-04: Scoring
- **Algorithm:** Server-side comparison of submitted answers vs stored correctAnswer
- **Pass Threshold:** 60% or above
- **Score Display:** Number correct / total + percentage

#### FR-QUIZ-05: Quiz History
- **Description:** All submitted quiz attempts saved with scores
- **Display:** Title, source type, score, date, time taken

---

### 4.7 Module 7 — Dashboard

#### FR-DASH-01: Statistics
- **Description:** Display user-specific learning statistics from actual database data
- **Metrics:**
  - Total documents uploaded
  - Total summaries created
  - Total quizzes taken
  - Average quiz score (submitted quizzes only)

#### FR-DASH-02: Recent Activity Feed
- **Description:** Combined timeline of recent documents, summaries, and quizzes
- **Sorted:** By date descending, max 10 items

#### FR-DASH-03: Quick Actions
- **Description:** One-click navigation to start a new chat, upload document, generate summary, or take quiz

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| Requirement | Target |
|------------|--------|
| API response time (general) | < 500ms |
| AI response time | < 10 seconds |
| PDF processing time (per page) | < 5 seconds |
| Frontend initial load | < 3 seconds |
| Database query response | < 200ms |

### 5.2 Scalability Requirements
- System must handle at least 100 concurrent users on free tier infrastructure
- MongoDB Atlas free tier supports up to 512MB storage
- Rate limiting prevents system overload

### 5.3 Availability Requirements
- System should maintain 99% uptime during production operation
- Graceful error handling — no unhandled crashes exposed to users
- Health check endpoint at `/health` for monitoring

### 5.4 Usability Requirements
- Responsive design — fully functional on mobile (320px), tablet (768px), and desktop (1280px+)
- Dark theme interface optimized for long study sessions
- Clear loading states, empty states, and error messages throughout
- Accessibility: proper ARIA labels, keyboard navigation, sufficient color contrast

### 5.5 Reliability Requirements
- All database writes confirmed before response returned to client
- PDF processing failures gracefully handled — document marked as "failed" with error message
- AI API failures handled gracefully — user shown friendly error, no system crash
- JWT expiry handled automatically — user redirected to login

### 5.6 Maintainability Requirements
- Modular architecture: controllers, services, models, routes clearly separated
- Environment-based configuration — no hardcoded secrets
- Consistent code style and documentation comments
- Git version control with meaningful commit messages

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│              React + Vite + Tailwind CSS                    │
│    Pages: Landing, Auth, Dashboard, Tutor, Docs,            │
│           Summary, Quiz, Profile                            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / REST API
                        │ Authorization: Bearer <JWT>
┌───────────────────────▼─────────────────────────────────────┐
│                  Node.js + Express Backend                   │
│                                                             │
│  Middleware: JWT Auth, Rate Limiter, Validator, Multer      │
│  Controllers: Auth, Document, Conversation, RAG,            │
│               Summary, Quiz, Dashboard, Voice               │
│  Services: OpenAI/Groq, RAG, PDF Processor, Text Chunker   │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
┌──────────────▼──────┐    ┌──────────▼──────────────────────┐
│   MongoDB Atlas     │    │        Groq API                  │
│                     │    │                                  │
│  Collections:       │    │  Models:                         │
│  • users            │    │  • GPT-OSS-20B (chat)            │
│  • documents        │    │  • Whisper (speech-to-text)      │
│  • document_chunks  │    │                                  │
│  • conversations    │    │  Features:                       │
│  • messages         │    │  • AI Tutor responses            │
│  • summaries        │    │  • RAG answer generation         │
│  • quiz_attempts    │    │  • Summary generation            │
└─────────────────────┘    │  • Quiz generation               │
                           │  • Voice transcription           │
                           └──────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | React.js | 18.2 | UI components and state |
| Build Tool | Vite | 5.0 | Fast development server and bundler |
| CSS Framework | Tailwind CSS | 3.3 | Utility-first responsive styling |
| Routing | React Router | 6.20 | Client-side navigation |
| HTTP Client | Axios | 1.6 | API calls with interceptors |
| Markdown | react-markdown | 9.0 | Render AI markdown responses |
| Icons | Lucide React | 0.294 | UI icon library |
| Notifications | react-hot-toast | 2.4 | Toast notifications |
| Backend | Node.js + Express | 18 + 4.18 | REST API server |
| Database | MongoDB Atlas | 7.0 | Document database |
| ODM | Mongoose | 8.0 | MongoDB object modeling |
| Authentication | JWT + bcryptjs | 9.0 + 2.4 | Token auth + password hashing |
| AI (Chat/Quiz/Summary) | Groq API | - | Free LLM inference |
| AI (Voice STT) | Groq Whisper | - | Speech to text |
| AI (Voice TTS) | Browser SpeechSynthesis | - | Text to speech |
| File Upload | Multer | 1.4 | Multipart form handling |
| PDF Parsing | pdf-parse | 1.1 | Text extraction from PDFs |
| Validation | express-validator | 7.0 | Server-side input validation |
| Rate Limiting | express-rate-limit | 7.1 | API abuse protection |

---

## 7. Database Design

### 7.1 Collections Overview

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| users | User accounts and profiles | email (unique), password (hashed) |
| documents | PDF metadata and status | userId, status, filePath |
| document_chunks | Text chunks for RAG | documentId, text, embedding |
| conversations | Chat sessions | userId, mode, messageCount |
| messages | Individual chat messages | conversationId, role, content, sources |
| summaries | Generated summaries | userId, summaryType, content |
| quiz_attempts | Quiz questions and results | userId, questions, score |

### 7.2 Key Schema Decisions

**Password Storage:**
```
NEVER store plaintext passwords
Store: bcrypt hash with 10 salt rounds
Field: password (select: false — excluded from queries by default)
```

**Quiz Security:**
```
correctAnswer field stored server-side
NOT returned to client before submission
Only revealed in response to POST /quizzes/:id/submit
```

**Document Chunks — Embeddings:**
```
Dimensions: 1536 (compatible with Atlas Vector Search)
Algorithm: TF-IDF hash-based (local, no API cost)
Similarity: Cosine similarity for retrieval
```

**User Data Isolation:**
```
Every document, conversation, summary, and quiz
has userId field
Every query filters by req.user.id
A user cannot access another user's data
```

---

## 8. API Specifications

### 8.1 Base URL
```
Development: http://localhost:5000/api
Production:  https://your-backend.railway.app/api
```

### 8.2 Authentication Header
```
Authorization: Bearer <jwt_token>
```

### 8.3 Standard Response Format
```json
// Success
{ "success": true, "data": {}, "message": "optional" }

// Error
{ "success": false, "message": "Human-readable error" }
```

### 8.4 Endpoints Summary

#### Authentication
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | /auth/register | ❌ | Register new user |
| POST | /auth/login | ❌ | Login user |
| GET | /auth/me | ✅ | Get current user |
| PUT | /auth/profile | ✅ | Update profile |
| PUT | /auth/change-password | ✅ | Change password |

#### Documents
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | /documents/upload | ✅ | Upload PDF |
| GET | /documents | ✅ | List user documents |
| GET | /documents/:id | ✅ | Get single document |
| GET | /documents/:id/status | ✅ | Get processing status |
| PUT | /documents/:id | ✅ | Update document title |
| DELETE | /documents/:id | ✅ | Delete document |

#### AI Tutor
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | /conversations | ✅ | Create conversation |
| GET | /conversations | ✅ | List conversations |
| GET | /conversations/:id | ✅ | Get conversation + messages |
| POST | /conversations/:id/messages | ✅ | Send message |
| DELETE | /conversations/:id | ✅ | Delete conversation |

#### RAG, Summaries, Quizzes
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | /rag/ask | ✅ | Ask document question |
| POST | /summaries/generate | ✅ | Generate summary |
| GET | /summaries | ✅ | List summaries |
| DELETE | /summaries/:id | ✅ | Delete summary |
| POST | /quizzes/generate | ✅ | Generate quiz |
| POST | /quizzes/:id/submit | ✅ | Submit answers |
| GET | /quizzes | ✅ | Quiz history |

#### Other
| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| GET | /dashboard/stats | ✅ | Get statistics |
| POST | /voice/transcribe | ✅ | Transcribe audio |
| GET | /health | ❌ | Health check |

### 8.5 Rate Limits

| Route Group | Limit | Window |
|------------|-------|--------|
| All /api | 100 requests | 15 minutes |
| Auth routes | 10 requests | 15 minutes |
| AI routes | 20 requests | 1 minute |
| Upload route | 5 requests | 10 minutes |

---

## 9. User Interface Requirements

### 9.1 Design System

| Element | Specification |
|---------|--------------|
| Color Scheme | Dark theme — gray-950 background, primary-600 (#4f46e5) accent |
| Typography | Inter font family, 14-16px base size |
| Border Radius | Rounded corners (8-16px) for cards and buttons |
| Spacing | 4px grid system |
| Shadows | Subtle shadows for modals and elevated components |

### 9.2 Page Requirements

#### Landing Page
- Professional hero section with mock AI chat demonstration
- 6-feature highlight grid with icons
- 4-step "How it works" section
- Call-to-action buttons (Sign Up, Sign In)
- Responsive navigation and footer

#### Dashboard
- 4 stat cards (documents, summaries, quizzes, avg score)
- Recent activity feed with type icons
- Quick action shortcuts
- Recent conversations panel

#### AI Tutor
- Two-column layout: conversation list sidebar + chat area
- Real-time typing indicator (animated dots)
- Markdown rendering for AI responses
- Optimistic message updates (show user message immediately)
- Mic button for voice input with recording indicator
- "Read aloud" button on each AI response
- Auto-speak toggle in sidebar

#### Document Manager
- Drag-and-drop upload zone with visual feedback
- Status badges with color coding (processing=yellow, ready=green, failed=red)
- Real-time status polling every 3 seconds
- Search/filter bar
- Delete confirmation modal

#### Notes Summarizer
- 6-type selector grid with descriptions
- Document vs Custom Text source toggle
- Saved summaries list with modal viewer (markdown rendered)

#### Quiz Generator
- Topic/Document source tabs
- Question count slider (3-15)
- Active quiz with progress bar
- Option selection with visual feedback
- Results screen with score, pass/fail badge, review answers with explanations
- Quiz history tab

#### Profile
- Avatar with initials
- Edit profile form (name, bio)
- Change password form with show/hide toggle
- Security information checklist

### 9.3 Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|---------|
| Mobile | < 768px | Sidebar hidden, hamburger menu, stacked layouts |
| Tablet | 768px - 1024px | Partial sidebar, adapted grids |
| Desktop | > 1024px | Full sidebar, multi-column layouts |

### 9.4 Accessibility Requirements
- All interactive elements have ARIA labels
- Color contrast ratio minimum 4.5:1 for normal text
- Keyboard navigation support for all forms
- Screen reader compatible HTML structure
- Loading states announced for screen readers

---

## 10. Security Requirements

### 10.1 Authentication Security

| Requirement | Implementation |
|------------|---------------|
| Password hashing | bcrypt with 10 salt rounds |
| Token type | JWT (JSON Web Token) |
| Token expiry | 7 days |
| Token storage | localStorage (client-side) |
| Invalid token handling | 401 response → auto logout |

### 10.2 Authorization Security

| Requirement | Implementation |
|------------|---------------|
| Protected routes | JWT middleware on all private endpoints |
| Resource ownership | userId check on every database query |
| Cross-user access | Impossible — queries always filter by req.user.id |
| Role-based access | Role field on user model (student/teacher/admin) |

### 10.3 Input Security

| Requirement | Implementation |
|------------|---------------|
| Input validation | express-validator on all routes |
| File type validation | MIME type check (not just extension) |
| File size limit | 10MB max for PDFs, 25MB for audio |
| XSS prevention | Input sanitization via validators |
| SQL/NoSQL injection | Mongoose parameterized queries |

### 10.4 API Security

| Requirement | Implementation |
|------------|---------------|
| Rate limiting | 4 tiers: general, auth, AI, upload |
| CORS | Whitelist of allowed origins only |
| API key protection | GROQ_API_KEY in server .env only |
| Error messages | Generic messages in production (no stack traces) |
| Prompt injection | RAG system prompt prevents instruction following |

### 10.5 Data Security

| Requirement | Implementation |
|------------|---------------|
| Secrets management | Environment variables (.env file) |
| .env in .gitignore | Never committed to version control |
| Database credentials | MongoDB Atlas connection string in .env |
| Password reset | Current password required before change |

---

## 11. AI and GenAI Requirements

### 11.1 AI Model Requirements

| Feature | Model | Provider | Cost |
|---------|-------|---------|------|
| AI Tutor Chat | GPT-OSS-20B | Groq | Free |
| Quiz Generation | GPT-OSS-20B | Groq | Free |
| Note Summarization | GPT-OSS-20B | Groq | Free |
| RAG Answer Generation | GPT-OSS-20B | Groq | Free |
| Speech-to-Text | Whisper Large V3 Turbo | Groq | Free |
| Text-to-Speech | SpeechSynthesis | Browser | Free |
| Document Embeddings | TF-IDF Hash | Local | Free |

### 11.2 RAG Pipeline Requirements

The Retrieval-Augmented Generation pipeline must:

1. **Extract** text from PDF with pdf-parse library
2. **Chunk** text into ~800 character segments with 100 character overlap
3. **Preserve** page number metadata per chunk
4. **Generate** 1536-dimensional embedding vectors per chunk
5. **Store** chunks with embeddings in MongoDB
6. **Retrieve** top-5 most relevant chunks using cosine similarity
7. **Filter** retrieved chunks by user ownership
8. **Ground** AI response strictly in retrieved context
9. **Reference** source documents with page numbers in response
10. **Acknowledge** when document content cannot support the answer

### 11.3 AI Response Quality Requirements

| Requirement | Description |
|------------|-------------|
| Factual grounding | RAG responses must reference actual document content |
| Hallucination prevention | System prompt explicitly prohibits invented information |
| Source attribution | Every RAG response includes document title and page reference |
| Uncertainty acknowledgment | AI must say "I don't know" rather than guess |
| Educational tone | AI Tutor maintains encouraging, patient teaching style |

### 11.4 Quiz Generation Requirements

| Requirement | Specification |
|------------|--------------|
| Format | JSON array of question objects |
| Options | Exactly 4 (A, B, C, D) per question |
| Correct answers | Exactly 1 per question |
| Distractors | Plausible but clearly incorrect options |
| Explanations | Brief explanation for each correct answer |
| Security | correctAnswer never sent before submission |

---

## 12. Constraints and Assumptions

### 12.1 Technical Constraints

| Constraint | Description |
|-----------|-------------|
| Free tier limits | MongoDB Atlas: 512MB storage limit |
| Groq rate limits | Free tier has request-per-minute limits |
| File storage | PDF files stored on server filesystem |
| Embedding quality | Local TF-IDF embeddings less accurate than neural embeddings |
| Scanned PDFs | Scanned image PDFs cannot be processed (OCR not implemented) |
| Audio format | Voice recording support depends on browser compatibility |

### 12.2 Business Constraints

| Constraint | Description |
|-----------|-------------|
| Budget | Zero cost — all free-tier services |
| Timeline | Single academic semester |
| Team size | Individual capstone project |

### 12.3 Assumptions

1. Users have a stable internet connection
2. Uploaded PDFs contain extractable text (not purely scanned images)
3. Users allow microphone access for voice features
4. Modern browsers (Chrome, Edge, Firefox) are used
5. Groq API free tier remains available and functional
6. MongoDB Atlas free tier is sufficient for development and demonstration

---

## 13. Acceptance Criteria

### 13.1 Module-wise Acceptance Criteria

#### Authentication (Must Pass All)
- [x] User can register with valid credentials
- [x] Duplicate email registration rejected with 409 error
- [x] User can login with correct credentials
- [x] Login fails with incorrect password (generic error shown)
- [x] Expired JWT token returns 401 and redirects to login
- [x] User A cannot access User B's data by changing IDs in requests
- [x] Password stored as bcrypt hash (never plaintext)

#### AI Tutor (Must Pass All)
- [x] User can create new conversation
- [x] User can send message and receive AI response
- [x] Conversation history maintained across messages
- [x] Previous conversations accessible and continuable
- [x] OpenAI/Groq API key never exposed in frontend code
- [x] AI error handled gracefully with user-friendly message

#### Document Management (Must Pass All)
- [x] Valid PDF uploads successfully
- [x] Non-PDF file rejected with 400 error
- [x] File larger than 10MB rejected with 413 error
- [x] Document processing status polled correctly
- [x] Failed documents show error message (not marked as ready)
- [x] User can only delete their own documents
- [x] Deleted document chunks also removed from database

#### RAG Q&A (Must Pass All)
- [x] Questions answered using content from uploaded documents
- [x] Source references show actual document name and page
- [x] System acknowledges when document lacks relevant content
- [x] User cannot query another user's documents
- [x] Empty document query handled gracefully

#### Quiz (Must Pass All)
- [x] Quiz generated with 4 options per question
- [x] correctAnswer not returned before submission
- [x] Scoring performed server-side only
- [x] Score calculated correctly
- [x] Explanations shown after submission
- [x] Quiz history maintained

#### Dashboard (Must Pass All)
- [x] Statistics reflect actual database records
- [x] Statistics scoped to authenticated user only
- [x] Empty state shown when no activity exists

### 13.2 Non-Functional Acceptance Criteria
- [x] API response under 500ms for non-AI endpoints
- [x] Application renders correctly on mobile (320px width)
- [x] Application renders correctly on desktop (1280px width)
- [x] Rate limiting active on auth and AI routes
- [x] .env file not committed to GitHub repository
- [x] Health check endpoint returns 200 OK

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Retrieval-Augmented Generation (RAG)** | An AI technique that retrieves relevant information from a knowledge base and uses it as context for generating responses, reducing hallucinations |
| **Embedding** | A numerical vector representation of text that captures semantic meaning, allowing similarity comparison |
| **Cosine Similarity** | A mathematical measure of similarity between two vectors, used to find relevant document chunks |
| **Text Chunking** | The process of splitting large documents into smaller, overlapping segments for processing |
| **JWT (JSON Web Token)** | A compact, self-contained token used for authentication and information exchange |
| **bcrypt** | A password hashing algorithm designed to be computationally expensive to prevent brute-force attacks |
| **Hallucination** | When an AI model generates plausible-sounding but factually incorrect information |
| **LLM** | Large Language Model — an AI model trained on large amounts of text data |
| **Middleware** | Functions that execute during the request-response cycle in Express.js |
| **CORS** | Cross-Origin Resource Sharing — a mechanism to allow or deny cross-origin HTTP requests |
| **Semantic Search** | Search that understands the meaning of a query rather than matching exact keywords |
| **TF-IDF** | Term Frequency-Inverse Document Frequency — a statistical method to measure word importance |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | October 2026 | Muhammad Hamza | Initial complete SRS document |

---

*This document was prepared as part of the Full-Stack GenAI Capstone Project requirement.*

*AI Study Assistant Pro — Built with React, Node.js, MongoDB Atlas, and Groq API*
