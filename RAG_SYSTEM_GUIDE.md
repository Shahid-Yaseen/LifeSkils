# AI-Powered RAG Learning System

## Overview

This RAG (Retrieval-Augmented Generation) system transforms books into interactive learning content using AI. It processes PDF books, generates educational topics, creates explanations, and builds tests - all based strictly on the book content.

## 🏗️ System Architecture

### Backend Components

#### 1. Database Schema (`shared/schema.ts`)
- **`books`** - Stores book metadata and processing status
- **`bookChunks`** - Text chunks with embeddings for semantic search
- **`generatedTopics`** - AI-generated educational topics
- **`generatedTests`** - AI-generated tests and quizzes
- **`userTestAttempts`** - User test submissions and scores

#### 2. RAG Service (`server/services/rag-service.ts`)
- **Book Processing**: PDF → Text → Chunks → Embeddings
- **Topic Generation**: AI creates structured learning topics
- **Content Generation**: AI explains topics using book content
- **Test Generation**: AI creates various test types
- **Semantic Search**: Find relevant content using embeddings

#### 3. API Routes (`server/routes/rag-routes.ts`)
- **Book Management**: Upload, process, and manage books
- **Topic Operations**: Generate and retrieve topics
- **Content Generation**: Create educational content
- **Test Management**: Generate and submit tests
- **Search**: Semantic search across all content

### Frontend Components

#### 1. Admin Interface (`client/src/pages/admin/AdminRAGManagement.tsx`)
- **Book Upload**: PDF upload with metadata
- **Topic Management**: Generate and organize topics
- **Test Creation**: Generate various test types
- **Content Review**: Review AI-generated content

#### 2. Student Interface (`client/src/pages/rag-learning.tsx`)
- **Book Browser**: Explore available books
- **Topic Learning**: Study AI-generated content
- **Test Taking**: Interactive test interface
- **Search**: Find content across all books

## 🚀 Getting Started

### 1. Database Setup

The system uses PostgreSQL with the following new tables:
```sql
-- Books table for storing book metadata
CREATE TABLE books (
  id VARCHAR PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  description TEXT,
  file_path TEXT,
  total_pages INTEGER,
  total_chunks INTEGER DEFAULT 0,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Book chunks with embeddings for semantic search
CREATE TABLE book_chunks (
  id VARCHAR PRIMARY KEY,
  book_id VARCHAR REFERENCES books(id),
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER,
  chapter_title TEXT,
  section_title TEXT,
  embedding TEXT, -- JSON string of embedding vector
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated topics from book content
CREATE TABLE generated_topics (
  id VARCHAR PRIMARY KEY,
  book_id VARCHAR REFERENCES books(id),
  title TEXT NOT NULL,
  description TEXT,
  chapter_number INTEGER,
  order_index INTEGER NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
  prerequisites TEXT,
  key_points JSONB, -- Array of key points
  content TEXT, -- Generated explanation content
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated tests for topics
CREATE TABLE generated_tests (
  id VARCHAR PRIMARY KEY,
  book_id VARCHAR REFERENCES books(id),
  topic_id VARCHAR REFERENCES generated_topics(id),
  title TEXT NOT NULL,
  description TEXT,
  test_type TEXT NOT NULL, -- 'multiple_choice' | 'short_answer' | 'fill_blank' | 'essay'
  questions JSONB NOT NULL, -- Array of question objects
  difficulty TEXT DEFAULT 'intermediate',
  time_limit INTEGER, -- in minutes
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User test attempts and scores
CREATE TABLE user_test_attempts (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  test_id VARCHAR REFERENCES generated_tests(id),
  answers JSONB NOT NULL, -- User's answers
  score INTEGER,
  is_passed BOOLEAN,
  time_spent INTEGER, -- in seconds
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### 2. Environment Setup

Ensure you have the following environment variables:
```bash
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

### 3. API Endpoints

#### Book Management
- `POST /api/rag/books/upload` - Upload and process a PDF book
- `GET /api/rag/books` - List all books
- `GET /api/rag/books/:id` - Get book details

#### Topic Generation
- `POST /api/rag/books/:id/topics` - Generate topics from book
- `GET /api/rag/books/:id/topics` - Get topics for a book
- `POST /api/rag/topics/:id/content` - Generate content for a topic

#### Test Management
- `POST /api/rag/topics/:id/tests` - Generate test for a topic
- `GET /api/rag/topics/:id/tests` - Get tests for a topic
- `POST /api/rag/tests/:id/attempt` - Submit test attempt

#### Search
- `POST /api/rag/search` - Search across all content

## 📚 Usage Guide

### For Administrators

#### 1. Upload a Book
1. Go to `/admin/rag`
2. Click "Upload Book"
3. Select PDF file and enter metadata
4. System processes the book automatically

#### 2. Generate Topics
1. Select a processed book
2. Click "Generate Topics"
3. AI creates structured learning topics
4. Review and organize topics

#### 3. Create Tests
1. Select a topic
2. Choose test type and difficulty
3. AI generates questions based on book content
4. Review and approve tests

### For Students

#### 1. Browse Books
1. Go to `/rag-learning`
2. Browse available books
3. Use search to find specific content

#### 2. Study Topics
1. Select a book to see topics
2. Click "Generate Content" for detailed explanations
3. Study AI-generated content based on book

#### 3. Take Tests
1. Select a topic with available tests
2. Choose a test to take
3. Answer questions and submit
4. Get instant feedback and scores

## 🔧 Technical Features

### AI Integration
- **OpenAI GPT-4o-mini**: Content generation and test creation
- **Text Embeddings**: Semantic search and content retrieval
- **Strict Content Control**: All content based only on uploaded books

### Content Generation
- **Topic Extraction**: AI identifies key learning topics
- **Content Explanation**: AI explains topics using book content
- **Test Creation**: AI generates various question types
- **Difficulty Adaptation**: Content adapted to different skill levels

### Search Capabilities
- **Semantic Search**: Find content by meaning, not just keywords
- **Cross-Book Search**: Search across all uploaded books
- **Relevance Ranking**: Results ranked by relevance to query

### Test Types
- **Multiple Choice**: Traditional MCQ questions
- **Short Answer**: Open-ended questions
- **Fill in the Blank**: Completion questions
- **Essay**: Long-form written responses

## 🎯 Key Benefits

### For Educators
- **Automated Content Creation**: Generate learning materials from any book
- **Consistent Quality**: AI ensures consistent content quality
- **Time Saving**: Automate topic and test generation
- **Scalable**: Process multiple books efficiently

### For Students
- **Personalized Learning**: Content adapted to individual needs
- **Comprehensive Coverage**: All book content made accessible
- **Interactive Testing**: Various test formats for engagement
- **Search Capabilities**: Find specific information quickly

### For Institutions
- **Cost Effective**: Reduce manual content creation costs
- **Quality Assurance**: AI ensures content accuracy
- **Scalability**: Handle large volumes of educational content
- **Integration**: Seamlessly integrate with existing systems

## 🔒 Content Safety

### Strict Source Control
- All content generated strictly from uploaded books
- No external knowledge used in content generation
- Clear attribution to source material
- Fallback messages when content not found in books

### Quality Assurance
- AI prompts designed to prevent hallucination
- Content validation against source material
- User feedback integration for improvement
- Regular content review processes

## 🚀 Future Enhancements

### Planned Features
- **Vector Database Integration**: Use pgvector for better semantic search
- **Multi-Language Support**: Process books in different languages
- **Advanced Analytics**: Track learning progress and content effectiveness
- **Collaborative Features**: Allow multiple users to contribute content
- **API Rate Limiting**: Implement proper rate limiting for production
- **Caching System**: Cache generated content for better performance

### Technical Improvements
- **Batch Processing**: Process multiple books simultaneously
- **Progress Tracking**: Real-time processing status updates
- **Error Handling**: Robust error handling and recovery
- **Performance Optimization**: Optimize for large-scale deployment

## 📖 Example Workflow

### 1. Book Upload
```
Admin uploads "Life in the UK Handbook" PDF
↓
System extracts text and creates chunks
↓
Generates embeddings for semantic search
↓
Book marked as "processed" and ready for use
```

### 2. Topic Generation
```
Admin clicks "Generate Topics"
↓
AI analyzes book content
↓
Creates structured learning topics
↓
Topics saved to database with metadata
```

### 3. Content Creation
```
Student selects a topic
↓
AI generates detailed explanation
↓
Content based strictly on book excerpts
↓
Student can study the generated content
```

### 4. Test Taking
```
Student starts a test
↓
AI-generated questions appear
↓
Student answers questions
↓
System grades and provides feedback
```

## 🛠️ Development Notes

### File Structure
```
server/
├── services/
│   └── rag-service.ts          # Core RAG functionality
├── routes/
│   └── rag-routes.ts          # API endpoints
└── db.ts                      # Database connection

client/src/
├── pages/
│   ├── admin/
│   │   └── AdminRAGManagement.tsx  # Admin interface
│   └── rag-learning.tsx            # Student interface
└── components/
    └── AdminNavigation.tsx         # Updated with RAG link

shared/
└── schema.ts                       # Database schema
```

### Key Dependencies
- **OpenAI**: AI content generation
- **pdf-parse**: PDF text extraction
- **Drizzle ORM**: Database operations
- **React Query**: Data fetching and caching
- **Tailwind CSS**: UI styling

This RAG system provides a complete solution for transforming books into interactive learning experiences, with AI-powered content generation that maintains strict fidelity to source material.
