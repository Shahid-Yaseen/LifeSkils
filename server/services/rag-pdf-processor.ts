import OpenAI from 'openai';
import { db } from '../db';
import { books, bookChunks, generatedTopics, generatedTests } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PDFProcessingResult {
  bookId: string;
  totalChunks: number;
  topics: any[];
  tests: any[];
}

export class RAGPDFProcessor {
  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to extract text from PDF: ${filePath}`);
    }
  }

  private async chunkText(text: string, chunkSize: number = 2000, overlap: number = 200): Promise<string[]> {
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
      start = start + chunk.length - overlap;
    }
    
    return chunks.filter(chunk => chunk.length > 100); // Filter out very small chunks
  }

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

  private async extractTopicsFromBook(bookContent: string, bookTitle: string): Promise<any[]> {
    try {
      const prompt = `
        Analyze the following Life in the UK test study material and extract key topics and chapters.
        Book Title: ${bookTitle}
        
        Content: ${bookContent.substring(0, 4000)}...
        
        Please provide a structured list of topics with:
        1. Title
        2. Description
        3. Chapter number (if applicable)
        4. Key points (array of important facts)
        5. Difficulty level (beginner/intermediate/advanced)
        6. Prerequisites (what should be known before studying this topic)
        
        Focus on topics that are commonly tested in the Life in the UK test.
        Return the response as a JSON array of objects.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in UK citizenship test preparation. Extract educational topics from study materials with focus on testable content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const topicsText = response.choices[0].message.content;
      return JSON.parse(topicsText || '[]');
    } catch (error) {
      console.error('Error extracting topics:', error);
      return [];
    }
  }

  private async generateTestsFromBook(bookContent: string, bookTitle: string): Promise<any[]> {
    try {
      const prompt = `
        Generate practice test questions based on the following Life in the UK test study material.
        Book Title: ${bookTitle}
        
        Content: ${bookContent.substring(0, 4000)}...
        
        Create 10 multiple choice questions with:
        1. Question text
        2. 4 answer options (A, B, C, D)
        3. Correct answer (A, B, C, or D)
        4. Explanation of why the answer is correct
        5. Difficulty level (beginner/intermediate/advanced)
        
        Focus on facts, dates, laws, and important information that appears on the actual Life in the UK test.
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
      const questions = JSON.parse(questionsText || '[]');
      
      return [{
        title: `Practice Test - ${bookTitle}`,
        description: `Generated practice test based on ${bookTitle}`,
        testType: 'multiple_choice',
        questions: questions,
        difficulty: 'intermediate',
        timeLimit: 45,
        passingScore: 70
      }];
    } catch (error) {
      console.error('Error generating tests:', error);
      return [];
    }
  }

  public async processPDF(filePath: string, bookTitle: string, author?: string): Promise<PDFProcessingResult> {
    try {
      console.log(`Processing PDF: ${filePath}`);
      
      // Extract text from PDF
      const fullText = await this.extractTextFromPDF(filePath);
      console.log(`Extracted ${fullText.length} characters from PDF`);
      
      // Create book record
      const [book] = await db.insert(books).values({
        title: bookTitle,
        author: author || 'Unknown',
        filePath: filePath,
        totalPages: Math.ceil(fullText.length / 2000), // Rough estimate
        isProcessed: false,
      }).returning();

      // Chunk the text
      const chunks = await this.chunkText(fullText);
      console.log(`Created ${chunks.length} chunks`);
      
      // Process chunks in batches to avoid memory issues
      const batchSize = 5;
      const chunkData: any[] = [];
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(chunks.length / batchSize)}`);
        
        const batchPromises = batch.map(async (chunk, batchIndex) => {
          const globalIndex = i + batchIndex;
          const embedding = await this.generateEmbedding(chunk);
          return {
            bookId: book.id,
            chunkIndex: globalIndex,
            content: chunk,
            embedding: JSON.stringify(embedding),
            tokenCount: chunk.split(' ').length,
          };
        });

        const batchData = await Promise.all(batchPromises);
        chunkData.push(...batchData);
        
        // Small delay between batches to prevent rate limiting
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Insert chunks into database
      await db.insert(bookChunks).values(chunkData);
      console.log(`Inserted ${chunkData.length} chunks into database`);
      
      // Extract topics
      const topics = await this.extractTopicsFromBook(fullText, bookTitle);
      console.log(`Extracted ${topics.length} topics`);
      
      // Insert topics
      const topicPromises = topics.map(async (topic, index) => {
        const [insertedTopic] = await db.insert(generatedTopics).values({
          bookId: book.id,
          title: topic.title,
          description: topic.description,
          chapterNumber: topic.chapterNumber,
          orderIndex: index,
          difficulty: topic.difficulty || 'intermediate',
          prerequisites: topic.prerequisites,
          keyPoints: topic.keyPoints || [],
          content: topic.content,
        }).returning();
        return insertedTopic;
      });

      const insertedTopics = await Promise.all(topicPromises);
      
      // Generate tests
      const tests = await this.generateTestsFromBook(fullText, bookTitle);
      console.log(`Generated ${tests.length} tests`);
      
      // Insert tests
      const testPromises = tests.map(async (test) => {
        const [insertedTest] = await db.insert(generatedTests).values({
          bookId: book.id,
          title: test.title,
          description: test.description,
          testType: test.testType,
          questions: test.questions,
          difficulty: test.difficulty,
          timeLimit: test.timeLimit,
          passingScore: test.passingScore,
        }).returning();
        return insertedTest;
      });

      const insertedTests = await Promise.all(testPromises);
      
      // Update book as processed
      await db.update(books)
        .set({ 
          isProcessed: true, 
          totalChunks: chunks.length,
          updatedAt: new Date()
        })
        .where(eq(books.id, book.id));

      console.log(`Successfully processed book: ${bookTitle}`);
      
      return {
        bookId: book.id,
        totalChunks: chunks.length,
        topics: insertedTopics,
        tests: insertedTests,
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }

  public async processAllPDFsInDirectory(directoryPath: string): Promise<PDFProcessingResult[]> {
    try {
      const files = fs.readdirSync(directoryPath);
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
      
      console.log(`Found ${pdfFiles.length} PDF files to process`);
      
      const results: PDFProcessingResult[] = [];
      
      for (const pdfFile of pdfFiles) {
        const filePath = path.join(directoryPath, pdfFile);
        const bookTitle = pdfFile.replace('.pdf', '').replace(/-/g, ' ');
        
        try {
          const result = await this.processPDF(filePath, bookTitle);
          results.push(result);
        } catch (error) {
          console.error(`Failed to process ${pdfFile}:`, error);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error processing PDFs from directory:', error);
      throw error;
    }
  }

  public async searchSimilarContent(query: string, limit: number = 5): Promise<any[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // This would require a vector similarity search in PostgreSQL with pgvector
      // For now, we'll do a simple text search
      const chunks = await db.select()
        .from(bookChunks)
        .limit(limit);
      
      // Calculate similarity (simplified - in production, use pgvector)
      const results = chunks.map(chunk => ({
        ...chunk,
        similarity: 0.8, // Placeholder
      }));
      
      return results;
    } catch (error) {
      console.error('Error searching similar content:', error);
      return [];
    }
  }
}

export const ragPDFProcessor = new RAGPDFProcessor();
