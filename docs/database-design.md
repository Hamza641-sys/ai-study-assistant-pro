# Database Design — AI Study Assistant Pro

## Overview

MongoDB Atlas (Free Tier) is used as the primary database. All data is stored as documents in collections. Relationships are implemented using ObjectId references. User ownership is enforced at the application layer on every query.

**Database name:** `ai-study-assistant`

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌───────────────────┐
│    users    │ 1     * │    documents      │ 1     * │  document_chunks  │
│─────────────│─────────│──────────────────│─────────│───────────────────│
│ _id (PK)    │         │ _id (PK)         │         │ _id (PK)          │
│ name        │         │ userId (FK)      │         │ documentId (FK)   │
│ email       │         │ title            │         │ userId (FK)       │
│ password    │         │ originalName     │         │ chunkIndex        │
│ role        │         │ filePath         │         │ text              │
│ bio         │         │ fileSize         │         │ embedding[]       │
│ isActive    │         │ mimeType         │         │ metadata.page     │
│ lastLogin   │         │ pageCount        │         │ metadata.startChar│
│ createdAt   │         │ status           │         │ metadata.endChar  │
│ updatedAt   │         │ processingError  │         │ createdAt         │
└─────────────┘         │ chunkCount       │         └───────────────────┘
       │                │ wordCount        │
       │                │ description      │
       │                │ createdAt        │
       │                └──────────────────┘
       │
       │        ┌──────────────────┐         ┌──────────────────┐
       │ 1    * │  conversations   │ 1     * │    messages      │
       │────────│──────────────────│─────────│──────────────────│
       │        │ _id (PK)         │         │ _id (PK)         │
       │        │ userId (FK)      │         │ conversationId   │
       │        │ title            │         │ userId (FK)      │
       │        │ mode             │         │ role             │
       │        │ attachedDocs[]   │         │ content          │
       │        │ messageCount     │         │ sources[]        │
       │        │ lastMessageAt    │         │ tokenUsage       │
       │        │ isArchived       │         │ error            │
       │        │ createdAt        │         │ createdAt        │
       │        └──────────────────┘         └──────────────────┘
       │
       │        ┌──────────────────┐         ┌──────────────────┐
       └──────* │    summaries     │         │  quiz_attempts   │ *──┘
                │──────────────────│         │──────────────────│
                │ _id (PK)         │         │ _id (PK)         │
                │ userId (FK)      │         │ userId (FK)      │
                │ documentId (FK)  │         │ documentId (FK)  │
                │ title            │         │ title            │
                │ summaryType      │         │ topic            │
                │ content          │         │ sourceType       │
                │ sourceType       │         │ questions[]      │
                │ inputText        │         │ totalQuestions   │
                │ wordCount        │         │ status           │
                │ createdAt        │         │ score            │
                └──────────────────┘         │ scorePercentage  │
                                             │ submittedAt      │
                                             │ timeTaken        │
                                             └──────────────────┘
```

---

## Collection Schemas

### 1. `users`

```javascript
{
  _id:       ObjectId,          // Auto-generated primary key
  name:      String,            // Required, 2-50 chars
  email:     String,            // Required, unique, lowercase
  password:  String,            // Required, bcrypt hash (10 rounds), select:false
  role:      String,            // Enum: ['student','teacher','admin'], default:'student'
  bio:       String,            // Optional, max 200 chars
  isActive:  Boolean,           // Default: true
  lastLogin: Date,              // Updated on every login
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  { email: 1 }           // unique
  { createdAt: -1 }
```

**Security note:** `password` field has `select: false` — never returned in queries unless explicitly selected.

---

### 2. `documents`

```javascript
{
  _id:             ObjectId,
  userId:          ObjectId,    // ref: users — owner of the document
  title:           String,      // Required, max 200 chars
  originalName:    String,      // Original filename from upload
  filePath:        String,      // Server filesystem path — NEVER sent to client
  fileSize:        Number,      // Bytes
  mimeType:        String,      // 'application/pdf'
  pageCount:       Number,      // Set after processing
  status:          String,      // Enum: ['uploading','processing','ready','failed']
  processingError: String,      // Error message if status === 'failed'
  chunkCount:      Number,      // Number of text chunks created
  wordCount:       Number,      // Approximate word count
  description:     String,      // AI-generated description (optional)
  createdAt:       Date,
  updatedAt:       Date
}

Indexes:
  { userId: 1, createdAt: -1 }
  { userId: 1, status: 1 }
  { title: 'text', originalName: 'text' }   // Text search
```

---

### 3. `document_chunks`

This is the core RAG collection. Each document is split into overlapping text chunks, each with a 1536-dimensional embedding vector for semantic search.

```javascript
{
  _id:        ObjectId,
  documentId: ObjectId,         // ref: documents
  userId:     ObjectId,         // ref: users — denormalized for access control
  chunkIndex: Number,           // Order of chunk in document (0-based)
  text:       String,           // ~800 characters of extracted text
  embedding:  [Number],         // 1536-dimensional float array (text-embedding-3-small)
  metadata: {
    pageNumber: Number,         // Estimated page number
    startChar:  Number,         // Character offset in original text
    endChar:    Number,
    tokenCount: Number          // Approximate token count
  },
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  { documentId: 1, chunkIndex: 1 }
  { userId: 1, documentId: 1 }

Atlas Vector Search Index (create manually in Atlas UI):
  Index name: "vector_index"
  Field:      "embedding"
  Dimensions: 1536
  Similarity: "cosine"
```

---

### 4. `conversations`

```javascript
{
  _id:               ObjectId,
  userId:            ObjectId,  // ref: users
  title:             String,    // Auto-generated from first message, max 200 chars
  mode:              String,    // Enum: ['general','rag'] — general=AI Tutor, rag=document Q&A
  attachedDocuments: [ObjectId], // ref: documents (for RAG mode)
  messageCount:      Number,    // Denormalized counter
  lastMessageAt:     Date,
  isArchived:        Boolean,   // Default: false
  createdAt:         Date,
  updatedAt:         Date
}

Indexes:
  { userId: 1, updatedAt: -1 }
  { userId: 1, isArchived: 1 }
```

---

### 5. `messages`

```javascript
{
  _id:            ObjectId,
  conversationId: ObjectId,     // ref: conversations
  userId:         ObjectId,     // ref: users
  role:           String,       // Enum: ['user','assistant','system']
  content:        String,       // Message text (markdown for assistant)
  sources: [{                   // For RAG responses only
    documentId:    ObjectId,
    documentTitle: String,
    chunkIndex:    Number,
    pageNumber:    Number,
    relevanceScore:Number,
    snippet:       String       // First 200 chars of chunk
  }],
  tokenUsage: {
    promptTokens:     Number,
    completionTokens: Number,
    totalTokens:      Number
  },
  error:     String,            // Error message if AI failed
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  { conversationId: 1, createdAt: 1 }
  { userId: 1, createdAt: -1 }
```

---

### 6. `summaries`

```javascript
{
  _id:         ObjectId,
  userId:      ObjectId,        // ref: users
  documentId:  ObjectId,        // ref: documents — null if from custom text
  title:       String,          // Required, max 200 chars
  summaryType: String,          // Enum: ['short','detailed','key_points',
                                //        'definitions','revision','chapter_wise']
  content:     String,          // Generated summary in markdown
  sourceType:  String,          // Enum: ['document','custom_text','topic']
  inputText:   String,          // First 500 chars of custom input (for reference)
  wordCount:   Number,          // Word count of generated content
  createdAt:   Date,
  updatedAt:   Date
}

Indexes:
  { userId: 1, createdAt: -1 }
  { userId: 1, documentId: 1 }
  { userId: 1, summaryType: 1 }
```

---

### 7. `quiz_attempts`

```javascript
{
  _id:           ObjectId,
  userId:        ObjectId,      // ref: users
  documentId:    ObjectId,      // ref: documents — null if topic-based
  title:         String,        // e.g. "Quiz — Photosynthesis"
  topic:         String,        // Topic string (if sourceType === 'topic')
  sourceType:    String,        // Enum: ['document','topic']
  questions: [{
    questionNumber: Number,     // 1-based index
    questionText:   String,
    options: {
      A: String,
      B: String,
      C: String,
      D: String
    },
    correctAnswer:  String,     // 'A'|'B'|'C'|'D' — NOT sent to client before submission
    explanation:    String,     // Shown after submission
    userAnswer:     String,     // Set on submission
    isCorrect:      Boolean     // Set on submission
  }],
  totalQuestions: Number,
  status:         String,       // Enum: ['pending','submitted']
  score:          Number,       // Number of correct answers (set on submission)
  scorePercentage:Number,       // 0-100 (set on submission)
  submittedAt:    Date,
  timeTaken:      Number,       // Seconds (optional)
  createdAt:      Date,
  updatedAt:      Date
}

Indexes:
  { userId: 1, createdAt: -1 }
  { userId: 1, status: 1 }
  { userId: 1, documentId: 1 }
```

**Security note:** `correctAnswer` is stored server-side only. The GET endpoint for pending quizzes strips `correctAnswer` from the response. It is only revealed after the user submits answers.

---

## Data Relationships Summary

| From            | To               | Type         | How                                |
|-----------------|------------------|--------------|------------------------------------|
| documents       | users            | Many-to-One  | documents.userId → users._id       |
| document_chunks | documents        | Many-to-One  | chunks.documentId → documents._id  |
| document_chunks | users            | Many-to-One  | chunks.userId → users._id          |
| conversations   | users            | Many-to-One  | conversations.userId → users._id   |
| conversations   | documents        | Many-to-Many | conversations.attachedDocuments[]  |
| messages        | conversations    | Many-to-One  | messages.conversationId            |
| messages        | users            | Many-to-One  | messages.userId                    |
| summaries       | users            | Many-to-One  | summaries.userId                   |
| summaries       | documents        | Many-to-One  | summaries.documentId (nullable)    |
| quiz_attempts   | users            | Many-to-One  | quiz_attempts.userId               |
| quiz_attempts   | documents        | Many-to-One  | quiz_attempts.documentId (nullable)|

---

## Atlas Vector Search Setup

To enable semantic search for RAG, create a vector search index in MongoDB Atlas:

1. Go to Atlas → Your Cluster → Search → Create Search Index
2. Select: **Atlas Vector Search**
3. Collection: `ai-study-assistant.document_chunks`
4. Index definition:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```
5. Index name: `vector_index`

**Note:** If vector search index is not configured, the application automatically falls back to in-memory cosine similarity computation. This is slower for large document sets but functionally equivalent.
