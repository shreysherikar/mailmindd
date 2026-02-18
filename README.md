# MailMind - AI-Powered Email Management

> Smart Email Organization with Real AI

**Team Cipher | AlgosQuest 2025**

[![Next.js](https://img.shields.io/badge/Next.js-16.1+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Overview

MailMind is an AI-powered email management application that helps you organize, prioritize, and manage your Gmail inbox intelligently. Built with Next.js and powered by Groq's Llama 3.1 8B model, it provides real AI analysis (not just keyword matching) for email categorization, priority scoring, spam detection, and deadline extraction.

### The Problem

Email overload is real. Important emails get buried, deadlines are missed, and sorting through hundreds of messages wastes valuable time. Traditional email clients treat all emails equally, leaving you to manually prioritize and organize.

### Our Solution

MailMind uses AI to understand your emails contextually - analyzing content, urgency, and importance to help you focus on what matters most.

## ✨ Key Features

### 1. 🎯 AI Priority Scoring (1-100)
Real AI-powered priority analysis using Groq Llama 3.1 8B:
- Analyzes email content and context
- Assigns priority score with reasoning
- No keyword matching - understands nuance

### 2. 📂 Smart Email Categorization
AI categorizes emails into actionable groups:
- **Do Now**: Urgent, time-sensitive emails
- **Needs Decision**: Requires your input or approval
- **Waiting**: Awaiting response from others
- **Low Energy**: FYI, newsletters, low-priority items

### 3. � Intelligent Spam Detection
AI-powered spam and phishing detection:
- Context-aware analysis (not just keyword lists)
- Confidence scoring
- Detailed reasoning for spam classification

### 4. 📅 Deadline Extraction
Natural language deadline understanding:
- Extracts dates from phrases like "by end of week"
- Normalizes to standard format
- Calculates urgency level

### 5. 🔍 Advanced Sorting & Filtering
- Sort by: Priority, Deadline, Date, Sender
- Filter by: Deadline urgency (Overdue, Today, This Week, etc.)
- Tab-based UI for easy access
- Persistent preferences via localStorage

### 6. � AI-Powered Email Tools
- **Reply Generation**: Context-aware email replies
- **Summarization**: Concise email summaries
- **Explanation**: Why an email is important
- **To-Do Extraction**: Generate actionable tasks

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  Next.js 16 App Router + React 19 + TypeScript + Tailwind   │
│                                                              │
│  • Email List with AI-powered sorting/filtering             │
│  • Real-time AI analysis caching                            │
│  • Gmail OAuth authentication                               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   API Routes Layer                           │
│              Next.js Serverless Functions                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AI Features (/api/ai/*)                            │    │
│  │  • priority        • categorize   • spam-detect     │    │
│  │  • extract-deadline • reply       • summarize       │    │
│  │  • explain         • todo-title                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Gmail Integration (/api/gmail/*)                   │    │
│  │  • route (list)    • message      • send            │    │
│  │  • reply           • attachment                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Other                                              │    │
│  │  • /api/auth/[...nextauth] (NextAuth.js)           │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ External API Calls
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                  External Services                           │
│                                                              │
│  • Groq API (Llama 3.1 8B Instant) - AI inference           │
│  • Gmail API (googleapis) - Email operations                │
│  • NextAuth.js - OAuth 2.0 authentication                   │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Gmail account
- Groq API key (free at console.groq.com)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Avila-Princy-M01/mailmindd.git
cd mailmindd
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env.local` file:
```bash
# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. **Run the development server**
```bash
npm run dev
```

Visit: http://localhost:3000

## 📚 Documentation

- **[AI Features Guide](AI_FEATURES.md)** - Detailed explanation of AI-powered features
- **[Google OAuth Setup](GOOGLE_OAUTH_SETUP.md)** - Gmail integration setup

## 🎯 API Endpoints

### AI-Powered Features
- `POST /api/ai/priority` - AI priority scoring (1-100)
- `POST /api/ai/categorize` - Email categorization
- `POST /api/ai/spam-detect` - Spam detection with confidence
- `POST /api/ai/extract-deadline` - Deadline extraction
- `POST /api/ai/reply` - Generate email replies
- `POST /api/ai/summarize` - Email summarization
- `POST /api/ai/explain` - Explain email importance
- `POST /api/ai/todo-title` - Generate to-do titles

### Gmail Integration
- `GET /api/gmail` - Fetch Gmail messages
- `GET /api/gmail/message` - Get specific message
- `POST /api/gmail/send` - Send email
- `POST /api/gmail/reply` - Reply to email
- `GET /api/gmail/attachment` - Download attachment

## 💡 Usage Examples

### Priority Scoring
```typescript
const response = await fetch('/api/ai/priority', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: "Urgent: Budget Review",
    snippet: "We need to review the Q4 budget by Friday..."
  })
});

const { result } = await response.json();
// { score: 85, reason: "High urgency with clear deadline" }
```

### Email Categorization
```typescript
const response = await fetch('/api/ai/categorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: "Project Update",
    snippet: "Please review and approve the design..."
  })
});

const { result } = await response.json();
// { category: "Needs Decision", confidence: 0.92 }
```

### Spam Detection
```typescript
const response = await fetch('/api/ai/spam-detect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: "sender@example.com",
    subject: "You've won!",
    snippet: "Click here to claim your prize..."
  })
});

const { result } = await response.json();
// { isSpam: true, confidence: 0.95, reason: "Phishing indicators detected" }
```

## 🔧 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Styling
- **Framer Motion** - Animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication (Google OAuth)
- **Gmail API** - Email integration via googleapis
- **Mailparser** - Email parsing

### AI/ML
- **Groq SDK** - Ultra-fast AI inference
- **Llama 3.1 8B Instant** - Primary AI model

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📊 Performance

- **AI Response Time**: 1-3 seconds per email
- **Batch Processing**: 10 emails at a time
- **Caching**: In-memory caching to avoid redundant API calls
- **Parallel Processing**: Multiple AI requests run simultaneously

## 🔒 Privacy & Security

- **OAuth 2.0**: Secure Gmail authentication
- **No Email Storage**: Emails processed on-demand, not stored
- **API Key Security**: Environment variables for sensitive keys
- **Client-Side Caching**: AI results cached in browser memory only
- **HTTPS Only**: Secure communication in production

## 🎯 What's Real vs What's Not

### ✅ Actually Implemented
- AI-powered priority scoring (Groq Llama 3.1 8B)
- AI email categorization
- AI spam detection
- AI deadline extraction
- Gmail OAuth integration
- Email sorting and filtering
- Reply generation
- Email summarization

### ❌ Not Yet Implemented
- ChromaDB vector database
- RAG (Retrieval-Augmented Generation)
- Semantic search
- Burnout detection
- Task extraction with persistence
- Follow-up management
- Calendar integration
- Historical pattern analysis

## 🛣️ Roadmap

- [ ] Implement semantic search with vector embeddings
- [ ] Add task management with database persistence
- [ ] Build follow-up tracking system
- [ ] Add calendar integration
- [ ] Implement burnout detection
- [ ] Mobile responsive design improvements
- [ ] Browser extension
- [ ] Team collaboration features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team Cipher

Built for AlgosQuest 2025

## 🙏 Acknowledgments

- Groq for ultra-fast AI inference
- Google for Gmail API
- Next.js team for the amazing framework
- Open source community

## 📞 Contact

- **GitHub**: [https://github.com/Avila-Princy-M01/mailmindd](https://github.com/Avila-Princy-M01/mailmindd)
- **Original Repo**: [https://github.com/shreysherikar/mailmindd](https://github.com/shreysherikar/mailmindd)

---

**Built with ❤️ by Team Cipher for AlgosQuest 2025**

*MailMind - Smart Email Organization with Real AI*
