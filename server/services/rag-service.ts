import OpenAI from 'openai';
import pdf from 'pdf-parse';
import { db } from '../db';
import { books, bookChunks, generatedTopics, generatedTests, timelineEvents } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

export class RAGService {
  // Process PDF book and create chunks with embeddings
  async processBook(filePath: string, bookData: {
    title: string;
    author?: string;
    isbn?: string;
    description?: string;
  }) {
    try {
      // Create book record
      const [book] = await db.insert(books).values({
        ...bookData,
        filePath,
        isProcessed: false,
      }).returning();

      // Extract text from PDF
      const pdfBuffer = await this.readFile(filePath);
      const pdfData = await pdf(pdfBuffer);
      const text = pdfData.text;

      // Split text into chunks
      const chunks = this.splitTextIntoChunks(text, 1500); // ~1500 tokens per chunk

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Generate embedding for the chunk
        const embedding = await this.generateEmbedding(chunk.content);
        
        // Save chunk to database
        await db.insert(bookChunks).values({
          bookId: book.id,
          chunkIndex: i,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chapterTitle: chunk.chapterTitle || null,
          sectionTitle: chunk.sectionTitle || null,
          embedding: JSON.stringify(embedding),
          tokenCount: chunk.tokenCount,
        });
      }

      // Update book as processed
      await db.update(books)
        .set({ 
          isProcessed: true, 
          totalChunks: chunks.length,
          totalPages: pdfData.numpages 
        })
        .where(eq(books.id, book.id));

      return { book, chunksProcessed: chunks.length };
    } catch (error) {
      console.error('Error processing book:', error);
      throw error;
    }
  }

  // Generate topics from book content
  async generateTopics(bookId: string, query?: string) {
    try {
      const book = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
      if (!book.length) throw new Error('Book not found');

      // Get relevant chunks based on query or all chunks
      let relevantChunks;
      if (query) {
        relevantChunks = await this.retrieveRelevantChunks(bookId, query, 10);
      } else {
        relevantChunks = await db.select()
          .from(bookChunks)
          .where(eq(bookChunks.bookId, bookId))
          .orderBy(bookChunks.chunkIndex)
          .limit(20);
      }

      const chunksText = relevantChunks.map(chunk => chunk.content).join('\n\n');

      const prompt = `You are an educational content expert. Based ONLY on the provided book excerpts, create a comprehensive list of topics and subtopics that would be suitable for a learning curriculum.

BOOK EXCERPTS:
${chunksText}

TASK:
Create a structured list of topics with the following format:
- Main Topic 1
  - Subtopic 1.1
  - Subtopic 1.2
- Main Topic 2
  - Subtopic 2.1
  - Subtopic 2.2

For each topic, provide:
1. A clear, educational title
2. A brief description
3. Difficulty level (beginner/intermediate/advanced)
4. Prerequisites (what students should know before)
5. Key points to cover

IMPORTANT: Only use information from the provided excerpts. If information is not available in the excerpts, do not include it.

Return the response as a JSON array of objects with this structure:
[
  {
    "title": "Topic Title",
    "description": "Brief description",
    "difficulty": "beginner|intermediate|advanced",
    "prerequisites": "What students should know",
    "keyPoints": ["Point 1", "Point 2", "Point 3"],
    "chapterNumber": 1,
    "orderIndex": 1
  }
]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const topicsData = JSON.parse(response.choices[0].message.content || '[]');

      // Save topics to database
      const savedTopics = [];
      for (const topicData of topicsData) {
        const [topic] = await db.insert(generatedTopics).values({
          bookId,
          ...topicData,
        }).returning();
        savedTopics.push(topic);
      }

      return savedTopics;
    } catch (error) {
      console.error('Error generating topics:', error);
      throw error;
    }
  }

  // Generate content for a specific topic
  async generateTopicContent(topicId: string) {
    try {
      const topic = await db.select()
        .from(generatedTopics)
        .where(eq(generatedTopics.id, topicId))
        .limit(1);

      if (!topic.length) throw new Error('Topic not found');

      const bookId = topic[0].bookId;
      const topicTitle = topic[0].title;

      // Get relevant chunks for this topic
      const relevantChunks = await this.retrieveRelevantChunks(bookId, topicTitle, 5);
      const chunksText = relevantChunks.map(chunk => chunk.content).join('\n\n');

      const prompt = `You are an expert tutor. Create comprehensive educational content for the topic "${topicTitle}" based ONLY on the provided book excerpts.

BOOK EXCERPTS:
${chunksText}

TASK:
Create detailed educational content that includes:
1. Clear explanation of the topic
2. Key concepts and definitions
3. Examples and illustrations
4. Step-by-step explanations where applicable
5. Important points to remember
6. Common misconceptions to avoid

IMPORTANT: 
- Only use information from the provided excerpts
- If the answer is not in the provided excerpts, reply: "Content not found in the book"
- Make the content educational and easy to understand
- Use clear, simple language
- Structure the content logically

Return the content as a well-formatted educational explanation.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || 'Content not found in the book';

      // Update topic with generated content
      await db.update(generatedTopics)
        .set({ content })
        .where(eq(generatedTopics.id, topicId));

      return content;
    } catch (error) {
      console.error('Error generating topic content:', error);
      throw error;
    }
  }

  // Generate test questions for a topic
  async generateTest(topicId: string, testType: 'multiple_choice' | 'short_answer' | 'fill_blank' | 'essay', difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') {
    try {
      const topic = await db.select()
        .from(generatedTopics)
        .where(eq(generatedTopics.id, topicId))
        .limit(1);

      if (!topic.length) throw new Error('Topic not found');

      const bookId = topic[0].bookId;
      const topicTitle = topic[0].title;

      // Get relevant chunks for this topic
      const relevantChunks = await this.retrieveRelevantChunks(bookId, topicTitle, 5);
      const chunksText = relevantChunks.map(chunk => chunk.content).join('\n\n');

      const prompt = `You are an expert test creator. Generate ${testType} questions for the topic "${topicTitle}" based ONLY on the provided book excerpts.

BOOK EXCERPTS:
${chunksText}

TASK:
Create ${testType} questions with the following requirements:
- Difficulty level: ${difficulty}
- Number of questions: 5-10 depending on topic complexity
- Each question should test understanding, not just memorization
- Questions should be clear and unambiguous
- Include answer keys with explanations

IMPORTANT: 
- Only use information from the provided excerpts
- If there's insufficient information for questions, reply: "Insufficient content in book for test generation"
- Make questions educational and fair
- Avoid trick questions

Return the response as a JSON object with this structure:
{
  "title": "Test Title",
  "description": "Brief description of the test",
  "questions": [
    {
      "question": "Question text",
      "type": "${testType}",
      "options": ["Option A", "Option B", "Option C", "Option D"], // for multiple choice
      "correctAnswer": "Correct answer",
      "explanation": "Why this is correct"
    }
  ],
  "timeLimit": 30, // in minutes
  "passingScore": 70
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const testData = JSON.parse(response.choices[0].message.content || '{}');

      if (testData.questions && testData.questions.length > 0) {
        // Save test to database
        const [test] = await db.insert(generatedTests).values({
          bookId,
          topicId,
          title: testData.title || `Test for ${topicTitle}`,
          description: testData.description,
          testType,
          questions: testData.questions,
          difficulty,
          timeLimit: testData.timeLimit || 30,
          passingScore: testData.passingScore || 70,
        }).returning();

        return test;
      } else {
        throw new Error('Insufficient content in book for test generation');
      }
    } catch (error) {
      console.error('Error generating test:', error);
      throw error;
    }
  }

  // Retrieve relevant chunks using semantic search
  private async retrieveRelevantChunks(bookId: string, query: string, limit: number = 5) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // For now, we'll do a simple text search
      // In production, you'd use vector similarity search with pgvector
      const chunks = await db.select()
        .from(bookChunks)
        .where(eq(bookChunks.bookId, bookId))
        .limit(limit * 2); // Get more chunks for better selection

      // Simple relevance scoring based on text similarity
      const scoredChunks = chunks.map(chunk => ({
        ...chunk,
        relevanceScore: this.calculateTextSimilarity(query, chunk.content)
      }));

      // Sort by relevance and return top chunks
      return scoredChunks
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error retrieving relevant chunks:', error);
      return [];
    }
  }

  // Generate embedding using OpenAI
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // Split text into chunks
  private splitTextIntoChunks(text: string, maxTokens: number) {
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const word of words) {
      const wordTokens = Math.ceil(word.length / 4); // Rough token estimation
      
      if (currentTokens + wordTokens > maxTokens && currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          chunkIndex: chunkIndex++,
          tokenCount: currentTokens,
          pageNumber: Math.floor(chunkIndex / 10) + 1, // Rough page estimation
          chapterTitle: null,
          sectionTitle: null,
        });
        currentChunk = word + ' ';
        currentTokens = wordTokens;
      } else {
        currentChunk += word + ' ';
        currentTokens += wordTokens;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        chunkIndex: chunkIndex,
        tokenCount: currentTokens,
        pageNumber: Math.floor(chunkIndex / 10) + 1,
        chapterTitle: null,
        sectionTitle: null,
      });
    }

    return chunks;
  }

  // Calculate text similarity (simple implementation)
  private calculateTextSimilarity(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word of queryWords) {
      if (textWords.includes(word)) {
        matches++;
      }
    }
    
    return matches / queryWords.length;
  }

  // Extract timeline events from book content
  async extractTimelineEvents(bookId: string) {
    try {
      const book = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
      if (!book.length) throw new Error('Book not found');

      // Get all chunks from the book
      const chunks = await db.select()
        .from(bookChunks)
        .where(eq(bookChunks.bookId, bookId))
        .orderBy(bookChunks.chunkIndex);

      const chunksText = chunks.map(chunk => chunk.content).join('\n\n');

      const prompt = `You are a historical content expert. Extract ALL historical events, dates, and significant moments from this book content.

BOOK CONTENT:
${chunksText}

TASK:
Extract every historical event, date, and significant moment mentioned in this content. For each event, provide:

1. Event title (clear, descriptive)
2. Date/year (be as specific as possible)
3. Description (what happened)
4. Historical significance (why it matters)
5. Chapter/page reference if available

IMPORTANT:
- Extract EVERY historical event mentioned, no matter how small
- Include dates, years, centuries, periods
- Include political, social, cultural, economic events
- Include wars, treaties, discoveries, inventions
- Include important people and their achievements
- Be comprehensive - don't miss anything

Return as JSON array with this structure:
[
  {
    "title": "Event Title",
    "date": "1066",
    "description": "What happened",
    "significance": "Why it's important",
    "chapter_reference": "Chapter 3",
    "page_number": 45
  }
]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const eventsData = JSON.parse(response.choices[0].message.content || '[]');

      // Save events to database
      const savedEvents = [];
      for (const eventData of eventsData) {
        const [event] = await db.insert(timelineEvents).values({
          bookId,
          title: eventData.title,
          date: eventData.date,
          description: eventData.description,
          significance: eventData.significance,
          chapterReference: eventData.chapter_reference,
          pageNumber: eventData.page_number,
          bookContent: eventData.description, // Store the extracted content
          sourceBook: book[0].title,
        }).returning();
        savedEvents.push(event);
      }

      return savedEvents;
    } catch (error) {
      console.error('Error extracting timeline events:', error);
      throw error;
    }
  }

  // Get timeline events for dashboard
  async getTimelineEvents(bookId?: string) {
    try {
      let whereClause = eq(timelineEvents.id, timelineEvents.id); // Placeholder
      
      if (bookId) {
        whereClause = and(whereClause, eq(timelineEvents.bookId, bookId));
      }

      const events = await db.select()
        .from(timelineEvents)
        .where(whereClause)
        .orderBy(timelineEvents.date);

      return events;
    } catch (error) {
      console.error('Error getting timeline events:', error);
      throw error;
    }
  }

  // Update existing timeline with book content
  async updateTimelineWithBookContent() {
    try {
      // Get all existing timeline events from static data
      const staticEvents = [
        { id: 'stone-age', title: 'Early Stone Age Settlements', date: '8000 BC' },
        { id: 'roman-invasion', title: 'Roman Invasion', date: '43 AD' },
        { id: 'norman-conquest', title: 'Norman Conquest', date: '1066' },
        { id: 'magna-carta', title: 'Magna Carta', date: '1215' },
        { id: 'hundred-years-war', title: 'Hundred Years War', date: '1337-1453' },
        { id: 'tudor-dynasty', title: 'Tudor Dynasty', date: '1485-1603' },
        { id: 'english-civil-war', title: 'English Civil War', date: '1642-1651' },
        { id: 'glorious-revolution', title: 'Glorious Revolution', date: '1688' },
        { id: 'industrial-revolution', title: 'Industrial Revolution', date: '1760-1840' },
        { id: 'world-war-1', title: 'World War I', date: '1914-1918' },
        { id: 'world-war-2', title: 'World War II', date: '1939-1945' },
        { id: 'welfare-state', title: 'Welfare State Creation', date: '1945' },
        { id: 'european-union', title: 'European Union Membership', date: '1973' },
        { id: 'devolution', title: 'Devolution to Scotland and Wales', date: '1997' },
        { id: 'brexit', title: 'Brexit Referendum', date: '2016' }
      ];

      // Get all books
      const allBooks = await db.select().from(books).where(eq(books.isProcessed, true));
      
      // For each static event, find relevant book content
      for (const staticEvent of staticEvents) {
        let bestContent = '';
        let bestBook = '';
        let bestChapter = '';

        for (const book of allBooks) {
          // Get chunks related to this event
          const relevantChunks = await this.retrieveRelevantChunks(staticEvent.title, book.id, 3);
          
          if (relevantChunks.length > 0) {
            const chunksText = relevantChunks.map(chunk => chunk.content).join('\n\n');
            
            const prompt = `Find the most relevant and educational content about "${staticEvent.title}" from this book content.

BOOK CONTENT:
${chunksText}

EVENT: ${staticEvent.title} (${staticEvent.date})

TASK:
Extract the most relevant, educational, and student-friendly content about this event. Make it:
- Clear and easy to understand
- Educational and informative
- Based strictly on the book content
- Better than generic descriptions

Return only the best content, nothing else.`;

            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
              });

              const extractedContent = response.choices[0].message.content || '';
              
              if (extractedContent.length > bestContent.length) {
                bestContent = extractedContent;
                bestBook = book.title;
                bestChapter = relevantChunks[0].chapterTitle || 'Unknown Chapter';
              }
            } catch (error) {
              console.error(`Error processing event ${staticEvent.title} for book ${book.title}:`, error);
            }
          }
        }

        // Update or create timeline event with book content
        if (bestContent) {
          await db.insert(timelineEvents).values({
            originalEventId: staticEvent.id,
            title: staticEvent.title,
            date: staticEvent.date,
            description: bestContent,
            significance: `Source: ${bestBook} - ${bestChapter}`,
            bookContent: bestContent,
            sourceBook: bestBook,
            chapterReference: bestChapter,
          }).onConflictDoUpdate({
            target: timelineEvents.originalEventId,
            set: {
              description: bestContent,
              significance: `Source: ${bestBook} - ${bestChapter}`,
              bookContent: bestContent,
              sourceBook: bestBook,
              chapterReference: bestChapter,
            }
          });
        }
      }

      return { success: true, message: 'Timeline updated with book content' };
    } catch (error) {
      console.error('Error updating timeline with book content:', error);
      throw error;
    }
  }

  // Read file from path
  private async readFile(filePath: string): Promise<Buffer> {
    const fs = await import('fs/promises');
    return await fs.readFile(filePath);
  }
}

export const ragService = new RAGService();
