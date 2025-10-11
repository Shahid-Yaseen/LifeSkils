import { Router } from 'express';
import { db } from '../db.js';
import { books, bookChunks, generatedTopics, generatedTests } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Populate RAG system from markdown files
router.post('/populate', async (req, res) => {
  try {
    console.log('🚀 Starting RAG population from markdown files...');
    
    // Read the markdown files
    const timelinePath = path.join(process.cwd(), 'client', 'public', 'assets', 'enhanced-key-dates-timeline.md');
    const cheatsheetPath = path.join(process.cwd(), 'client', 'public', 'assets', 'life-in-uk-key-data-cheatsheet.md');
    
    const timelineContent = fs.readFileSync(timelinePath, 'utf8');
    const cheatsheetContent = fs.readFileSync(cheatsheetPath, 'utf8');
    
    console.log(`📁 Read timeline content: ${timelineContent.length} characters`);
    console.log(`📁 Read cheatsheet content: ${cheatsheetContent.length} characters`);
    
    // Create book records
    const [timelineBook] = await db.insert(books).values({
      title: 'Enhanced Key Dates Timeline',
      author: 'Life in UK Test Study Guide',
      description: 'Comprehensive timeline of key dates and events for the Life in UK test',
      filePath: timelinePath,
      totalPages: Math.ceil(timelineContent.length / 2000),
      totalChunks: 0,
      isProcessed: false,
    }).returning();

    const [cheatsheetBook] = await db.insert(books).values({
      title: 'Life in UK Key Data Cheatsheet',
      author: 'Life in UK Test Study Guide',
      description: 'Essential facts and figures for the Life in UK test',
      filePath: cheatsheetPath,
      totalPages: Math.ceil(cheatsheetContent.length / 2000),
      totalChunks: 0,
      isProcessed: false,
    }).returning();

    console.log(`📚 Created books: ${timelineBook.id}, ${cheatsheetBook.id}`);
    
    // Process timeline content
    const timelineChunks = chunkText(timelineContent, 1000);
    const timelineChunkData = timelineChunks.map((chunk, index) => ({
      bookId: timelineBook.id,
      chunkIndex: index,
      content: chunk,
      embedding: JSON.stringify([0.1, 0.2, 0.3]), // Dummy embedding for now
      tokenCount: chunk.split(' ').length,
    }));

    // Process cheatsheet content
    const cheatsheetChunks = chunkText(cheatsheetContent, 1000);
    const cheatsheetChunkData = cheatsheetChunks.map((chunk, index) => ({
      bookId: cheatsheetBook.id,
      chunkIndex: index,
      content: chunk,
      embedding: JSON.stringify([0.1, 0.2, 0.3]), // Dummy embedding for now
      tokenCount: chunk.split(' ').length,
    }));

    // Insert chunks in batches
    const batchSize = 10;
    for (let i = 0; i < timelineChunkData.length; i += batchSize) {
      const batch = timelineChunkData.slice(i, i + batchSize);
      await db.insert(bookChunks).values(batch);
    }
    
    for (let i = 0; i < cheatsheetChunkData.length; i += batchSize) {
      const batch = cheatsheetChunkData.slice(i, i + batchSize);
      await db.insert(bookChunks).values(batch);
    }
    
    console.log(`📝 Inserted ${timelineChunkData.length + cheatsheetChunkData.length} chunks`);

    // Create some sample topics
    const timelineTopics = [
      {
        bookId: timelineBook.id,
        title: 'Ancient & Medieval Britain',
        description: 'Key events from Stone Age to 1500 AD',
        chapterNumber: 1,
        orderIndex: 1,
        difficulty: 'intermediate',
        prerequisites: 'Basic knowledge of British history',
        keyPoints: ['Roman invasion (43 AD)', 'Norman Conquest (1066)', 'Magna Carta (1215)'],
        content: 'This section covers the early history of Britain from prehistoric times through the medieval period.'
      },
      {
        bookId: timelineBook.id,
        title: 'Tudor & Stuart Periods',
        description: '1485-1714: Tudor dynasty and English Civil War',
        chapterNumber: 2,
        orderIndex: 2,
        difficulty: 'intermediate',
        prerequisites: 'Understanding of medieval Britain',
        keyPoints: ['Henry VIII and the Reformation', 'Elizabeth I and the Spanish Armada', 'English Civil War'],
        content: 'This period saw the establishment of the Church of England and the beginning of parliamentary democracy.'
      }
    ];

    const cheatsheetTopics = [
      {
        bookId: cheatsheetBook.id,
        title: 'UK Geography & Population',
        description: 'Essential geographical and demographic facts',
        chapterNumber: 1,
        orderIndex: 1,
        difficulty: 'beginner',
        prerequisites: 'None',
        keyPoints: ['Population: 67 million', 'Four countries: England, Scotland, Wales, Northern Ireland', 'Capital cities'],
        content: 'Understanding the basic geography and population of the UK is essential for the citizenship test.'
      },
      {
        bookId: cheatsheetBook.id,
        title: 'Government & Democracy',
        description: 'How the UK government works',
        chapterNumber: 2,
        orderIndex: 2,
        difficulty: 'intermediate',
        prerequisites: 'Basic understanding of democracy',
        keyPoints: ['Constitutional monarchy', 'Parliament structure', 'Voting system'],
        content: 'The UK operates as a constitutional monarchy with a parliamentary democracy.'
      }
    ];

    // Insert topics
    await db.insert(generatedTopics).values([...timelineTopics, ...cheatsheetTopics]);
    console.log(`📖 Created ${timelineTopics.length + cheatsheetTopics.length} topics`);

    // Create sample tests
    const sampleTests = [
      {
        bookId: timelineBook.id,
        title: 'Timeline Knowledge Test',
        description: 'Test your knowledge of key dates in British history',
        testType: 'multiple_choice',
        questions: [
          {
            question: 'In which year did the Norman Conquest take place?',
            options: ['1066', '1067', '1065', '1068'],
            correctAnswer: 0,
            explanation: 'The Norman Conquest occurred in 1066 when William the Conqueror defeated Harold II at the Battle of Hastings.'
          },
          {
            question: 'When was the Magna Carta signed?',
            options: ['1214', '1215', '1216', '1217'],
            correctAnswer: 1,
            explanation: 'The Magna Carta was signed by King John in 1215, establishing the principle that the king was subject to the law.'
          }
        ],
        difficulty: 'intermediate',
        timeLimit: 15,
        passingScore: 70
      },
      {
        bookId: cheatsheetBook.id,
        title: 'UK Facts and Figures Test',
        description: 'Test your knowledge of essential UK statistics',
        testType: 'multiple_choice',
        questions: [
          {
            question: 'What is the approximate population of the UK?',
            options: ['60 million', '65 million', '67 million', '70 million'],
            correctAnswer: 2,
            explanation: 'The UK has a population of approximately 67 million people.'
          },
          {
            question: 'How many MPs are there in the House of Commons?',
            options: ['600', '650', '700', '750'],
            correctAnswer: 1,
            explanation: 'There are 650 Members of Parliament in the House of Commons.'
          }
        ],
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 70
      }
    ];

    // Insert tests
    await db.insert(generatedTests).values(sampleTests);
    console.log(`📝 Created ${sampleTests.length} tests`);

    // Update books as processed
    await db.update(books)
      .set({ 
        isProcessed: true, 
        totalChunks: timelineChunkData.length,
        updatedAt: new Date()
      })
      .where(eq(books.id, timelineBook.id));

    await db.update(books)
      .set({ 
        isProcessed: true, 
        totalChunks: cheatsheetChunkData.length,
        updatedAt: new Date()
      })
      .where(eq(books.id, cheatsheetBook.id));

    console.log('\n✅ RAG System Population Complete!');
    
    res.json({
      success: true,
      message: 'RAG system populated successfully',
      stats: {
        books: 2,
        totalChunks: timelineChunkData.length + cheatsheetChunkData.length,
        topics: timelineTopics.length + cheatsheetTopics.length,
        tests: sampleTests.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error populating RAG system:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to populate RAG system',
      details: error.message 
    });
  }
});

function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastSentence = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastSentence, lastNewline);
      
      if (breakPoint > start + chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
      }
    }
    
    chunks.push(chunk.trim());
    start = start + chunk.length - 200; // 200 character overlap
  }
  
  return chunks.filter(chunk => chunk.length > 50);
}

export default router;
