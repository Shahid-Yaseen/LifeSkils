const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/lifeskills",
});

// Game data extracted from components
const gameData = [
  // AI Exercises Game
  {
    title: "AI-Powered Exercise Generator",
    description: "Generate personalized practice exercises using advanced AI. Choose your topic and difficulty level for tailored learning using authentic Life in UK content.",
    category: "ai-generated",
    gameType: "ai-exercises",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 1,
    instructions: "Select a topic and difficulty level, then generate personalized exercises with AI.",
    estimatedTime: 15,
    tags: ["AI", "Personalized", "Adaptive"],
    aiTopics: [
      { value: "British Government", icon: "🏛️", description: "Parliament, Prime Ministers, political system" },
      { value: "UK History", icon: "📜", description: "From Roman Britain to modern times" },
      { value: "British Culture", icon: "🎭", description: "Arts, traditions, festivals, literature" },
      { value: "British Values", icon: "⚖️", description: "Democracy, rule of law, liberty, tolerance" },
      { value: "UK Geography", icon: "🗺️", description: "Countries, cities, landmarks, demographics" },
      { value: "Sports & Achievements", icon: "🏆", description: "British sports history and heroes" },
      { value: "Laws & Justice", icon: "⚖️", description: "Legal system, courts, police" }
    ]
  },

  // True/False Game
  {
    title: "True/False Challenge Games",
    description: "Test your knowledge with True/False statements about UK facts, traditions, and values. Perfect for quick learning and building confidence!",
    category: "true-false",
    gameType: "true-false",
    difficulty: "beginner",
    isActive: true,
    orderIndex: 2,
    instructions: "Read each statement carefully and select True or False. Get immediate feedback with explanations.",
    estimatedTime: 10,
    tags: ["Quick Learning", "Instant Feedback", "UK Facts"],
    trueFalseQuestions: [
      {
        id: "1",
        statement: "The UK has been a member of the European Union since 1973.",
        isTrue: false,
        explanation: "The UK joined the European Economic Community (EEC) in 1973, which later became the EU. However, the UK left the EU in 2020 following Brexit.",
        category: "Politics"
      },
      {
        id: "2",
        statement: "You must be 18 or over to vote in UK general elections.",
        isTrue: true,
        explanation: "The minimum voting age for UK general elections is 18. This applies to elections for the House of Commons.",
        category: "Politics"
      },
      {
        id: "3",
        statement: "The Union Flag is made up of three crosses representing England, Scotland, and Wales.",
        isTrue: false,
        explanation: "The Union Flag combines the crosses of England (St George), Scotland (St Andrew), and Northern Ireland (St Patrick). Wales is not represented as it was already united with England when the flag was created.",
        category: "History"
      },
      {
        id: "4",
        statement: "The Queen's official birthday is celebrated in June with Trooping the Colour.",
        isTrue: true,
        explanation: "Although the monarch's actual birthday varies, the official birthday is celebrated on the second Saturday in June with the Trooping the Colour ceremony.",
        category: "Traditions"
      },
      {
        id: "5",
        statement: "Scotland has its own banknotes which are legal tender throughout the UK.",
        isTrue: true,
        explanation: "Scottish banks issue their own banknotes which are legal tender throughout the UK, although some businesses may be unfamiliar with them.",
        category: "Economy"
      }
    ]
  },

  // Flip Cards Game
  {
    title: "Flip Cards Game",
    description: "Click on cards to reveal the answers. Test your knowledge and mark cards as completed when you've mastered them.",
    category: "flip-cards",
    gameType: "flip-cards",
    difficulty: "beginner",
    isActive: true,
    orderIndex: 3,
    instructions: "Click on any card to flip it and reveal the answer. Mark cards as 'Got it!' when you've mastered the content.",
    estimatedTime: 5,
    tags: ["Flashcards", "Memory", "Quick Review"],
    flipCards: [
      {
        id: "1",
        front: "What is the capital of Scotland?",
        back: "Edinburgh",
        category: "Geography"
      },
      {
        id: "2",
        front: "When did women get the right to vote in the UK?",
        back: "1918 (partial) and 1928 (full equality)",
        category: "History"
      },
      {
        id: "3",
        front: "What are the fundamental British values?",
        back: "Democracy, Rule of Law, Individual Liberty, Mutual Respect and Tolerance",
        category: "Values"
      },
      {
        id: "4",
        front: "Who is the head of state in the UK?",
        back: "The Monarch (currently King Charles III)",
        category: "Government"
      },
      {
        id: "5",
        front: "What is the Church of England also known as?",
        back: "The Anglican Church",
        category: "Religion"
      }
    ]
  },

  // General Matching Game
  {
    title: "General Matching Game",
    description: "Choose your difficulty (4, 6, 8, or 12 items) and match related concepts. Complete all variants to progress!",
    category: "matching",
    gameType: "general-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 4,
    instructions: "Click one button from each of the two columns to make a match. Correct matches turn green and move to bottom of columns.",
    estimatedTime: 8,
    tags: ["Matching", "Critical Thinking", "Memory"],
    matchingPairs: [
      {
        id: "1",
        left: "1066",
        right: "Norman Conquest",
        category: "History"
      },
      {
        id: "2",
        left: "1215",
        right: "Magna Carta signed",
        category: "History"
      },
      {
        id: "3",
        left: "London",
        right: "Capital of England",
        category: "Geography"
      },
      {
        id: "4",
        left: "Edinburgh",
        right: "Capital of Scotland",
        category: "Geography"
      },
      {
        id: "5",
        left: "House of Commons",
        right: "Lower house of Parliament",
        category: "Government"
      }
    ]
  },

  // Holiday Dates Matching
  {
    title: "UK Holiday Dates Matching Game",
    description: "Match UK holidays with their celebration dates. Learn about traditional British celebrations, religious festivals, and cultural events.",
    category: "matching",
    gameType: "holidays-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 5,
    instructions: "Match each holiday with its correct date. Learn about British celebrations and traditions.",
    estimatedTime: 10,
    tags: ["Holidays", "Dates", "Traditions"],
    matchingPairs: [
      {
        id: "1",
        left: "Lent",
        right: "February/March (46 days before Easter)",
        category: "Religious"
      },
      {
        id: "2",
        left: "Easter",
        right: "March/April (First Sunday after first full moon after spring equinox)",
        category: "Religious"
      },
      {
        id: "3",
        left: "Valentine's Day",
        right: "February 14th",
        category: "Cultural"
      },
      {
        id: "4",
        left: "Bonfire Night",
        right: "November 5th",
        category: "Historical"
      },
      {
        id: "5",
        left: "Remembrance Day",
        right: "November 11th",
        category: "Memorial"
      }
    ]
  },

  // Prime Ministers Triple Match
  {
    title: "British Prime Ministers Triple Match Challenge",
    description: "Match Prime Ministers with their terms and historical periods. Learn about political leadership throughout British democratic history.",
    category: "matching",
    gameType: "prime-ministers-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 6,
    instructions: "Select one item from each of the three columns to make a complete match. All three selections must relate to the same Prime Minister.",
    estimatedTime: 15,
    tags: ["Prime Ministers", "History", "Politics"],
    tripleMatches: [
      {
        id: "1",
        column1: "Robert Walpole",
        column2: "1721-1742",
        column3: "First Prime Minister",
        category: "Georgian"
      },
      {
        id: "2",
        column1: "William Pitt the Younger",
        column2: "1783-1801, 1804-1806",
        column3: "Napoleonic Wars Era",
        category: "Georgian"
      },
      {
        id: "3",
        column1: "Earl Grey",
        column2: "1830-1834",
        column3: "Great Reform Act 1832",
        category: "Victorian"
      },
      {
        id: "4",
        column1: "Benjamin Disraeli",
        column2: "1874-1880",
        column3: "Imperial Expansion",
        category: "Victorian"
      },
      {
        id: "5",
        column1: "Winston Churchill",
        column2: "1940-1945, 1951-1955",
        column3: "World War II Leadership",
        category: "Modern"
      }
    ]
  },

  // UK Places Triple Match
  {
    title: "UK Places of Interest Triple Match Challenge",
    description: "Match places with their regions and descriptions. Discover iconic locations across England, Scotland, Wales, and Northern Ireland.",
    category: "matching",
    gameType: "uk-places-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 7,
    instructions: "Match each place with its correct region and description. Learn about iconic UK locations.",
    estimatedTime: 12,
    tags: ["Geography", "Places", "Tourism"],
    tripleMatches: [
      {
        id: "1",
        column1: "Stonehenge",
        column2: "England",
        column3: "Ancient stone circle in Wiltshire",
        category: "Historical"
      },
      {
        id: "2",
        column1: "Edinburgh Castle",
        column2: "Scotland",
        column3: "Historic fortress on Castle Rock",
        category: "Historical"
      },
      {
        id: "3",
        column1: "Giant's Causeway",
        column2: "Northern Ireland",
        column3: "Natural basalt columns",
        category: "Natural"
      },
      {
        id: "4",
        column1: "Snowdonia",
        column2: "Wales",
        column3: "Mountainous national park",
        category: "Natural"
      },
      {
        id: "5",
        column1: "Tower of London",
        column2: "England",
        column3: "Historic castle and Crown Jewels",
        category: "Historical"
      }
    ]
  },

  // Traditional Foods Triple Match
  {
    title: "Traditional Foods Triple Match Challenge",
    description: "Match dishes with their regions and ingredients. Explore British culinary heritage across all four countries of the UK.",
    category: "matching",
    gameType: "traditional-foods-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 8,
    instructions: "Match each traditional dish with its region of origin and key ingredients.",
    estimatedTime: 10,
    tags: ["Food", "Culture", "Regional"],
    tripleMatches: [
      {
        id: "1",
        column1: "Fish and Chips",
        column2: "England",
        column3: "Fried fish and potatoes",
        category: "Traditional"
      },
      {
        id: "2",
        column1: "Haggis",
        column2: "Scotland",
        column3: "Sheep's heart, liver, and lungs with oats",
        category: "Traditional"
      },
      {
        id: "3",
        column1: "Welsh Cakes",
        column2: "Wales",
        column3: "Sweet griddle cakes with currants",
        category: "Traditional"
      },
      {
        id: "4",
        column1: "Ulster Fry",
        column2: "Northern Ireland",
        column3: "Fried breakfast with soda bread",
        category: "Traditional"
      },
      {
        id: "5",
        column1: "Sunday Roast",
        column2: "England",
        column3: "Roasted meat with vegetables and Yorkshire pudding",
        category: "Traditional"
      }
    ]
  }
];

async function populateGames() {
  const client = await pool.connect();
  
  try {
    console.log('Starting games population...');
    
    // Clear existing games
    await client.query('DELETE FROM games');
    console.log('Cleared existing games');
    
    // Insert new games
    for (const game of gameData) {
      const query = `
        INSERT INTO games (
          title, description, category, game_type, difficulty, is_active, 
          order_index, instructions, estimated_time, tags, 
          true_false_questions, matching_pairs, triple_matches, flip_cards, ai_topics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `;
      
      const values = [
        game.title,
        game.description,
        game.category,
        game.gameType,
        game.difficulty,
        game.isActive,
        game.orderIndex,
        game.instructions,
        game.estimatedTime,
        JSON.stringify(game.tags),
        game.trueFalseQuestions ? JSON.stringify(game.trueFalseQuestions) : null,
        game.matchingPairs ? JSON.stringify(game.matchingPairs) : null,
        game.tripleMatches ? JSON.stringify(game.tripleMatches) : null,
        game.flipCards ? JSON.stringify(game.flipCards) : null,
        game.aiTopics ? JSON.stringify(game.aiTopics) : null
      ];
      
      await client.query(query, values);
      console.log(`Inserted game: ${game.title}`);
    }
    
    console.log('Games population completed successfully!');
    
    // Verify the data
    const result = await client.query('SELECT COUNT(*) FROM games');
    console.log(`Total games in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('Error populating games:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the population
if (require.main === module) {
  populateGames()
    .then(() => {
      console.log('Database population completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database population failed:', error);
      process.exit(1);
    });
}

module.exports = { populateGames };
