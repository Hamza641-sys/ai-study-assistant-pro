# AI Study Assistant Pro 🎓

A full-stack GenAI web application that helps students learn more efficiently using AI-powered tools for document analysis, question answering, note summarization, and quiz generation.

## 🚀 Features

- **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **AI Tutor** - Chat with AI about any topic with conversation history
- **PDF Document Management** - Upload and manage study materials
- **RAG Question Answering** - Ask questions about your uploaded documents with source references
- **Notes Summarizer** - Generate summaries in multiple formats (short, detailed, key points, definitions)
- **Quiz Generator** - Create practice quizzes from topics or documents with scoring and explanations
- **Learning Dashboard** - Track your progress with statistics and history
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🛠️ Technology Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

### Backend
- Node.js + Express.js
- MongoDB Atlas
- JWT Authentication
- OpenAI API
- PDF Processing with pdf-parse

### AI & RAG
- OpenAI GPT models
- Text embeddings for semantic search
- MongoDB Atlas Vector Search
- Document chunking and retrieval

## 📁 Project Structure

```
ai-study-assistant-pro/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── hooks/          # Custom React hooks
│       ├── services/       # API service layer
│       ├── context/        # React context (auth, theme)
│       └── utils/          # Helper functions
├── server/                 # Express backend
│   ├── config/             # Database and service configs
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic (AI, RAG, PDF)
│   ├── validators/         # Input validation rules
│   └── server.js           # Entry point
└── docs/                   # Documentation
    ├── architecture.md
    ├── database-design.md
    └── api-documentation.md
```

## 🔧 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (free)
- Groq API key (free) — get from https://console.groq.com/keys

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_minimum_32_characters
GROQ_API_KEY=your_groq_api_key (free from console.groq.com)
PORT=5000
CLIENT_URL=http://localhost:5173
```

5. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure API URL in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication with expiry
- Protected API routes with auth middleware
- User-specific resource access control
- Input validation and sanitization
- File type and size restrictions
- Rate limiting on API endpoints
- Environment variables for sensitive data
- Secure error messages (no data leakage)

## 📊 Database Collections

- **users** - User profiles and authentication data
- **documents** - PDF metadata and processing status
- **document_chunks** - Text chunks with embeddings for RAG
- **conversations** - Chat sessions
- **messages** - Individual chat messages
- **summaries** - Generated note summaries
- **quiz_attempts** - Quiz history and results

## 🧪 Testing

Run the comprehensive test suite covering:
- Authentication flows
- Document upload and processing
- AI question answering
- RAG retrieval accuracy
- Quiz generation and scoring
- Dashboard statistics

See `docs/testing-plan.md` for detailed test scenarios.

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Backend (Render/Railway/Heroku)

1. Configure environment variables on hosting platform
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy

### MongoDB Atlas

1. Create cluster (free tier available)
2. Create database user
3. Whitelist IP addresses
4. Copy connection string to backend .env

## 📚 API Documentation

See `docs/api-documentation.md` for complete API reference.

## 🏗️ Architecture

See `docs/architecture.md` for system design and data flow diagrams.

## 🗄️ Database Design

See `docs/database-design.md` for schema definitions and relationships.

## 🤝 Contributing

This is a capstone project for educational purposes.

## 📝 License

MIT License

## 👤 Author

Built as a Full-Stack GenAI Capstone Project

## 🙏 Acknowledgments

- OpenAI for GPT API
- MongoDB Atlas for database hosting
- All open-source libraries used in this project

---

**Note**: This project requires valid API keys and proper environment configuration. Never commit `.env` files or API keys to version control.
