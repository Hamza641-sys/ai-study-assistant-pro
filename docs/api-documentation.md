# API Documentation — AI Study Assistant Pro

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-backend.onrender.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `/api/auth/login` or `/api/auth/register` and expire after 7 days.

## Response Format

All responses follow this consistent structure:

```json
// Success
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Human-readable error description"
}
```

## HTTP Status Codes

| Code | Meaning                              |
|------|--------------------------------------|
| 200  | OK                                   |
| 201  | Created                              |
| 202  | Accepted (async processing started)  |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (missing/invalid token) |
| 403  | Forbidden (wrong role/ownership)     |
| 404  | Not Found                            |
| 409  | Conflict (e.g. email already exists) |
| 413  | Payload Too Large (file size)        |
| 429  | Too Many Requests (rate limited)     |
| 500  | Internal Server Error                |
| 502  | Bad Gateway (AI service unavailable) |

---

## Health Check

### `GET /health`
Check if the server is running. No authentication required.

**Response:**
```json
{
  "success": true,
  "message": "AI Study Assistant API is running",
  "environment": "production",
  "timestamp": "2026-10-16T10:00:00.000Z"
}
```

---

## Authentication Routes

### `POST /api/auth/register`
Register a new user account.

**Rate limit:** 10 requests / 15 minutes per IP

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure123"
}
```

**Validation:**
- `name`: 2–50 characters
- `email`: valid email format
- `password`: min 6 characters, must contain at least one number

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "64abc...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "student",
    "createdAt": "2026-10-16T10:00:00.000Z"
  }
}
```

---

### `POST /api/auth/login`
Login with email and password.

**Rate limit:** 10 requests / 15 minutes per IP

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "secure123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

### `GET /api/auth/me` 🔒
Get the authenticated user's profile.

**Response (200):**
```json
{
  "success": true,
  "user": { "_id": "...", "name": "Jane", "email": "...", "role": "student" }
}
```

---

### `PUT /api/auth/profile` 🔒
Update name and bio.

**Request body:**
```json
{
  "name": "Jane Smith",
  "bio": "Computer Science student"
}
```

---

### `PUT /api/auth/change-password` 🔒
Change user password.

**Request body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password1"
}
```

---

## Document Routes

### `GET /api/documents` 🔒
List all documents owned by the authenticated user.

**Query params:** `?page=1&limit=20`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Photosynthesis Notes",
      "originalName": "bio_notes.pdf",
      "fileSize": 1048576,
      "status": "ready",
      "pageCount": 12,
      "chunkCount": 45,
      "createdAt": "2026-10-16T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3, "pages": 1 }
}
```

---

### `POST /api/documents/upload` 🔒
Upload a PDF document.

**Rate limit:** 5 requests / 10 minutes per IP

**Content-Type:** `multipart/form-data`

**Form fields:**
- `file` (required): PDF file, max 10MB
- `title` (optional): Custom title (defaults to filename)

**Response (202):** Processing started asynchronously.
```json
{
  "success": true,
  "message": "File uploaded. Processing started.",
  "document": { "_id": "...", "status": "processing", ... }
}
```

**Possible errors:**
- 400: Not a PDF file
- 413: File exceeds 10MB limit

---

### `GET /api/documents/:id` 🔒
Get a single document. Returns 404 if not owned by the user.

---

### `GET /api/documents/:id/status` 🔒
Poll processing status. Use this to check when `status` changes to `ready` or `failed`.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "pageCount": 12,
    "chunkCount": 45,
    "wordCount": 3200,
    "processingError": null
  }
}
```

---

### `PUT /api/documents/:id` 🔒
Update document title. Owner only.

---

### `DELETE /api/documents/:id` 🔒
Delete document + all its chunks. Owner only. Irreversible.

---

## Conversation Routes (AI Tutor)

### `GET /api/conversations` 🔒
List all non-archived conversations.

---

### `POST /api/conversations` 🔒
Create a new conversation.

**Request body:**
```json
{
  "title": "Physics Questions",
  "mode": "general"
}
```

- `mode`: `"general"` (AI Tutor) or `"rag"` (document Q&A)
- `documentIds`: Array of document IDs (required for RAG mode)

---

### `GET /api/conversations/:id` 🔒
Get conversation with all messages.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": { ... },
    "messages": [
      { "_id": "...", "role": "user", "content": "What is...", "createdAt": "..." },
      { "_id": "...", "role": "assistant", "content": "...", "createdAt": "..." }
    ]
  }
}
```

---

### `POST /api/conversations/:id/messages` 🔒
Send a message and receive an AI response.

**Rate limit:** 20 requests / 1 minute per IP

**Request body:**
```json
{
  "content": "Explain Newton's Third Law with examples"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userMessage": { "role": "user", "content": "...", "createdAt": "..." },
    "aiMessage":   { "role": "assistant", "content": "...", "createdAt": "..." }
  }
}
```

---

### `DELETE /api/conversations/:id` 🔒
Delete conversation and all its messages.

---

## RAG Routes

### `POST /api/rag/ask` 🔒
Ask a question grounded in uploaded documents (RAG pipeline).

**Rate limit:** 20 requests / 1 minute per IP

**Request body:**
```json
{
  "question": "What are the main causes of the French Revolution?",
  "documentIds": ["64abc...", "64def..."],
  "conversationId": "64ghi..."
}
```

- All `documentIds` must be owned by the authenticated user and have `status: 'ready'`
- `conversationId` is optional — if provided, the Q&A is saved to that conversation

**Response (200):**
```json
{
  "success": true,
  "data": {
    "answer": "Based on the uploaded documents, the main causes were...",
    "sources": [
      {
        "documentId": "64abc...",
        "documentTitle": "French Revolution Notes",
        "chunkIndex": 5,
        "pageNumber": 3,
        "snippet": "The financial crisis of 1789...",
        "relevanceScore": 0.89
      }
    ],
    "question": "What are the main causes...",
    "documentsQueried": [{ "_id": "...", "title": "French Revolution Notes" }]
  }
}
```

---

## Summary Routes

### `GET /api/summaries` 🔒
List all summaries. Optional filters: `?summaryType=key_points&documentId=...`

---

### `POST /api/summaries/generate` 🔒
Generate an AI summary.

**Rate limit:** 20 requests / 1 minute per IP

**Request body (from document):**
```json
{
  "summaryType": "key_points",
  "documentId": "64abc..."
}
```

**Request body (from custom text):**
```json
{
  "summaryType": "revision",
  "customText": "Photosynthesis is the process by which plants...",
  "title": "My Summary"
}
```

**summaryType options:**
- `short` — 2-3 paragraph overview
- `detailed` — comprehensive coverage
- `key_points` — bullet point highlights
- `definitions` — important terms and definitions
- `revision` — exam-ready notes with headings
- `chapter_wise` — section-by-section breakdown

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Key Points — Photosynthesis Notes",
    "summaryType": "key_points",
    "content": "## Key Points\n\n- Light energy is converted...",
    "wordCount": 245,
    "createdAt": "..."
  }
}
```

---

### `GET /api/summaries/:id` 🔒
Get a single summary. Owner only.

---

### `DELETE /api/summaries/:id` 🔒
Delete a summary. Owner only.

---

## Quiz Routes

### `GET /api/quizzes` 🔒
List all quiz attempts. Optional filter: `?status=submitted`

---

### `POST /api/quizzes/generate` 🔒
Generate a new multiple-choice quiz.

**Rate limit:** 20 requests / 1 minute per IP

**Request body (topic-based):**
```json
{
  "sourceType": "topic",
  "topic": "Photosynthesis",
  "numQuestions": 5
}
```

**Request body (document-based):**
```json
{
  "sourceType": "document",
  "documentId": "64abc...",
  "numQuestions": 10
}
```

- `numQuestions`: 3–20 (default: 5)

**Response (201):** `correctAnswer` is intentionally omitted.
```json
{
  "success": true,
  "data": {
    "_id": "64quiz...",
    "title": "Quiz — Photosynthesis",
    "totalQuestions": 5,
    "status": "pending",
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "What is the primary product of photosynthesis?",
        "options": {
          "A": "Oxygen",
          "B": "Glucose",
          "C": "Carbon dioxide",
          "D": "Water"
        }
      }
    ]
  }
}
```

---

### `POST /api/quizzes/:id/submit` 🔒
Submit quiz answers. Scoring is performed server-side only.

**Request body:**
```json
{
  "answers": [
    { "questionNumber": 1, "answer": "B" },
    { "questionNumber": 2, "answer": "A" }
  ],
  "timeTaken": 120
}
```

**Response (200):** Full results with correct answers and explanations.
```json
{
  "success": true,
  "data": {
    "score": 4,
    "scorePercentage": 80,
    "passed": true,
    "timeTaken": 120,
    "questions": [
      {
        "questionNumber": 1,
        "questionText": "...",
        "options": { ... },
        "correctAnswer": "B",
        "userAnswer": "B",
        "isCorrect": true,
        "explanation": "Glucose is the primary organic product..."
      }
    ]
  }
}
```

---

### `GET /api/quizzes/:id` 🔒
Get a quiz attempt. If `status === 'pending'`, correct answers are hidden.

---

## Dashboard Routes

### `GET /api/dashboard/stats` 🔒
Get learning statistics for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalDocuments": 5,
      "readyDocuments": 4,
      "totalSummaries": 12,
      "totalQuizzes": 8,
      "submittedQuizzes": 6,
      "avgQuizScore": 73,
      "totalConversations": 10
    },
    "recentConversations": [ ... ],
    "recentDocuments": [ ... ],
    "recentSummaries": [ ... ],
    "recentQuizzes": [ ... ],
    "recentActivity": [
      {
        "type": "document",
        "title": "Bio Notes.pdf",
        "subtitle": "1.2 MB",
        "status": "ready",
        "date": "2026-10-16T09:00:00.000Z"
      }
    ]
  }
}
```

---

## Rate Limits Summary

| Route Group        | Limit                    |
|--------------------|--------------------------|
| All /api routes    | 100 requests / 15 minutes |
| Auth routes        | 10 requests / 15 minutes  |
| AI routes          | 20 requests / minute      |
| Upload route       | 5 requests / 10 minutes   |

Rate limit headers included in responses:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

---

## Error Examples

### Validation Error (400)
```json
{
  "success": false,
  "message": "Password must be at least 6 characters.",
  "errors": ["Password must be at least 6 characters.", "Password must contain at least one number."]
}
```

### Unauthorized (401)
```json
{ "success": false, "message": "Token has expired. Please log in again." }
```

### Forbidden / Not Found (403 / 404)
```json
{ "success": false, "message": "Document not found." }
```

### AI Service Unavailable (502)
```json
{ "success": false, "message": "AI service temporarily unavailable. Please try again." }
```
