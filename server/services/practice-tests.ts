import type { InsertPracticeTest } from "@shared/schema";
import { enhancedTestManager } from './enhanced-test-manager';
import { dataUploadService } from './data-upload-service';

interface Question {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0-3 index
  explanation: string;
  category: string;
}

// Generate 45 different practice test templates (questions will be generated dynamically)
export function generatePracticeTests(): InsertPracticeTest[] {
  const tests: InsertPracticeTest[] = [];

  // Categories and their question pools
  const questionPools = {
    history: [
      {
        question: "When did the Norman Conquest take place?",
        options: ["1066", "1086", "1046", "1076"],
        correctAnswer: 0,
        explanation: "The Norman Conquest occurred in 1066 when William the Conqueror defeated King Harold at the Battle of Hastings.",
        category: "History"
      },
      {
        question: "Who was the first Prime Minister of the UK?",
        options: ["Winston Churchill", "Robert Walpole", "Benjamin Disraeli", "William Pitt"],
        correctAnswer: 1,
        explanation: "Sir Robert Walpole is generally considered the first Prime Minister, serving from 1721 to 1742.",
        category: "History"
      },
      {
        question: "When did the English Civil War begin?",
        options: ["1639", "1642", "1645", "1649"],
        correctAnswer: 1,
        explanation: "The English Civil War began in 1642 between supporters of King Charles I and Parliament.",
        category: "History"
      },
      {
        question: "In which year did the Great Fire of London occur?",
        options: ["1665", "1666", "1667", "1668"],
        correctAnswer: 1,
        explanation: "The Great Fire of London occurred in 1666, destroying much of medieval London.",
        category: "History"
      },
      {
        question: "When did women over 30 first get the vote in the UK?",
        options: ["1918", "1928", "1920", "1925"],
        correctAnswer: 0,
        explanation: "Women over 30 got the vote in 1918, with all women over 21 getting the vote in 1928.",
        category: "History"
      },
      {
        question: "Who was known as the 'Iron Lady'?",
        options: ["Queen Victoria", "Margaret Thatcher", "Elizabeth I", "Theresa May"],
        correctAnswer: 1,
        explanation: "Margaret Thatcher was known as the 'Iron Lady' and served as Prime Minister from 1979-1990.",
        category: "History"
      }
    ],
    government: [
      {
        question: "How often are general elections held in the UK?",
        options: ["Every 3 years", "Every 4 years", "Every 5 years", "Every 6 years"],
        correctAnswer: 2,
        explanation: "UK general elections are held every 5 years, though they can be called earlier.",
        category: "Government"
      },
      {
        question: "What is the upper house of Parliament called?",
        options: ["House of Commons", "House of Lords", "Senate", "Assembly"],
        correctAnswer: 1,
        explanation: "The House of Lords is the upper house of the UK Parliament.",
        category: "Government"
      },
      {
        question: "Who appoints the Prime Minister?",
        options: ["The people", "Parliament", "The monarch", "The Cabinet"],
        correctAnswer: 2,
        explanation: "The monarch appoints the Prime Minister, usually the leader of the largest party in the Commons.",
        category: "Government"
      },
      {
        question: "How many MPs are there in the House of Commons?",
        options: ["600", "625", "650", "675"],
        correctAnswer: 2,
        explanation: "There are 650 Members of Parliament (MPs) in the House of Commons.",
        category: "Government"
      },
      {
        question: "What is the minimum voting age in the UK?",
        options: ["16", "17", "18", "21"],
        correctAnswer: 2,
        explanation: "The minimum voting age in the UK is 18 years old.",
        category: "Government"
      },
      {
        question: "Which system is used for general elections in the UK?",
        options: ["Proportional representation", "First past the post", "Alternative vote", "Single transferable vote"],
        correctAnswer: 1,
        explanation: "The UK uses the 'first past the post' system for general elections.",
        category: "Government"
      }
    ],
    geography: [
      {
        question: "What is the highest mountain in the UK?",
        options: ["Snowdon", "Scafell Pike", "Ben Nevis", "Helvellyn"],
        correctAnswer: 2,
        explanation: "Ben Nevis in Scotland is the highest mountain in the UK at 1,345 meters.",
        category: "Geography"
      },
      {
        question: "Which river flows through London?",
        options: ["River Severn", "River Thames", "River Mersey", "River Tyne"],
        correctAnswer: 1,
        explanation: "The River Thames flows through London and is the longest river entirely in England.",
        category: "Geography"
      },
      {
        question: "What is the capital of Wales?",
        options: ["Swansea", "Newport", "Cardiff", "Wrexham"],
        correctAnswer: 2,
        explanation: "Cardiff is the capital city of Wales.",
        category: "Geography"
      },
      {
        question: "Which country is NOT part of Great Britain?",
        options: ["England", "Scotland", "Wales", "Northern Ireland"],
        correctAnswer: 3,
        explanation: "Great Britain consists of England, Scotland, and Wales. Northern Ireland is part of the UK but not Great Britain.",
        category: "Geography"
      },
      {
        question: "What is the longest river in the UK?",
        options: ["River Thames", "River Severn", "River Trent", "River Wye"],
        correctAnswer: 1,
        explanation: "The River Severn is the longest river in the UK at 220 miles (354 km).",
        category: "Geography"
      },
      {
        question: "Which city is known as the 'Granite City'?",
        options: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
        correctAnswer: 2,
        explanation: "Aberdeen is known as the 'Granite City' due to its many buildings made from local granite.",
        category: "Geography"
      }
    ],
    culture: [
      {
        question: "When is St. George's Day celebrated?",
        options: ["April 21st", "April 22nd", "April 23rd", "April 24th"],
        correctAnswer: 2,
        explanation: "St. George's Day, the patron saint day of England, is celebrated on April 23rd.",
        category: "Culture"
      },
      {
        question: "What is the national flower of Scotland?",
        options: ["Rose", "Daffodil", "Thistle", "Shamrock"],
        correctAnswer: 2,
        explanation: "The thistle is the national flower of Scotland.",
        category: "Culture"
      },
      {
        question: "Which sport was invented in England?",
        options: ["Basketball", "Football (Soccer)", "Tennis", "Golf"],
        correctAnswer: 1,
        explanation: "Football (soccer) was invented in England in the 19th century.",
        category: "Culture"
      },
      {
        question: "What is a traditional Sunday meal in Britain?",
        options: ["Fish and chips", "Bangers and mash", "Sunday roast", "Shepherd's pie"],
        correctAnswer: 2,
        explanation: "Sunday roast (roast beef, Yorkshire pudding, vegetables) is a traditional British Sunday meal.",
        category: "Culture"
      },
      {
        question: "Which festival is celebrated on November 5th?",
        options: ["Halloween", "Bonfire Night", "All Saints' Day", "Remembrance Day"],
        correctAnswer: 1,
        explanation: "Bonfire Night (Guy Fawkes Night) is celebrated on November 5th.",
        category: "Culture"
      },
      {
        question: "What does 'Boxing Day' commemorate?",
        options: ["Boxing matches", "Gift giving to servants", "Boxing up Christmas decorations", "St. Stephen's Day"],
        correctAnswer: 1,
        explanation: "Boxing Day traditionally involved giving gifts to servants and tradespeople.",
        category: "Culture"
      }
    ]
  };

  // Generate 45 tests with different combinations
  for (let i = 1; i <= 45; i++) {
    const questions: Question[] = [];
    let questionId = 1;

    // Distribute questions across categories (6 from each category = 24 total)
    const categoriesPerTest = [
      { category: 'history', count: 6 },
      { category: 'government', count: 6 },
      { category: 'geography', count: 6 },
      { category: 'culture', count: 6 }
    ];

    categoriesPerTest.forEach(({ category, count }) => {
      const pool = questionPools[category as keyof typeof questionPools];
      
      // Select questions with some variation based on test number
      for (let j = 0; j < count; j++) {
        const questionIndex = (i + j + Math.floor(i / 10)) % pool.length;
        const baseQuestion = pool[questionIndex];
        
        questions.push({
          id: questionId++,
          question: baseQuestion.question,
          options: baseQuestion.options as [string, string, string, string],
          correctAnswer: baseQuestion.correctAnswer,
          explanation: baseQuestion.explanation,
          category: baseQuestion.category
        });
      }
    });

    // Add additional questions from expanded pool to reach 24
    while (questions.length < 24) {
      const allQuestions = Object.values(questionPools).flat();
      const randomQuestion = allQuestions[(i + questions.length) % allQuestions.length];
      
      questions.push({
        id: questionId++,
        question: randomQuestion.question,
        options: randomQuestion.options as [string, string, string, string],
        correctAnswer: randomQuestion.correctAnswer,
        explanation: randomQuestion.explanation,
        category: randomQuestion.category
      });
    }

    // Shuffle questions for variety
    const shuffledQuestions = questions
      .sort(() => Math.sin(i + questions.length) > 0 ? 1 : -1)
      .slice(0, 24);

    const testCategories = [
      "British History", "Government & Politics", "Geography & Culture", 
      "General Knowledge", "Comprehensive Review", "Mock Exam"
    ];

    const difficulties = [1, 2, 2, 3, 3, 4, 4, 5]; // Weighted toward medium difficulty

    tests.push({
      title: `Life in UK Practice Test ${i}`,
      description: `Comprehensive practice test covering ${testCategories[i % testCategories.length].toLowerCase()} with 24 dynamically generated questions`,
      category: testCategories[i % testCategories.length],
      difficulty: difficulties[i % difficulties.length],
      questions: [], // Questions will be generated dynamically when test is started
      orderIndex: i
    });
  }

  return tests;
}

// Initialize practice tests if none exist
export async function initializePracticeTests(storage: any) {
  try {
    const existingTests = await storage.getAllPracticeTests();
    
    if (existingTests.length === 0) {
      console.log("Initializing 45 practice tests...");
      const tests = generatePracticeTests();
      
      for (const test of tests) {
        await storage.createPracticeTest(test);
      }
      
      console.log("✓ 45 practice tests initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize practice tests:", error);
  }
}

// Enhanced initialization with uploaded data
export async function initializePracticeTestsWithData(storage: any) {
  try {
    const existingTests = await storage.getAllPracticeTests();
    
    if (existingTests.length === 0) {
      console.log("🚀 Initializing practice tests with enhanced data...");
      
      // Upload the given question pool data
      const uploadResult = await dataUploadService.createComprehensiveTestsFromData({
        history: questionPools.history,
        government: questionPools.government,
        geography: questionPools.geography,
        culture: questionPools.culture
      });
      
      if (uploadResult.success) {
        console.log(`✅ Successfully created ${uploadResult.createdTests.length} enhanced practice tests`);
        console.log("📊 Test categories:", Object.keys(questionPools));
      } else {
        console.log("⚠️ Falling back to standard initialization...");
        await initializePracticeTests(storage);
      }
    } else {
      console.log("📋 Practice tests already exist, skipping initialization");
    }
  } catch (error) {
    console.error("❌ Failed to initialize practice tests with data:", error);
    // Fallback to standard initialization
    await initializePracticeTests(storage);
  }
}

// Get enhanced analytics for practice tests
export async function getPracticeTestAnalytics(testId: string) {
  try {
    return await enhancedTestManager.getEnhancedTestAnalytics(testId, 'practice');
  } catch (error) {
    console.error("Failed to get practice test analytics:", error);
    throw error;
  }
}

// Create custom practice test with specific questions
export async function createCustomPracticeTest(
  title: string,
  description: string,
  category: string,
  questions: Question[],
  difficulty: number = 3
) {
  try {
    return await enhancedTestManager.generateEnhancedPracticeTest(
      title,
      description,
      category,
      difficulty,
      questions.length,
      questions
    );
  } catch (error) {
    console.error("Failed to create custom practice test:", error);
    throw error;
  }
}