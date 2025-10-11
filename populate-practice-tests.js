import { eq } from 'drizzle-orm';
import { db } from './server/db.ts';
import { practiceTests } from './shared/schema.ts';

// Sample questions for practice tests
const sampleQuestions = [
  // British History Questions
  {
    question: "In which year did the Norman Conquest take place?",
    options: ["1066", "1067", "1065", "1068"],
    correctAnswer: 0,
    explanation: "The Norman Conquest occurred in 1066 when William the Conqueror defeated Harold II at the Battle of Hastings.",
    category: "British History"
  },
  {
    question: "When was the Magna Carta signed?",
    options: ["1214", "1215", "1216", "1217"],
    correctAnswer: 1,
    explanation: "The Magna Carta was signed by King John in 1215, establishing the principle that the king was subject to the law.",
    category: "British History"
  },
  {
    question: "Which Tudor monarch had six wives?",
    options: ["Henry VII", "Henry VIII", "Edward VI", "Mary I"],
    correctAnswer: 1,
    explanation: "Henry VIII had six wives: Catherine of Aragon, Anne Boleyn, Jane Seymour, Anne of Cleves, Catherine Howard, and Catherine Parr.",
    category: "British History"
  },
  {
    question: "When did the English Civil War begin?",
    options: ["1640", "1641", "1642", "1643"],
    correctAnswer: 2,
    explanation: "The English Civil War began in 1642 between the Royalists (supporters of Charles I) and the Parliamentarians.",
    category: "British History"
  },
  {
    question: "In which year was the Great Fire of London?",
    options: ["1665", "1666", "1667", "1668"],
    correctAnswer: 1,
    explanation: "The Great Fire of London occurred in 1666, destroying much of the medieval city.",
    category: "British History"
  },
  {
    question: "When did the Industrial Revolution begin in Britain?",
    options: ["1750", "1760", "1770", "1780"],
    correctAnswer: 0,
    explanation: "The Industrial Revolution began around 1750 in Britain, marking the transition to new manufacturing processes.",
    category: "British History"
  },

  // Government & Politics Questions
  {
    question: "How many MPs are there in the House of Commons?",
    options: ["600", "650", "700", "750"],
    correctAnswer: 1,
    explanation: "There are 650 Members of Parliament in the House of Commons.",
    category: "Government & Politics"
  },
  {
    question: "What type of government does the UK have?",
    options: ["Republic", "Constitutional monarchy", "Absolute monarchy", "Dictatorship"],
    correctAnswer: 1,
    explanation: "The UK is a constitutional monarchy where the monarch is Head of State but power is limited by a constitution.",
    category: "Government & Politics"
  },
  {
    question: "Who is the Head of Government in the UK?",
    options: ["The Monarch", "The Prime Minister", "The Speaker", "The Lord Chancellor"],
    correctAnswer: 1,
    explanation: "The Prime Minister is the Head of Government, while the Monarch is the Head of State.",
    category: "Government & Politics"
  },
  {
    question: "How often are general elections held in the UK?",
    options: ["Every 3 years", "Every 4 years", "Every 5 years", "Every 6 years"],
    correctAnswer: 2,
    explanation: "General elections are held at least every 5 years, though they can be called earlier.",
    category: "Government & Politics"
  },
  {
    question: "Which house of Parliament is elected?",
    options: ["House of Lords", "House of Commons", "Both houses", "Neither house"],
    correctAnswer: 1,
    explanation: "Only the House of Commons is elected. The House of Lords is appointed.",
    category: "Government & Politics"
  },
  {
    question: "What is the role of the Speaker in the House of Commons?",
    options: ["To represent the government", "To chair debates", "To vote on legislation", "To represent the opposition"],
    correctAnswer: 1,
    explanation: "The Speaker chairs debates in the House of Commons and maintains order.",
    category: "Government & Politics"
  },

  // Geography & Culture Questions
  {
    question: "What is the capital of Scotland?",
    options: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"],
    correctAnswer: 1,
    explanation: "Edinburgh is the capital of Scotland.",
    category: "Geography & Culture"
  },
  {
    question: "What is the capital of Wales?",
    options: ["Swansea", "Cardiff", "Newport", "Bangor"],
    correctAnswer: 1,
    explanation: "Cardiff is the capital of Wales.",
    category: "Geography & Culture"
  },
  {
    question: "What is the capital of Northern Ireland?",
    options: ["Derry", "Belfast", "Lisburn", "Newry"],
    correctAnswer: 1,
    explanation: "Belfast is the capital of Northern Ireland.",
    category: "Geography & Culture"
  },
  {
    question: "What is the approximate population of the UK?",
    options: ["60 million", "65 million", "67 million", "70 million"],
    correctAnswer: 2,
    explanation: "The UK has a population of approximately 67 million people.",
    category: "Geography & Culture"
  },
  {
    question: "Which river flows through London?",
    options: ["Thames", "Severn", "Trent", "Mersey"],
    correctAnswer: 0,
    explanation: "The River Thames flows through London.",
    category: "Geography & Culture"
  },
  {
    question: "What is the highest mountain in the UK?",
    options: ["Snowdon", "Ben Nevis", "Scafell Pike", "Slieve Donard"],
    correctAnswer: 1,
    explanation: "Ben Nevis in Scotland is the highest mountain in the UK at 1,345 metres.",
    category: "Geography & Culture"
  },

  // Laws & Society Questions
  {
    question: "At what age can you vote in UK general elections?",
    options: ["16", "17", "18", "21"],
    correctAnswer: 2,
    explanation: "You can vote in UK general elections from the age of 18.",
    category: "Laws & Society"
  },
  {
    question: "What is the legal drinking age in the UK?",
    options: ["16", "17", "18", "21"],
    correctAnswer: 2,
    explanation: "The legal drinking age in the UK is 18.",
    category: "Laws & Society"
  },
  {
    question: "What is the minimum wage for workers aged 23 and over (as of 2023)?",
    options: ["£8.50", "£9.50", "£10.42", "£11.00"],
    correctAnswer: 2,
    explanation: "The minimum wage for workers aged 23 and over is £10.42 per hour (as of 2023).",
    category: "Laws & Society"
  },
  {
    question: "How many hours per week can a 16-17 year old work during term time?",
    options: ["20 hours", "25 hours", "30 hours", "40 hours"],
    correctAnswer: 3,
    explanation: "16-17 year olds can work up to 40 hours per week during term time.",
    category: "Laws & Society"
  },
  {
    question: "What is the age of criminal responsibility in England and Wales?",
    options: ["8", "10", "12", "14"],
    correctAnswer: 1,
    explanation: "The age of criminal responsibility in England and Wales is 10.",
    category: "Laws & Society"
  },
  {
    question: "What is the legal age to get married in England and Wales?",
    options: ["16", "17", "18", "21"],
    correctAnswer: 2,
    explanation: "The legal age to get married in England and Wales is 18 (or 16 with parental consent).",
    category: "Laws & Society"
  }
];

async function populatePracticeTests() {
  try {
    console.log('🚀 Starting to populate practice tests with questions...');

    // Get all existing practice tests
    const existingTests = await db.select().from(practiceTests);
    console.log(`📋 Found ${existingTests.length} existing practice tests`);

    if (existingTests.length === 0) {
      console.log('❌ No practice tests found. Please create some practice tests first.');
      return;
    }

    // Create 24 questions for each test by selecting from sample questions
    for (const test of existingTests) {
      console.log(`📝 Updating test: ${test.title}`);
      
      // Select 24 questions for this test
      const testQuestions = [];
      const questionsPerCategory = 6; // 6 questions from each of 4 categories
      
      const categories = ['British History', 'Government & Politics', 'Geography & Culture', 'Laws & Society'];
      
      for (const category of categories) {
        const categoryQuestions = sampleQuestions.filter(q => q.category === category);
        for (let i = 0; i < questionsPerCategory; i++) {
          const questionIndex = (test.orderIndex + i) % categoryQuestions.length;
          const question = categoryQuestions[questionIndex];
          testQuestions.push({
            id: testQuestions.length + 1,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            category: question.category
          });
        }
      }

      // Update the test with questions
      await db.update(practiceTests)
        .set({ questions: testQuestions })
        .where(eq(practiceTests.id, test.id));

      console.log(`✅ Updated ${test.title} with ${testQuestions.length} questions`);
    }

    console.log('\n🎉 Practice tests population complete!');
    console.log('📊 Summary:');
    console.log(`   - Tests updated: ${existingTests.length}`);
    console.log(`   - Questions per test: 24`);
    console.log(`   - Total questions added: ${existingTests.length * 24}`);
    
  } catch (error) {
    console.error('❌ Error populating practice tests:', error);
    console.error(error);
  } finally {
    // Database connection is managed by the pool
  }
}

// Run the population
populatePracticeTests().catch(console.error);
