import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { games } from './shared/schema.js';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/lifeskills'
});

const db = drizzle(pool);

// Games data based on the existing games page structure
const gamesData = [
  // AI Generated Games
  {
    title: "AI-Powered Exercise Generator",
    description: "Generate personalized practice exercises using advanced AI. Choose your topic and difficulty level for tailored learning using authentic Life in UK content.",
    category: "ai-generated",
    gameType: "ai-exercises",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 1,
    instructions: "Select your topic and difficulty level. The AI will generate personalized questions based on authentic Life in UK content.",
    estimatedTime: 15,
    tags: ["AI", "Personalized", "Adaptive", "Life in UK"],
    gameData: {
      topics: ["British History", "Government & Politics", "Culture & Traditions", "Geography", "British Values", "Legal System"],
      difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
      questionTypes: ["Multiple Choice", "Fill in the Blank", "True/False"]
    }
  },

  // True/False Games
  {
    title: "True/False Challenge Games",
    description: "Test your knowledge with True/False statements about UK facts, traditions, and values. Perfect for quick learning and building confidence!",
    category: "true-false",
    gameType: "true-false",
    difficulty: "beginner",
    isActive: true,
    orderIndex: 2,
    instructions: "Read each statement carefully and decide if it's True or False. Get immediate feedback with explanations.",
    estimatedTime: 10,
    tags: ["Quick Learning", "Instant Feedback", "UK Facts", "Confidence Building"],
    gameData: {
      questionCount: 20,
      timeLimit: 10,
      topics: ["British History", "Government", "Culture", "Geography", "Values"]
    }
  },

  // Flip Cards Games
  {
    title: "Flip Cards Game",
    description: "Click on cards to reveal the answers. Test your knowledge and mark cards as completed when you've mastered them.",
    category: "flip-cards",
    gameType: "flip-cards",
    difficulty: "beginner",
    isActive: true,
    orderIndex: 3,
    instructions: "Click on any card to flip it and reveal the answer. Mark cards as 'Got it!' when you've mastered the content.",
    estimatedTime: 15,
    tags: ["Interactive", "Self-Paced", "Memory Training", "Visual Learning"],
    gameData: {
      cardTypes: ["Question/Answer", "Term/Definition", "Date/Event", "Person/Achievement"]
    }
  },

  // 2-Column Matching Games
  {
    title: "General Matching Game",
    description: "Choose your difficulty (4, 6, 8, or 12 items) and match related concepts. Complete all variants to progress!",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 4,
    instructions: "Click one button from each of the two columns to make a match. Correct matches turn green and move to bottom of columns.",
    estimatedTime: 12,
    tags: ["Matching", "Critical Thinking", "Progressive Difficulty", "Conceptual Learning"],
    gameData: {
      difficultyLevels: [4, 6, 8, 12],
      nextGame: "Holiday Dates Matching"
    }
  },

  {
    title: "UK Holiday Dates Matching Game",
    description: "Match UK holidays with their celebration dates. Learn about traditional British celebrations, religious festivals, and cultural events.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 5,
    instructions: "Match UK holidays with their celebration dates. Learn about traditional British celebrations.",
    estimatedTime: 10,
    tags: ["Holidays", "Dates", "British Culture", "Traditions"],
    gameData: {
      holidays: ["Christmas", "Easter", "Guy Fawkes Night", "Burns Night", "Diwali", "Eid"],
      nextGame: "Holiday Meanings Matching"
    }
  },

  {
    title: "Holiday Meanings Matching Game",
    description: "Match UK holidays with their meanings and significance. Understand the cultural, religious, and historical importance of each celebration.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 6,
    instructions: "Match UK holidays with their meanings and significance.",
    estimatedTime: 10,
    tags: ["Holidays", "Meanings", "Cultural Significance", "Religious Events"],
    gameData: {
      focus: "Cultural and religious significance of British holidays"
    }
  },

  {
    title: "Sports Achievements Matching Game",
    description: "Match British sports champions with their greatest accomplishments. Learn about Olympic heroes, World Cup winners, and sporting legends.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 7,
    instructions: "Match British sports champions with their greatest accomplishments.",
    estimatedTime: 12,
    tags: ["Sports", "Achievements", "British Champions", "Olympic Heroes"],
    gameData: {
      sports: ["Football", "Cricket", "Tennis", "Rugby", "Athletics", "Swimming"]
    }
  },

  {
    title: "British Artists Matching Game",
    description: "Match renowned British artists with their art forms. Explore centuries of artistic heritage from landscape painting to modern sculpture.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 8,
    instructions: "Match renowned British artists with their art forms.",
    estimatedTime: 12,
    tags: ["Art", "British Artists", "Cultural Heritage", "Art Forms"],
    gameData: {
      artForms: ["Painting", "Sculpture", "Literature", "Music", "Theatre", "Architecture"]
    }
  },

  {
    title: "UK Age Requirements Matching Game",
    description: "Match legal activities with their correct age requirements. Learn about employment, driving, voting, and other important legal milestones in the UK.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 9,
    instructions: "Match legal activities with their correct age requirements.",
    estimatedTime: 10,
    tags: ["Legal System", "Age Requirements", "Citizenship", "Rights and Responsibilities"],
    gameData: {
      activities: ["Voting", "Driving", "Working", "Marriage", "Alcohol", "Smoking"]
    }
  },

  {
    title: "British Leaders Matching Game",
    description: "Match British monarchs, prime ministers, and historical figures with their achievements. Explore leadership throughout British history.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 10,
    instructions: "Match British monarchs, prime ministers, and historical figures with their achievements.",
    estimatedTime: 15,
    tags: ["History", "Leadership", "Monarchs", "Prime Ministers", "Political Figures"],
    gameData: {
      leaders: ["Monarchs", "Prime Ministers", "Historical Figures", "Political Leaders"]
    }
  },

  {
    title: "UK Cultural Awards Matching Challenge",
    description: "Match British cultural awards with their categories. Learn about prestigious honors in theatre, music, literature, and the arts including BRIT Awards, Turner Prize, Booker Prize, and more.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 11,
    instructions: "Match British cultural awards with their categories.",
    estimatedTime: 15,
    tags: ["Cultural Awards", "Arts", "Literature", "Music", "Theatre", "Prestigious Honors"],
    gameData: {
      awards: ["BRIT Awards", "Turner Prize", "Booker Prize", "Olivier Awards", "BAFTA", "Mercury Prize"]
    }
  }
];

async function populateGames() {
  try {
    console.log('Starting to populate games database...');
    
    // Clear existing games
    await db.delete(games);
    console.log('Cleared existing games');
    
    // Insert new games
    for (const gameData of gamesData) {
      await db.insert(games).values(gameData);
      console.log(`Inserted game: ${gameData.title}`);
    }
    
    console.log(`Successfully populated ${gamesData.length} games into the database`);
    
    // Verify the data
    const insertedGames = await db.select().from(games);
    console.log(`Database now contains ${insertedGames.length} games`);
    
    // Show summary by category
    const gamesByCategory = insertedGames.reduce((acc, game) => {
      acc[game.category] = (acc[game.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Games by category:', gamesByCategory);
    
  } catch (error) {
    console.error('Error populating games:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the population script
populateGames()
  .then(() => {
    console.log('Games population completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Games population failed:', error);
    process.exit(1);
  });
