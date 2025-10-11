import OpenAI from 'openai';
import { db } from '../db';
import { books, bookChunks, generatedTopics, generatedTests } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class RAGContentGenerator {
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  private async findRelevantChunks(query: string, limit: number = 5): Promise<any[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // For now, we'll get all chunks and do a simple text search
      // In production, you'd use pgvector for proper similarity search
      const allChunks = await db.select()
        .from(bookChunks)
        .orderBy(desc(bookChunks.createdAt))
        .limit(limit * 3); // Get more chunks for better filtering
      
      // Simple text similarity (in production, use vector similarity)
      const relevantChunks = allChunks.filter(chunk => 
        chunk.content.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().split(' ').some(word => 
          chunk.content.toLowerCase().includes(word)
        )
      ).slice(0, limit);
      
      return relevantChunks;
    } catch (error) {
      console.error('Error finding relevant chunks:', error);
      return [];
    }
  }

  public async generateTimelineContent(topic: string): Promise<any> {
    try {
      console.log(`Generating timeline content for topic: ${topic}`);
      
      // Find relevant content from the books
      const relevantChunks = await this.findRelevantChunks(topic, 5);
      
      if (relevantChunks.length === 0) {
        throw new Error('No relevant content found for the topic');
      }
      
      // Combine relevant content
      const contextContent = relevantChunks.map(chunk => chunk.content).join('\n\n');
      
      const prompt = `
        Based on the following Life in the UK test study material, create a comprehensive timeline entry for the topic: "${topic}"
        
        Study Material Context:
        ${contextContent}
        
        Please create a timeline entry with:
        1. Title (clear and specific)
        2. Year/Date (if available)
        3. Description (2-3 sentences explaining what happened)
        4. Details (more comprehensive explanation)
        5. Category (parliament, documents, voting_rights, territories, trades, etc.)
        6. Importance (1-5 scale, where 5 is most important)
        7. Key Figures (notable people involved)
        8. Timeline Topic (which timeline this belongs to)
        
        Focus on accuracy and testable information that would appear on the Life in the UK test.
        Make sure the content is historically accurate and educationally valuable.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in UK history and citizenship test preparation. Create accurate, educational timeline entries based on official study materials.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const timelineContent = response.choices[0].message.content;
      
      // Parse the response to extract structured data
      try {
        // Clean up the response to extract JSON
        let cleanText = timelineContent || '{}';
        
        // Remove markdown code blocks if present
        if (cleanText.includes('```json')) {
          cleanText = cleanText.split('```json')[1].split('```')[0];
        } else if (cleanText.includes('```')) {
          cleanText = cleanText.split('```')[1].split('```')[0];
        }
        
        const parsedContent = JSON.parse(cleanText);
        return {
          title: parsedContent.title || topic,
          year: parsedContent.year || new Date().getFullYear(),
          description: parsedContent.description || '',
          details: parsedContent.details || '',
          category: parsedContent.category || 'general',
          importance: parsedContent.importance || 3,
          keyFigures: parsedContent.keyFigures || '',
          timelineTopic: parsedContent.timelineTopic || 'uk_history',
          rawContent: timelineContent
        };
      } catch (parseError) {
        // If JSON parsing fails, return the raw content
        return {
          title: topic,
          year: new Date().getFullYear(),
          description: timelineContent || '',
          details: timelineContent || '',
          category: 'general',
          importance: 3,
          keyFigures: '',
          timelineTopic: 'uk_history',
          rawContent: timelineContent
        };
      }
    } catch (error) {
      console.error('Error generating timeline content:', error);
      throw error;
    }
  }

  public async generatePracticeQuestions(topic: string, difficulty: string = 'intermediate'): Promise<any[]> {
    try {
      console.log(`Generating practice questions for topic: ${topic}`);
      
      // Find relevant content from the books
      const relevantChunks = await this.findRelevantChunks(topic, 5);
      
      if (relevantChunks.length === 0) {
        throw new Error('No relevant content found for the topic');
      }
      
      // Combine relevant content
      const contextContent = relevantChunks.map(chunk => chunk.content).join('\n\n');
      
      const prompt = `
        Based on the following Life in the UK test study material, generate 5 practice questions for the topic: "${topic}"
        Difficulty Level: ${difficulty}
        
        Study Material Context:
        ${contextContent}
        
        Create 5 multiple choice questions with:
        1. Question text (clear and specific)
        2. 4 answer options (A, B, C, D)
        3. Correct answer (A, B, C, or D)
        4. Explanation (why the answer is correct)
        5. Difficulty level (beginner/intermediate/advanced)
        
        Focus on facts, dates, laws, and important information that appears on the actual Life in the UK test.
        Make sure questions are accurate and testable.
        Return the response as a JSON array of question objects.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in creating Life in the UK test questions. Generate accurate, testable questions based on official study materials.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const questionsText = response.choices[0].message.content;
      
      try {
        // Clean up the response to extract JSON
        let cleanText = questionsText || '[]';
        
        // Remove markdown code blocks if present
        if (cleanText.includes('```json')) {
          const jsonStart = cleanText.indexOf('```json') + 7;
          const jsonEnd = cleanText.indexOf('```', jsonStart);
          if (jsonEnd > jsonStart) {
            cleanText = cleanText.substring(jsonStart, jsonEnd).trim();
          }
        } else if (cleanText.includes('```')) {
          const codeStart = cleanText.indexOf('```') + 3;
          const codeEnd = cleanText.indexOf('```', codeStart);
          if (codeEnd > codeStart) {
            cleanText = cleanText.substring(codeStart, codeEnd).trim();
          }
        }
        
        const questions = JSON.parse(cleanText);
        return questions;
      } catch (parseError) {
        console.error('Error parsing questions JSON:', parseError);
        console.error('Raw response:', questionsText);
        console.error('Cleaned text:', cleanText);
        return [];
      }
    } catch (error) {
      console.error('Error generating practice questions:', error);
      throw error;
    }
  }

  public async generateStudyGuide(topic: string): Promise<any> {
    try {
      console.log(`Generating study guide for topic: ${topic}`);
      
      // Find relevant content from the books
      const relevantChunks = await this.findRelevantChunks(topic, 8);
      
      if (relevantChunks.length === 0) {
        throw new Error('No relevant content found for the topic');
      }
      
      // Combine relevant content
      const contextContent = relevantChunks.map(chunk => chunk.content).join('\n\n');
      
      const prompt = `
        Based on the following Life in the UK test study material, create a comprehensive study guide for the topic: "${topic}"
        
        Study Material Context:
        ${contextContent}
        
        Create a study guide with:
        1. Overview (brief introduction to the topic)
        2. Key Facts (important facts and figures)
        3. Important Dates (if applicable)
        4. Key People (notable figures involved)
        5. Key Concepts (important ideas and principles)
        6. Test Tips (what to focus on for the exam)
        7. Practice Points (what to study and remember)
        
        Make the content clear, accurate, and focused on what students need to know for the Life in the UK test.
        Use bullet points and clear headings for easy reading.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in UK citizenship test preparation. Create comprehensive, accurate study guides based on official materials.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const studyGuide = response.choices[0].message.content;
      
      return {
        topic: topic,
        content: studyGuide,
        generatedAt: new Date().toISOString(),
        sourceChunks: relevantChunks.length
      };
    } catch (error) {
      console.error('Error generating study guide:', error);
      throw error;
    }
  }

  public async getAvailableTopics(): Promise<string[]> {
    try {
      const topics = await db.select({
        title: generatedTopics.title,
        description: generatedTopics.description,
        difficulty: generatedTopics.difficulty
      })
      .from(generatedTopics)
      .orderBy(desc(generatedTopics.createdAt));
      
      return topics.map(topic => topic.title);
    } catch (error) {
      console.error('Error getting available topics:', error);
      return [];
    }
  }

  public async getBookStats(): Promise<any> {
    try {
      const stats = await db.select({
        totalBooks: books.id,
        totalChunks: bookChunks.id,
        totalTopics: generatedTopics.id,
        totalTests: generatedTests.id
      })
      .from(books)
      .leftJoin(bookChunks, eq(books.id, bookChunks.bookId))
      .leftJoin(generatedTopics, eq(books.id, generatedTopics.bookId))
      .leftJoin(generatedTests, eq(books.id, generatedTests.bookId));
      
      return {
        totalBooks: stats.length,
        totalChunks: stats.reduce((sum, stat) => sum + (stat.totalChunks ? 1 : 0), 0),
        totalTopics: stats.reduce((sum, stat) => sum + (stat.totalTopics ? 1 : 0), 0),
        totalTests: stats.reduce((sum, stat) => sum + (stat.totalTests ? 1 : 0), 0)
      };
    } catch (error) {
      console.error('Error getting book stats:', error);
      return { totalBooks: 0, totalChunks: 0, totalTopics: 0, totalTests: 0 };
    }
  }
}

export const ragContentGenerator = new RAGContentGenerator();
