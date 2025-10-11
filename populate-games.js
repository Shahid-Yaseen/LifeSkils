import { db } from './server/db.js';
import { games } from './shared/schema.js';

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
  },

  // 3-Column Matching Games (Advanced)
  {
    title: "Acts, Treaties & Bills Triple Match Challenge",
    description: "Match important British acts, treaties, and bills with their years and purposes. Learn about landmark legislation that shaped UK history.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 12,
    instructions: "Select one item from each of the three columns to make a complete match. All three selections must relate to the same concept.",
    estimatedTime: 20,
    tags: ["Legislation", "History", "Triple Match", "Advanced", "Legal Documents"],
    gameData: {
      columns: ["Acts/Treaties/Bills", "Years", "Purposes"],
      complexity: "triple-match"
    }
  },

  {
    title: "Sports Heroes Triple Match Challenge",
    description: "Choose your challenge level (4, 6, 8, or 12 heroes) and match British sports legends with their sports and achievements. Complete all variants to unlock the next challenge!",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 13,
    instructions: "Match British sports legends with their sports and achievements.",
    estimatedTime: 18,
    tags: ["Sports Heroes", "Triple Match", "Advanced", "British Legends", "Achievements"],
    gameData: {
      columns: ["Sports Heroes", "Sports", "Achievements"],
      difficultyLevels: [4, 6, 8, 12],
      nextGame: "Justice System Triple Match"
    }
  },

  {
    title: "UK Justice System Triple Match Challenge",
    description: "Match courts with their jurisdictions and regions. Learn about the complex UK justice system across England & Wales, Scotland, and Northern Ireland.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 14,
    instructions: "Match courts with their jurisdictions and regions.",
    estimatedTime: 20,
    tags: ["Justice System", "Courts", "Jurisdictions", "Legal System", "Triple Match"],
    gameData: {
      columns: ["Courts", "Jurisdictions", "Regions"],
      regions: ["England & Wales", "Scotland", "Northern Ireland"]
    }
  },

  {
    title: "UK Religion & Demographics Triple Match Challenge",
    description: "Match religions with their percentages and ethnic compositions. Understand the UK's diverse religious and demographic landscape.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 15,
    instructions: "Match religions with their percentages and ethnic compositions.",
    estimatedTime: 18,
    tags: ["Religion", "Demographics", "Diversity", "Statistics", "Triple Match"],
    gameData: {
      columns: ["Religions", "Percentages", "Ethnic Compositions"]
    }
  },

  {
    title: "UK International Memberships Triple Match Challenge",
    description: "Match international organizations with the UK's role and membership details. Learn about Britain's place in global institutions.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 16,
    instructions: "Match international organizations with the UK's role and membership details.",
    estimatedTime: 20,
    tags: ["International Relations", "Organizations", "Global Institutions", "Triple Match"],
    gameData: {
      columns: ["International Organizations", "UK Role", "Membership Details"]
    }
  },

  {
    title: "British Battles & Wars Triple Match Challenge",
    description: "Match battles with their years and participants. Explore major military conflicts throughout British history from medieval times to modern warfare.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 17,
    instructions: "Match battles with their years and participants.",
    estimatedTime: 22,
    tags: ["Military History", "Battles", "Wars", "Historical Events", "Triple Match"],
    gameData: {
      columns: ["Battles", "Years", "Participants"],
      periods: ["Medieval", "Tudor", "Civil War", "World Wars", "Modern"]
    }
  },

  {
    title: "British Rulers & Religions Triple Match Challenge",
    description: "Match rulers with their reign periods and religious affiliations. Explore the complex relationship between monarchy and religion in British history.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 18,
    instructions: "Match rulers with their reign periods and religious affiliations.",
    estimatedTime: 20,
    tags: ["Monarchy", "Religion", "Historical Rulers", "Triple Match", "Complex Relationships"],
    gameData: {
      columns: ["Rulers", "Reign Periods", "Religious Affiliations"]
    }
  },

  {
    title: "British Prime Ministers Triple Match Challenge",
    description: "Match Prime Ministers with their terms and historical periods. Learn about political leadership throughout British democratic history.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 19,
    instructions: "Match Prime Ministers with their terms and historical periods.",
    estimatedTime: 18,
    tags: ["Prime Ministers", "Political History", "Democratic Leadership", "Triple Match"],
    gameData: {
      columns: ["Prime Ministers", "Terms", "Historical Periods"]
    }
  },

  {
    title: "UK Places of Interest Triple Match Challenge",
    description: "Match places with their regions and descriptions. Discover iconic locations across England, Scotland, Wales, and Northern Ireland.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 20,
    instructions: "Match places with their regions and descriptions.",
    estimatedTime: 20,
    tags: ["Geography", "Places of Interest", "UK Regions", "Landmarks", "Triple Match"],
    gameData: {
      columns: ["Places", "Regions", "Descriptions"],
      regions: ["England", "Scotland", "Wales", "Northern Ireland"]
    }
  },

  {
    title: "Traditional Foods Triple Match Challenge",
    description: "Match dishes with their regions and ingredients. Explore British culinary heritage across all four countries of the UK.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 21,
    instructions: "Match dishes with their regions and ingredients.",
    estimatedTime: 18,
    tags: ["Food", "Culinary Heritage", "Regional Dishes", "Ingredients", "Triple Match"],
    gameData: {
      columns: ["Dishes", "Regions", "Ingredients"]
    }
  },

  {
    title: "UK Constituent Countries Triple Match Challenge",
    description: "Match countries with their capitals and symbols. Test your knowledge of UK geography, culture, and national identity including patron saints, symbols, flags, and major cities.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 22,
    instructions: "Match countries with their capitals and symbols.",
    estimatedTime: 20,
    tags: ["UK Geography", "Constituent Countries", "Capitals", "National Symbols", "Triple Match"],
    gameData: {
      columns: ["Countries", "Capitals", "Symbols"],
      countries: ["England", "Scotland", "Wales", "Northern Ireland"]
    }
  },

  {
    title: "UK Parliament & Devolution Triple Match Challenge",
    description: "Match regions with their parliaments and powers. Learn about UK government structure, devolution, and democratic institutions including Westminster, Holyrood, Senedd, and Stormont.",
    category: "matching",
    gameType: "matching-cards",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 23,
    instructions: "Match regions with their parliaments and powers.",
    estimatedTime: 22,
    tags: ["Parliament", "Devolution", "Government Structure", "Democratic Institutions", "Triple Match"],
    gameData: {
      columns: ["Regions", "Parliaments", "Powers"],
      parliaments: ["Westminster", "Holyrood", "Senedd", "Stormont"]
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

export { populateGames, gamesData };
