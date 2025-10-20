import OpenAI from 'openai';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'default_key'
});

export interface BookSummary {
  summaryText: string;
  chapterBreakdowns: Array<{
    chapterNumber: number;
    title: string;
    summary: string;
    keyPoints: string[];
  }>;
  keyTopics: string[];
  estimatedCounts: {
    tests: number;
    events: number;
    games: number;
  };
}

export interface GeneratedContent {
  tests: Array<{
    title: string;
    description: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
    difficulty: string;
    category: string;
  }>;
  timelineEvents: Array<{
    year: number;
    title: string;
    description: string;
    details: string;
    category: string;
    importance: number;
    keyFigures: string;
    timelineTopic: string;
  }>;
  games: Array<{
    title: string;
    description: string;
    category: string;
    gameType: string;
    difficulty: string;
    instructions: string;
    gameData: any;
  }>;
}

export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to extract text from file');
  }
}

export async function generateSummary(bookText: string, bookTitle: string): Promise<BookSummary> {
  try {
    console.log(`Generating summary for book: ${bookTitle}`);
    
    const textChunks = chunkText(bookText, 15000);
    const summaryPrompts = textChunks.map((chunk, index) => `
      Part ${index + 1} of ${textChunks.length}:
      ${chunk}
    `);

    const prompt = `You are an expert educational content analyst. Analyze the following book titled "${bookTitle}" and create a comprehensive summary.

${summaryPrompts.join('\n\n')}

Please provide a detailed analysis in the following JSON format:
{
  "summaryText": "A comprehensive 2-3 paragraph summary of the entire book",
  "chapterBreakdowns": [
    {
      "chapterNumber": 1,
      "title": "Chapter title",
      "summary": "Chapter summary",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "keyTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "estimatedCounts": {
    "tests": 5,
    "events": 10,
    "games": 3
  }
}

IMPORTANT:
1. Base ALL content strictly on the provided book text
2. Identify actual chapters and sections from the book
3. Extract real key topics and learning points
4. Estimate realistic counts based on the content depth
5. Ensure the summary captures the educational value`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content analyst. Analyze books and create structured summaries that can be used to generate educational content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const summary = JSON.parse(response.choices[0].message.content || '{}');
    console.log('Summary generated successfully');
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate book summary');
  }
}

export async function generateContentFromSummary(summary: BookSummary, bookTitle: string): Promise<GeneratedContent> {
  try {
    console.log('Generating content from summary...');

    const prompt = `You are an expert educational content creator. Based on the following book summary for "${bookTitle}", generate educational content including tests, timeline events, and games.

BOOK SUMMARY:
${JSON.stringify(summary, null, 2)}

Please generate content in the following JSON format:
{
  "tests": [
    {
      "title": "Test title based on chapter/topic",
      "description": "Test description",
      "questions": [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Why this answer is correct"
        }
      ],
      "difficulty": "intermediate",
      "category": "Category from book"
    }
  ],
  "timelineEvents": [
    {
      "year": 2024,
      "title": "Event title",
      "description": "Brief description",
      "details": "Detailed explanation",
      "category": "Category",
      "importance": 3,
      "keyFigures": "Key people involved",
      "timelineTopic": "Timeline category"
    }
  ],
  "games": [
    {
      "title": "Game title",
      "description": "Game description",
      "category": "true-false",
      "gameType": "true-false-quiz",
      "difficulty": "intermediate",
      "instructions": "How to play",
      "gameData": {
        "trueFalseQuestions": [
          {
            "id": "1",
            "statement": "Statement text",
            "isTrue": true,
            "explanation": "Explanation"
          }
        ]
      }
    }
  ]
}

CRITICAL RULES:
1. Generate ONLY content that is explicitly mentioned in the summary
2. Use the estimated counts as a guide (${summary.estimatedCounts.tests} tests, ${summary.estimatedCounts.events} events, ${summary.estimatedCounts.games} games)
3. All questions must be based on factual information from the summary
4. Timeline events should only include events with specific dates/years mentioned
5. Games should be educational and based on book content
6. Never fabricate or add external information`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Generate high-quality educational materials based strictly on provided summaries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');
    console.log(`Generated ${content.tests?.length || 0} tests, ${content.timelineEvents?.length || 0} events, ${content.games?.length || 0} games`);
    return content;
  } catch (error) {
    console.error('Error generating content from summary:', error);
    throw new Error('Failed to generate content from summary');
  }
}

export async function generatePracticeTestDoc(
  tests: Array<{
    title: string;
    description: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  }>,
  bookTitle: string,
  bookId: string
): Promise<string> {
  try {
    console.log('Generating practice test document...');

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `Practice Tests for: ${bookTitle}`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: '',
              spacing: { after: 400 },
            }),
          ].concat(
            tests.flatMap((test, testIndex) => {
              const testContent: Paragraph[] = [
                new Paragraph({
                  text: `Test ${testIndex + 1}: ${test.title}`,
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  text: test.description,
                  spacing: { after: 200 },
                }),
              ];

              test.questions.forEach((q, qIndex) => {
                testContent.push(
                  new Paragraph({
                    text: `Question ${qIndex + 1}: ${q.question}`,
                    spacing: { before: 200 },
                  })
                );

                q.options.forEach((option, oIndex) => {
                  testContent.push(
                    new Paragraph({
                      text: `${String.fromCharCode(65 + oIndex)}. ${option}`,
                      indent: { left: 720 },
                    })
                  );
                });

                testContent.push(
                  new Paragraph({
                    text: `Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}`,
                    spacing: { before: 100 },
                  })
                );

                testContent.push(
                  new Paragraph({
                    text: `Explanation: ${q.explanation}`,
                    spacing: { after: 200 },
                  })
                );
              });

              testContent.push(
                new Paragraph({
                  text: '',
                  spacing: { after: 400 },
                })
              );

              return testContent;
            })
          ),
        },
      ],
    });

    const uploadsDir = path.join(process.cwd(), 'uploads', 'generated');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `practice-tests-${bookId}.docx`);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    console.log(`Practice test document generated: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error generating practice test document:', error);
    throw new Error('Failed to generate practice test document');
  }
}

function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
