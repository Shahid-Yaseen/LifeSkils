import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract data from component files
function extractComponentData() {
  const componentsDir = path.join(__dirname, 'client/src/components');
  const extractedData = {
    trueFalseQuestions: [],
    matchingPairs: [],
    tripleMatches: [],
    flipCards: [],
    aiTopics: []
  };

  // Extract True/False questions from true-false-game.tsx
  try {
    const trueFalsePath = path.join(componentsDir, 'true-false-game.tsx');
    const trueFalseContent = fs.readFileSync(trueFalsePath, 'utf8');
    
    // Extract the trueFalseQuestions array
    const questionsMatch = trueFalseContent.match(/const trueFalseQuestions: TrueFalseQuestion\[\] = \[([\s\S]*?)\];/);
    if (questionsMatch) {
      console.log('Found True/False questions in component');
      // This would need more sophisticated parsing in a real implementation
    }
  } catch (error) {
    console.log('Could not extract True/False data:', error.message);
  }

  // Extract matching pairs from enhanced-matching-cards.tsx
  try {
    const matchingPath = path.join(componentsDir, 'enhanced-matching-cards.tsx');
    const matchingContent = fs.readFileSync(matchingPath, 'utf8');
    
    const pairsMatch = matchingContent.match(/const allMatchingData: MatchingPair\[\] = \[([\s\S]*?)\];/);
    if (pairsMatch) {
      console.log('Found matching pairs in component');
    }
  } catch (error) {
    console.log('Could not extract matching data:', error.message);
  }

  // Extract flip cards from flip-cards.tsx
  try {
    const flipCardsPath = path.join(componentsDir, 'flip-cards.tsx');
    const flipCardsContent = fs.readFileSync(flipCardsPath, 'utf8');
    
    const cardsMatch = flipCardsContent.match(/const flipCardsData: FlipCard\[\] = \[([\s\S]*?)\];/);
    if (cardsMatch) {
      console.log('Found flip cards in component');
    }
  } catch (error) {
    console.log('Could not extract flip cards data:', error.message);
  }

  return extractedData;
}

// Function to create comprehensive game data
function createComprehensiveGameData() {
  return [
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
        },
        {
          id: "6",
          statement: "The Industrial Revolution began in Britain in the 18th century.",
          isTrue: true,
          explanation: "The Industrial Revolution started in Britain around 1760-1840, transforming manufacturing, transportation, and society.",
          category: "History"
        },
        {
          id: "7",
          statement: "In the UK, you can get married at 16 without parental consent.",
          isTrue: false,
          explanation: "In England, Wales and Northern Ireland, you need to be 18 to marry without parental consent. In Scotland, you can marry at 16 without parental consent.",
          category: "Law"
        },
        {
          id: "8",
          statement: "The BBC is funded by a television licence fee paid by UK households.",
          isTrue: true,
          explanation: "The BBC's main funding comes from the television licence fee, which UK households must pay if they watch live TV or use BBC iPlayer.",
          category: "Media"
        },
        {
          id: "9",
          statement: "The House of Lords can permanently block legislation passed by the House of Commons.",
          isTrue: false,
          explanation: "The House of Lords can delay legislation but cannot permanently block it. They can only delay most bills for up to one year.",
          category: "Politics"
        },
        {
          id: "10",
          statement: "Christmas Day and Boxing Day are both bank holidays in the UK.",
          isTrue: true,
          explanation: "Both Christmas Day (25 December) and Boxing Day (26 December) are bank holidays throughout the UK.",
          category: "Traditions"
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
        },
        {
          id: "6",
          front: "When is St. George's Day?",
          back: "April 23rd",
          category: "Culture"
        },
        {
          id: "7",
          front: "What does the Union Jack represent?",
          back: "The combination of England (St. George's Cross), Scotland (St. Andrew's Cross), and Northern Ireland (St. Patrick's Cross)",
          category: "Symbols"
        },
        {
          id: "8",
          front: "What is the highest court in the UK?",
          back: "The Supreme Court",
          category: "Government"
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
          left: "1314",
          right: "Battle of Bannockburn",
          category: "History"
        },
        {
          id: "4",
          left: "London",
          right: "Capital of England",
          category: "Geography"
        },
        {
          id: "5",
          left: "Edinburgh",
          right: "Capital of Scotland",
          category: "Geography"
        },
        {
          id: "6",
          left: "Cardiff",
          right: "Capital of Wales",
          category: "Geography"
        },
        {
          id: "7",
          left: "House of Commons",
          right: "Lower house of Parliament",
          category: "Government"
        },
        {
          id: "8",
          left: "House of Lords",
          right: "Upper house of Parliament",
          category: "Government"
        },
        {
          id: "9",
          left: "Shakespeare",
          right: "Famous English playwright",
          category: "Culture"
        },
        {
          id: "10",
          left: "Burns Night",
          right: "Scottish celebration on January 25th",
          category: "Culture"
        },
        {
          id: "11",
          left: "18",
          right: "Legal voting age in UK",
          category: "Values"
        },
        {
          id: "12",
          left: "NHS",
          right: "National Health Service",
          category: "Values"
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
          left: "Vaisakhi",
          right: "April 13th or 14th",
          category: "Religious"
        },
        {
          id: "4",
          left: "Diwali",
          right: "October/November (5-day festival)",
          category: "Religious"
        },
        {
          id: "5",
          left: "Valentine's Day",
          right: "February 14th",
          category: "Cultural"
        },
        {
          id: "6",
          left: "April Fool's Day",
          right: "April 1st",
          category: "Cultural"
        },
        {
          id: "7",
          left: "Mother's Day",
          right: "Fourth Sunday of Lent (March/April)",
          category: "Cultural"
        },
        {
          id: "8",
          left: "Father's Day",
          right: "Third Sunday in June",
          category: "Cultural"
        },
        {
          id: "9",
          left: "Halloween",
          right: "October 31st",
          category: "Cultural"
        },
        {
          id: "10",
          left: "Bonfire Night",
          right: "November 5th",
          category: "Historical"
        },
        {
          id: "11",
          left: "Remembrance Day",
          right: "November 11th",
          category: "Memorial"
        },
        {
          id: "12",
          left: "Christmas Day",
          right: "December 25th",
          category: "Religious"
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
        },
        {
          id: "6",
          column1: "Margaret Thatcher",
          column2: "1979-1990",
          column3: "Iron Lady, Conservative Revolution",
          category: "Modern"
        },
        {
          id: "7",
          column1: "Tony Blair",
          column2: "1997-2007",
          column3: "New Labour, Iraq War",
          category: "Modern"
        },
        {
          id: "8",
          column1: "David Cameron",
          column2: "2010-2016",
          column3: "Coalition Government, Brexit Referendum",
          category: "Contemporary"
        }
      ]
    }
  ];
}

// Export the functions
export {
  extractComponentData,
  createComprehensiveGameData
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Extracting component data...');
  const extracted = extractComponentData();
  console.log('Extracted data:', extracted);
  
  console.log('\nCreating comprehensive game data...');
  const games = createComprehensiveGameData();
  console.log(`Created ${games.length} games`);
  
  // Save to file for review
  fs.writeFileSync(
    path.join(__dirname, 'extracted-games-data.json'),
    JSON.stringify(games, null, 2)
  );
  console.log('Game data saved to extracted-games-data.json');
}
