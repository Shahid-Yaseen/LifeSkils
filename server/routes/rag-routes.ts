import { Router } from 'express';
import { ragContentGenerator } from '../services/rag-content-generator.js';
import { ragPDFProcessor } from '../services/rag-pdf-processor.js';
import { db } from '../db.js';
import { books, bookChunks, generatedTopics, generatedTests } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get RAG system stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await ragContentGenerator.getBookStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting RAG stats:', error);
    res.status(500).json({ error: 'Failed to get RAG stats' });
  }
});

// Get available topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await ragContentGenerator.getAvailableTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// Generate timeline content
router.post('/timeline', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const timelineContent = await ragContentGenerator.generateTimelineContent(topic);
    res.json(timelineContent);
  } catch (error) {
    console.error('Error generating timeline content:', error);
    res.status(500).json({ error: 'Failed to generate timeline content' });
  }
});

// Generate practice questions
router.post('/questions', async (req, res) => {
  try {
    const { topic, difficulty = 'intermediate' } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const questions = await ragContentGenerator.generatePracticeQuestions(topic, difficulty);
    res.json(questions);
  } catch (error) {
    console.error('Error generating practice questions:', error);
    res.status(500).json({ error: 'Failed to generate practice questions' });
  }
});

// Generate study guide
router.post('/study-guide', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const studyGuide = await ragContentGenerator.generateStudyGuide(topic);
    res.json(studyGuide);
  } catch (error) {
    console.error('Error generating study guide:', error);
    res.status(500).json({ error: 'Failed to generate study guide' });
  }
});

// Search content
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const results = await ragContentGenerator.findRelevantChunks(query, limit);
    res.json(results);
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: 'Failed to search content' });
  }
});

// Get all books
router.get('/books', async (req, res) => {
  try {
    const allBooks = await db.select().from(books).orderBy(books.createdAt);
    res.json(allBooks);
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({ error: 'Failed to get books' });
  }
});

// Get book details
router.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await db.select().from(books).where(eq(books.id, id)).limit(1);
    
    if (book.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Get chunks for this book
    const chunks = await db.select()
      .from(bookChunks)
      .where(eq(bookChunks.bookId, id))
      .orderBy(bookChunks.chunkIndex);
    
    // Get topics for this book
    const topics = await db.select()
      .from(generatedTopics)
      .where(eq(generatedTopics.bookId, id))
      .orderBy(generatedTopics.orderIndex);
    
    // Get tests for this book
    const tests = await db.select()
      .from(generatedTests)
      .where(eq(generatedTests.bookId, id))
      .orderBy(generatedTests.createdAt);
    
    res.json({
      book: book[0],
      chunks: chunks,
      topics: topics,
      tests: tests
    });
  } catch (error) {
    console.error('Error getting book details:', error);
    res.status(500).json({ error: 'Failed to get book details' });
  }
});

// Process a single PDF
router.post('/process-pdf', async (req, res) => {
  try {
    const { filePath, bookTitle, author } = req.body;
    
    if (!filePath || !bookTitle) {
      return res.status(400).json({ error: 'File path and book title are required' });
    }
    
    const result = await ragPDFProcessor.processPDF(filePath, bookTitle, author);
    res.json(result);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// Process all PDFs in directory
router.post('/process-all-pdfs', async (req, res) => {
  try {
    const { directoryPath } = req.body;
    
    if (!directoryPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }
    
    const results = await ragPDFProcessor.processAllPDFsInDirectory(directoryPath);
    res.json(results);
  } catch (error) {
    console.error('Error processing all PDFs:', error);
    res.status(500).json({ error: 'Failed to process PDFs' });
  }
});

export default router;