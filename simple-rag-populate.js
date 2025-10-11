// Simple script to populate RAG system with basic data
import { db } from './server/db.ts';
import { books, bookChunks, generatedTopics, generatedTests } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function populateRAG() {
  try {
    console.log('🚀 Starting simple RAG population...');
    
    // Create a simple book record
    const [book] = await db.insert(books).values({
      title: 'Life in UK Test Study Guide',
      author: 'Official Study Materials',
      description: 'Comprehensive study materials for the Life in UK test',
      filePath: '/client/public/assets/',
      totalPages: 10,
      totalChunks: 0,
      isProcessed: false,
    }).returning();

    console.log(`📚 Created book: ${book.id}`);
    
    // Create some basic chunks
    const chunks = [
      {
        bookId: book.id,
        chunkIndex: 0,
        content: 'The UK is a constitutional monarchy with a parliamentary democracy. The monarch is the Head of State, while the Prime Minister is the Head of Government.',
        embedding: JSON.stringify([0.1, 0.2, 0.3]),
        tokenCount: 25,
      },
      {
        bookId: book.id,
        chunkIndex: 1,
        content: 'The Norman Conquest took place in 1066 when William the Conqueror defeated Harold II at the Battle of Hastings.',
        embedding: JSON.stringify([0.1, 0.2, 0.3]),
        tokenCount: 20,
      },
      {
        bookId: book.id,
        chunkIndex: 2,
        content: 'The Magna Carta was signed in 1215 by King John, establishing the principle that the king was subject to the law.',
        embedding: JSON.stringify([0.1, 0.2, 0.3]),
        tokenCount: 22,
      }
    ];

    await db.insert(bookChunks).values(chunks);
    console.log(`📝 Inserted ${chunks.length} chunks`);

    // Create some topics
    const topics = [
      {
        bookId: book.id,
        title: 'UK Government Structure',
        description: 'Understanding the UK government and political system',
        chapterNumber: 1,
        orderIndex: 1,
        difficulty: 'intermediate',
        prerequisites: 'Basic understanding of democracy',
        keyPoints: ['Constitutional monarchy', 'Parliament structure', 'Prime Minister role'],
        content: 'The UK operates as a constitutional monarchy with a parliamentary democracy.'
      },
      {
        bookId: book.id,
        title: 'British History - Key Dates',
        description: 'Important dates in British history for the citizenship test',
        chapterNumber: 2,
        orderIndex: 2,
        difficulty: 'intermediate',
        prerequisites: 'Interest in British history',
        keyPoints: ['1066 Norman Conquest', '1215 Magna Carta', '1707 Act of Union'],
        content: 'Key historical events that shaped modern Britain.'
      }
    ];

    await db.insert(generatedTopics).values(topics);
    console.log(`📖 Created ${topics.length} topics`);

    // Create some tests
    const tests = [
      {
        bookId: book.id,
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
          }
        ],
        difficulty: 'intermediate',
        timeLimit: 15,
        passingScore: 70
      }
    ];

    await db.insert(generatedTests).values(tests);
    console.log(`📝 Created ${tests.length} tests`);

    // Update book as processed
    await db.update(books)
      .set({ 
        isProcessed: true, 
        totalChunks: chunks.length,
        updatedAt: new Date()
      })
      .where(eq(books.id, book.id));

    console.log('\n✅ Simple RAG System Population Complete!');
    console.log('📊 Summary:');
    console.log(`   - Books created: 1`);
    console.log(`   - Total chunks: ${chunks.length}`);
    console.log(`   - Topics created: ${topics.length}`);
    console.log(`   - Tests created: ${tests.length}`);
    
    console.log('\n🎉 RAG system is now ready!');
    console.log('💡 You can now use the /api/rag endpoints to generate content.');
    
  } catch (error) {
    console.error('❌ Error populating RAG system:', error);
    console.error(error);
  }
}

// Run the population
populateRAG();
