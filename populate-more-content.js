// Populate more content in the RAG system
import { db } from './server/db.ts';
import { books, bookChunks, generatedTopics, generatedTests } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function populateMoreContent() {
  try {
    console.log('🚀 Adding more content to RAG system...');
    
    // Get existing books
    const existingBooks = await db.select().from(books);
    console.log(`Found ${existingBooks.length} existing books`);
    
    if (existingBooks.length === 0) {
      console.log('No existing books found. Creating new book...');
      
      // Create a new book
      const [newBook] = await db.insert(books).values({
        title: 'Life in UK Test Study Guide',
        author: 'Official Study Materials',
        description: 'Comprehensive study materials for the Life in UK test',
        filePath: '/client/public/assets/',
        totalPages: 10,
        totalChunks: 0,
        isProcessed: false,
      }).returning();
      
      console.log(`Created new book: ${newBook.id}`);
      
      // Add more comprehensive chunks
      const chunks = [
        {
          bookId: newBook.id,
          chunkIndex: 0,
          content: 'The UK is a constitutional monarchy with a parliamentary democracy. The monarch is the Head of State, while the Prime Minister is the Head of Government. Parliament consists of the House of Commons and House of Lords.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 35,
        },
        {
          bookId: newBook.id,
          chunkIndex: 1,
          content: 'The Norman Conquest took place in 1066 when William the Conqueror defeated Harold II at the Battle of Hastings. This event marked the beginning of Norman rule in England and brought significant changes to English society, law, and language.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 40,
        },
        {
          bookId: newBook.id,
          chunkIndex: 2,
          content: 'The Magna Carta was signed in 1215 by King John, establishing the principle that the king was subject to the law. This document is considered a cornerstone of English constitutional law and influenced the development of democracy worldwide.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 42,
        },
        {
          bookId: newBook.id,
          chunkIndex: 3,
          content: 'The Industrial Revolution began in Britain around 1750 and transformed the country from an agricultural society to an industrial one. Key developments included steam power, textile manufacturing, and the growth of cities.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 38,
        },
        {
          bookId: newBook.id,
          chunkIndex: 4,
          content: 'The Act of Union in 1707 united England and Scotland to form Great Britain. This created a single parliament and established the foundation for the modern United Kingdom.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 32,
        },
        {
          bookId: newBook.id,
          chunkIndex: 5,
          content: 'The NHS (National Health Service) was established in 1948, providing free healthcare to all UK residents. It is funded through taxation and is one of the largest employers in the world.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 35,
        },
        {
          bookId: newBook.id,
          chunkIndex: 6,
          content: 'The UK has four countries: England, Scotland, Wales, and Northern Ireland. Each has its own distinct culture, history, and in some cases, devolved government powers.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 30,
        },
        {
          bookId: newBook.id,
          chunkIndex: 7,
          content: 'British values include democracy, the rule of law, individual liberty, and mutual respect and tolerance. These values underpin British society and are essential for successful integration.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 28,
        }
      ];

      await db.insert(bookChunks).values(chunks);
      console.log(`Added ${chunks.length} content chunks`);

      // Add more topics
      const topics = [
        {
          bookId: newBook.id,
          title: 'UK Government Structure',
          description: 'Understanding the UK government and political system',
          chapterNumber: 1,
          orderIndex: 1,
          difficulty: 'intermediate',
          prerequisites: 'Basic understanding of democracy',
          keyPoints: ['Constitutional monarchy', 'Parliament structure', 'Prime Minister role', 'House of Commons', 'House of Lords'],
          content: 'The UK operates as a constitutional monarchy with a parliamentary democracy. The monarch is Head of State, while the Prime Minister is Head of Government.'
        },
        {
          bookId: newBook.id,
          title: 'British History - Key Dates',
          description: 'Important dates in British history for the citizenship test',
          chapterNumber: 2,
          orderIndex: 2,
          difficulty: 'intermediate',
          prerequisites: 'Interest in British history',
          keyPoints: ['1066 Norman Conquest', '1215 Magna Carta', '1707 Act of Union', '1750 Industrial Revolution', '1948 NHS'],
          content: 'Key historical events that shaped modern Britain, from the Norman Conquest to the establishment of the NHS.'
        },
        {
          bookId: newBook.id,
          title: 'UK Geography and Demographics',
          description: 'Understanding the UK\'s geography and population',
          chapterNumber: 3,
          orderIndex: 3,
          difficulty: 'beginner',
          prerequisites: 'None',
          keyPoints: ['Four countries', 'Population 67 million', 'Capital cities', 'Major cities', 'Landscapes'],
          content: 'The UK consists of four countries with distinct cultures and histories, each contributing to the rich diversity of British society.'
        },
        {
          bookId: newBook.id,
          title: 'British Values and Society',
          description: 'Core values that underpin British society',
          chapterNumber: 4,
          orderIndex: 4,
          difficulty: 'beginner',
          prerequisites: 'None',
          keyPoints: ['Democracy', 'Rule of law', 'Individual liberty', 'Mutual respect', 'Tolerance'],
          content: 'British values form the foundation of UK society and are essential for successful integration and citizenship.'
        }
      ];

      await db.insert(generatedTopics).values(topics);
      console.log(`Added ${topics.length} topics`);

      // Add more tests
      const tests = [
        {
          bookId: newBook.id,
          title: 'UK Government Test',
          description: 'Test your knowledge of UK government structure',
          testType: 'multiple_choice',
          questions: [
            {
              question: 'What type of government does the UK have?',
              options: ['Republic', 'Constitutional monarchy', 'Absolute monarchy', 'Dictatorship'],
              correctAnswer: 1,
              explanation: 'The UK is a constitutional monarchy where the monarch is Head of State but power is limited by a constitution.'
            },
            {
              question: 'Who is the Head of Government in the UK?',
              options: ['The Monarch', 'The Prime Minister', 'The Speaker', 'The Lord Chancellor'],
              correctAnswer: 1,
              explanation: 'The Prime Minister is the Head of Government, while the Monarch is the Head of State.'
            },
            {
              question: 'How many MPs are there in the House of Commons?',
              options: ['600', '650', '700', '750'],
              correctAnswer: 1,
              explanation: 'There are 650 Members of Parliament in the House of Commons.'
            }
          ],
          difficulty: 'intermediate',
          timeLimit: 15,
          passingScore: 70
        },
        {
          bookId: newBook.id,
          title: 'British History Test',
          description: 'Test your knowledge of key British historical events',
          testType: 'multiple_choice',
          questions: [
            {
              question: 'In which year did the Norman Conquest take place?',
              options: ['1065', '1066', '1067', '1068'],
              correctAnswer: 1,
              explanation: 'The Norman Conquest occurred in 1066 when William the Conqueror defeated Harold II at the Battle of Hastings.'
            },
            {
              question: 'When was the Magna Carta signed?',
              options: ['1214', '1215', '1216', '1217'],
              correctAnswer: 1,
              explanation: 'The Magna Carta was signed by King John in 1215, establishing the principle that the king was subject to the law.'
            },
            {
              question: 'When was the NHS established?',
              options: ['1947', '1948', '1949', '1950'],
              correctAnswer: 1,
              explanation: 'The NHS was established in 1948, providing free healthcare to all UK residents.'
            }
          ],
          difficulty: 'intermediate',
          timeLimit: 15,
          passingScore: 70
        }
      ];

      await db.insert(generatedTests).values(tests);
      console.log(`Added ${tests.length} tests`);

      // Update book as processed
      await db.update(books)
        .set({ 
          isProcessed: true, 
          totalChunks: chunks.length,
          updatedAt: new Date()
        })
        .where(eq(books.id, newBook.id));

      console.log('\n✅ RAG System Enhanced Successfully!');
      console.log('📊 Summary:');
      console.log(`   - Content chunks: ${chunks.length}`);
      console.log(`   - Topics: ${topics.length}`);
      console.log(`   - Tests: ${tests.length}`);
      
    } else {
      console.log('Books already exist. Adding more content to existing books...');
      
      // Add more chunks to existing books
      const bookId = existingBooks[0].id;
      
      const additionalChunks = [
        {
          bookId: bookId,
          chunkIndex: 10,
          content: 'The English Civil War (1642-1651) was fought between Parliamentarians and Royalists. It resulted in the execution of Charles I and the establishment of a republic under Oliver Cromwell.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 35,
        },
        {
          bookId: bookId,
          chunkIndex: 11,
          content: 'The Glorious Revolution of 1688 saw William of Orange and Mary become joint monarchs, establishing constitutional monarchy and limiting royal power.',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          tokenCount: 30,
        }
      ];

      await db.insert(bookChunks).values(additionalChunks);
      console.log(`Added ${additionalChunks.length} additional chunks`);
    }
    
    console.log('\n🎉 RAG system content enhanced!');
    console.log('💡 The system now has more content to work with for generating questions and study materials.');
    
  } catch (error) {
    console.error('❌ Error enhancing RAG system:', error);
    console.error(error);
  }
}

// Run the enhancement
populateMoreContent();
