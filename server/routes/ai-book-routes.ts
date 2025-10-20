import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { books, bookSummaries, generatedTests, timelineEvents, games, practiceTests } from '@shared/schema';
import { eq } from 'drizzle-orm';
import {
  extractTextFromFile,
  generateSummary,
  generateContentFromSummary,
  generatePracticeTestDoc,
} from '../services/ai-book-processor';
import { authenticateToken, requireAdmin, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads', 'books');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  },
});

router.post(
  '/upload',
  authenticateToken,
  requireAdmin,
  upload.fields([
    { name: 'contentFile', maxCount: 1 },
    { name: 'importantPointsFile', maxCount: 1 }
  ]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files.contentFile || !files.importantPointsFile) {
        return res.status(400).json({ error: 'Both content file and important points file are required' });
      }

      const contentFile = files.contentFile[0];
      const importantPointsFile = files.importantPointsFile[0];

      const { title, author, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const [book] = await db
        .insert(books)
        .values({
          title,
          author: author || null,
          description: description || null,
          filePath: contentFile.path,
          importantPointsPath: importantPointsFile.path,
          isProcessed: false,
        })
        .returning();

      res.json({
        message: 'Book uploaded successfully with important points',
        bookId: book.id,
        book,
      });
    } catch (error) {
      console.error('Error uploading book:', error);
      res.status(500).json({ error: 'Failed to upload book' });
    }
  }
);

router.post(
  '/process/:bookId',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { bookId } = req.params;

      const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      if (!book.filePath) {
        return res.status(400).json({ error: 'Book has no file path' });
      }

      if (!book.importantPointsPath) {
        return res.status(400).json({ error: 'Book has no important points file' });
      }

      res.json({ message: 'Processing started', bookId });

      (async () => {
        try {
          console.log(`Starting processing for book: ${book.title}`);

          // Extract text from main content file
          const contentFileExtension = path.extname(book.filePath || '').toLowerCase();
          const contentMimeType =
            contentFileExtension === '.pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const bookText = await extractTextFromFile(book.filePath || '', contentMimeType);
          console.log(`Extracted ${bookText.length} characters from main content file`);

          // Extract text from important points file
          const pointsFileExtension = path.extname(book.importantPointsPath || '').toLowerCase();
          const pointsMimeType =
            pointsFileExtension === '.pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

          const importantPointsText = await extractTextFromFile(book.importantPointsPath || '', pointsMimeType);
          console.log(`Extracted ${importantPointsText.length} characters from important points file`);

          const summary = await generateSummary(bookText, book.title, importantPointsText);
          console.log('Summary generated focused on important points');

          await db.insert(bookSummaries).values({
            bookId: book.id,
            summaryText: summary.summaryText,
            chapterBreakdowns: summary.chapterBreakdowns,
            keyTopics: summary.keyTopics,
            estimatedCounts: summary.estimatedCounts,
          });
          console.log('Summary saved to database');

          const content = await generateContentFromSummary(summary, book.title);
          console.log('Content generated from summary');

          if (content.tests && content.tests.length > 0) {
            for (const test of content.tests) {
              await db.insert(practiceTests).values({
                title: test.title,
                description: test.description,
                category: test.category || 'Book Generated',
                difficulty: test.difficulty === 'beginner' ? 1 : test.difficulty === 'advanced' ? 5 : 3,
                questions: test.questions,
                orderIndex: 0,
              });
            }
            console.log(`Inserted ${content.tests.length} practice tests`);
          }

          if (content.timelineEvents && content.timelineEvents.length > 0) {
            for (const event of content.timelineEvents) {
              await db.insert(timelineEvents).values({
                year: event.year,
                title: event.title,
                description: event.description,
                details: event.details,
                category: event.category,
                importance: event.importance,
                keyFigures: event.keyFigures,
                timelineTopic: event.timelineTopic,
              });
            }
            console.log(`Inserted ${content.timelineEvents.length} timeline events`);
          }

          if (content.games && content.games.length > 0) {
            for (const game of content.games) {
              await db.insert(games).values({
                title: game.title,
                description: game.description,
                category: game.category,
                gameType: game.gameType,
                difficulty: game.difficulty,
                instructions: game.instructions,
                trueFalseQuestions: game.gameData?.trueFalseQuestions || null,
                matchingPairs: game.gameData?.matchingPairs || null,
                tripleMatches: game.gameData?.tripleMatches || null,
                flipCards: game.gameData?.flipCards || null,
                aiTopics: game.gameData?.aiTopics || null,
                gameData: game.gameData,
                isActive: true,
                orderIndex: 0,
              });
            }
            console.log(`Inserted ${content.games.length} games`);
          }

          if (content.tests && content.tests.length > 0) {
            const docPath = await generatePracticeTestDoc(content.tests, book.title, book.id);
            console.log(`Practice test document generated: ${docPath}`);
          }

          await db
            .update(books)
            .set({ isProcessed: true, updatedAt: new Date() })
            .where(eq(books.id, book.id));

          console.log(`Processing completed for book: ${book.title}`);
        } catch (error) {
          console.error(`Error processing book ${book.id}:`, error);
        }
      })();
    } catch (error) {
      console.error('Error starting book processing:', error);
      res.status(500).json({ error: 'Failed to start processing' });
    }
  }
);

router.get('/books', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allBooks = await db.select().from(books).orderBy(books.createdAt);
    res.json({ books: allBooks });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

router.get(
  '/books/:bookId/summary',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { bookId } = req.params;

      const [summary] = await db
        .select()
        .from(bookSummaries)
        .where(eq(bookSummaries.bookId, bookId))
        .limit(1);

      if (!summary) {
        return res.status(404).json({ error: 'Summary not found' });
      }

      res.json({ summary });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  }
);

router.get(
  '/books/:bookId/generated-content',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { bookId } = req.params;

      const tests = await db
        .select()
        .from(practiceTests)
        .where(eq(practiceTests.category, 'Book Generated'));

      const events = await db.select().from(timelineEvents);

      const gamesData = await db.select().from(games);

      res.json({
        tests: tests.length,
        events: events.length,
        games: gamesData.length,
      });
    } catch (error) {
      console.error('Error fetching generated content:', error);
      res.status(500).json({ error: 'Failed to fetch generated content' });
    }
  }
);

router.get(
  '/books/:bookId/download-tests',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { bookId } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', 'generated', `practice-tests-${bookId}.docx`);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Practice test document not found' });
      }

      res.download(filePath, `practice-tests-${bookId}.docx`);
    } catch (error) {
      console.error('Error downloading tests:', error);
      res.status(500).json({ error: 'Failed to download tests' });
    }
  }
);

router.delete(
  '/books/:bookId',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { bookId } = req.params;

      const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      if (book.filePath && fs.existsSync(book.filePath)) {
        fs.unlinkSync(book.filePath);
      }

      const docPath = path.join(process.cwd(), 'uploads', 'generated', `practice-tests-${bookId}.docx`);
      if (fs.existsSync(docPath)) {
        fs.unlinkSync(docPath);
      }

      await db.delete(books).where(eq(books.id, bookId));

      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  }
);

export default router;
