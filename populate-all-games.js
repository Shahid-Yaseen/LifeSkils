import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/lifeskills",
});

// Comprehensive game data for all components
const allGamesData = [
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

  // 2-Column Matching Games
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
      { id: "1", left: "1066", right: "Norman Conquest", category: "History" },
      { id: "2", left: "1215", right: "Magna Carta signed", category: "History" },
      { id: "3", left: "London", right: "Capital of England", category: "Geography" },
      { id: "4", left: "Edinburgh", right: "Capital of Scotland", category: "Geography" },
      { id: "5", left: "House of Commons", right: "Lower house of Parliament", category: "Government" }
    ]
  },

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
      { id: "1", left: "Lent", right: "February/March (46 days before Easter)", category: "Religious" },
      { id: "2", left: "Easter", right: "March/April (First Sunday after first full moon after spring equinox)", category: "Religious" },
      { id: "3", left: "Valentine's Day", right: "February 14th", category: "Cultural" },
      { id: "4", left: "Bonfire Night", right: "November 5th", category: "Historical" },
      { id: "5", left: "Remembrance Day", right: "November 11th", category: "Memorial" }
    ]
  },

  {
    title: "Holiday Meanings Matching Game",
    description: "Match UK holidays with their meanings and significance. Understand the cultural, religious, and historical importance of each celebration.",
    category: "matching",
    gameType: "holiday-meanings-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 6,
    instructions: "Match each holiday with its meaning and significance.",
    estimatedTime: 10,
    tags: ["Holidays", "Meanings", "Culture"],
    matchingPairs: [
      { id: "1", left: "Christmas Day", right: "Celebration of Jesus Christ's birth", category: "Religious" },
      { id: "2", left: "Easter", right: "Celebration of Jesus Christ's resurrection", category: "Religious" },
      { id: "3", left: "Bonfire Night", right: "Commemorates Guy Fawkes and Gunpowder Plot of 1605", category: "Historical" },
      { id: "4", left: "Remembrance Day", right: "Honors those who died in military service", category: "Memorial" },
      { id: "5", left: "Valentine's Day", right: "Day of romance and love", category: "Cultural" }
    ]
  },

  {
    title: "Sports Achievements Matching Game",
    description: "Match British sports champions with their greatest accomplishments. Learn about Olympic heroes, World Cup winners, and sporting legends.",
    category: "matching",
    gameType: "sports-achievements-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 7,
    instructions: "Match each sports champion with their greatest achievement.",
    estimatedTime: 10,
    tags: ["Sports", "Achievements", "Champions"],
    matchingPairs: [
      { id: "1", left: "Sir Mo Farah", right: "4-time Olympic gold medalist in long-distance running", category: "Athletics" },
      { id: "2", left: "Sir Andy Murray", right: "2-time Wimbledon champion", category: "Tennis" },
      { id: "3", left: "Lewis Hamilton", right: "7-time Formula 1 World Champion", category: "Motorsport" },
      { id: "4", left: "Sir Chris Hoy", right: "6-time Olympic cycling champion", category: "Cycling" },
      { id: "5", left: "Sir Steve Redgrave", right: "5-time Olympic rowing gold medalist", category: "Rowing" }
    ]
  },

  {
    title: "British Artists Matching Game",
    description: "Match renowned British artists with their art forms. Explore centuries of artistic heritage from landscape painting to modern sculpture.",
    category: "matching",
    gameType: "british-artists-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 8,
    instructions: "Match each British artist with their primary art form.",
    estimatedTime: 10,
    tags: ["Art", "Artists", "Culture"],
    matchingPairs: [
      { id: "1", left: "J.M.W. Turner", right: "Landscape painting", category: "Painting" },
      { id: "2", left: "Henry Moore", right: "Sculpture", category: "Sculpture" },
      { id: "3", left: "David Hockney", right: "Pop art and photography", category: "Modern Art" },
      { id: "4", left: "William Blake", right: "Poetry and painting", category: "Romantic" },
      { id: "5", left: "Lucian Freud", right: "Portrait painting", category: "Portraiture" }
    ]
  },

  {
    title: "UK Ages Matching Game",
    description: "Match legal activities with their correct age requirements. Learn about employment, driving, voting, and other important legal milestones in the UK.",
    category: "matching",
    gameType: "uk-ages-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 9,
    instructions: "Match each activity with its correct age requirement.",
    estimatedTime: 10,
    tags: ["Law", "Ages", "Legal"],
    matchingPairs: [
      { id: "1", left: "Vote in general elections", right: "18 years old", category: "Voting" },
      { id: "2", left: "Drive a car", right: "17 years old", category: "Transport" },
      { id: "3", left: "Buy alcohol", right: "18 years old", category: "Consumption" },
      { id: "4", left: "Get married without consent", right: "18 years old (England, Wales, NI)", category: "Marriage" },
      { id: "5", left: "Leave school", right: "16 years old", category: "Education" }
    ]
  },

  {
    title: "British Leaders Matching Game",
    description: "Match British monarchs, prime ministers, and historical figures with their achievements. Explore leadership throughout British history.",
    category: "matching",
    gameType: "british-leaders-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 10,
    instructions: "Match each leader with their key achievement.",
    estimatedTime: 10,
    tags: ["Leaders", "History", "Politics"],
    matchingPairs: [
      { id: "1", left: "Winston Churchill", right: "Led Britain through World War II", category: "Prime Minister" },
      { id: "2", left: "Queen Elizabeth II", right: "Longest-reigning British monarch", category: "Monarch" },
      { id: "3", left: "Margaret Thatcher", right: "First female Prime Minister", category: "Prime Minister" },
      { id: "4", left: "Nelson Mandela", right: "Anti-apartheid leader (honorary British citizen)", category: "Activist" },
      { id: "5", left: "Tony Blair", right: "New Labour Prime Minister", category: "Prime Minister" }
    ]
  },

  {
    title: "UK Cultural Awards Matching Challenge",
    description: "Match British cultural awards with their categories. Learn about prestigious honors in theatre, music, literature, and the arts including BRIT Awards, Turner Prize, Booker Prize, and more.",
    category: "matching",
    gameType: "uk-cultural-awards-matching",
    difficulty: "intermediate",
    isActive: true,
    orderIndex: 11,
    instructions: "Match each award with its category or field.",
    estimatedTime: 10,
    tags: ["Awards", "Culture", "Arts"],
    matchingPairs: [
      { id: "1", left: "BRIT Awards", right: "Music", category: "Music" },
      { id: "2", left: "Turner Prize", right: "Contemporary art", category: "Art" },
      { id: "3", left: "Booker Prize", right: "Literature", category: "Literature" },
      { id: "4", left: "Olivier Awards", right: "Theatre", category: "Theatre" },
      { id: "5", left: "BAFTA Awards", right: "Film and television", category: "Film/TV" }
    ]
  },

  // 3-Column Matching Games (Advanced)
  {
    title: "Acts, Treaties & Bills Triple Match Challenge",
    description: "Match important British acts, treaties, and bills with their years and purposes. Learn about landmark legislation that shaped UK history.",
    category: "matching",
    gameType: "acts-treaties-bills-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 12,
    instructions: "Select one item from each of the three columns to make a complete match. All three selections must relate to the same legislation.",
    estimatedTime: 15,
    tags: ["Legislation", "History", "Law"],
    tripleMatches: [
      { id: "1", column1: "Magna Carta", column2: "1215", column3: "Limited royal power and established rule of law", category: "Medieval" },
      { id: "2", column1: "Act of Union", column2: "1707", column3: "United England and Scotland", category: "Constitutional" },
      { id: "3", column1: "Great Reform Act", column2: "1832", column3: "Extended voting rights", category: "Democratic" },
      { id: "4", column1: "Slavery Abolition Act", column2: "1833", column3: "Abolished slavery in British Empire", category: "Social" },
      { id: "5", column1: "Representation of the People Act", column2: "1918", column3: "Gave women over 30 the right to vote", category: "Suffrage" }
    ]
  },

  {
    title: "British Battles & Wars Triple Match Challenge",
    description: "Match battles with their years and participants. Explore major military conflicts throughout British history from medieval times to modern warfare.",
    category: "matching",
    gameType: "battles-wars-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 13,
    instructions: "Match each battle with its year and key participants.",
    estimatedTime: 15,
    tags: ["Battles", "History", "Military"],
    tripleMatches: [
      { id: "1", column1: "Battle of Hastings", column2: "1066", column3: "William the Conqueror vs Harold Godwinson", category: "Medieval" },
      { id: "2", column1: "Battle of Agincourt", column2: "1415", column3: "Henry V vs French forces", category: "Hundred Years War" },
      { id: "3", column1: "Battle of Waterloo", column2: "1815", column3: "Duke of Wellington vs Napoleon", category: "Napoleonic" },
      { id: "4", column1: "Battle of the Somme", column2: "1916", column3: "British and French vs German forces", category: "World War I" },
      { id: "5", column1: "Battle of Britain", column2: "1940", column3: "RAF vs Luftwaffe", category: "World War II" }
    ]
  },

  {
    title: "UK Justice System Triple Match Challenge",
    description: "Match courts with their jurisdictions and regions. Learn about the complex UK justice system across England & Wales, Scotland, and Northern Ireland.",
    category: "matching",
    gameType: "justice-system-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 14,
    instructions: "Match each court with its jurisdiction and region.",
    estimatedTime: 15,
    tags: ["Justice", "Courts", "Law"],
    tripleMatches: [
      { id: "1", column1: "Supreme Court", column2: "UK-wide", column3: "Highest court in the UK", category: "Constitutional" },
      { id: "2", column1: "Court of Appeal", column2: "England & Wales", column3: "Appeals from Crown Court and High Court", category: "Criminal" },
      { id: "3", column1: "High Court of Justiciary", column2: "Scotland", column3: "Highest criminal court in Scotland", category: "Criminal" },
      { id: "4", column1: "Crown Court", column2: "England & Wales", column3: "Serious criminal cases", category: "Criminal" },
      { id: "5", column1: "Sheriff Court", column2: "Scotland", column3: "Most civil and criminal cases", category: "General" }
    ]
  },

  {
    title: "British Prime Ministers Triple Match Challenge",
    description: "Match Prime Ministers with their terms and historical periods. Learn about political leadership throughout British democratic history.",
    category: "matching",
    gameType: "prime-ministers-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 15,
    instructions: "Match each Prime Minister with their term and key achievement.",
    estimatedTime: 15,
    tags: ["Prime Ministers", "History", "Politics"],
    tripleMatches: [
      { id: "1", column1: "Robert Walpole", column2: "1721-1742", column3: "First Prime Minister", category: "Georgian" },
      { id: "2", column1: "Winston Churchill", column2: "1940-1945, 1951-1955", column3: "World War II leadership", category: "Modern" },
      { id: "3", column1: "Margaret Thatcher", column2: "1979-1990", column3: "Conservative revolution", category: "Modern" },
      { id: "4", column1: "Tony Blair", column2: "1997-2007", column3: "New Labour", category: "Contemporary" },
      { id: "5", column1: "David Cameron", column2: "2010-2016", column3: "Coalition government and Brexit referendum", category: "Contemporary" }
    ]
  },

  {
    title: "UK Religion & Demographics Triple Match Challenge",
    description: "Match religions with their percentages and ethnic compositions. Understand the UK's diverse religious and demographic landscape.",
    category: "matching",
    gameType: "religion-demographics-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 16,
    instructions: "Match each religion with its percentage and ethnic composition.",
    estimatedTime: 15,
    tags: ["Religion", "Demographics", "Diversity"],
    tripleMatches: [
      { id: "1", column1: "Christianity", column2: "~60%", column3: "Anglican, Catholic, Protestant denominations", category: "Majority" },
      { id: "2", column1: "Islam", column2: "~5%", column3: "Diverse ethnic backgrounds", category: "Minority" },
      { id: "3", column1: "Hinduism", column2: "~1.5%", column3: "Primarily South Asian", category: "Minority" },
      { id: "4", column1: "Sikhism", column2: "~0.8%", column3: "Primarily Punjabi", category: "Minority" },
      { id: "5", column1: "Judaism", column2: "~0.5%", column3: "Diverse ethnic backgrounds", category: "Minority" }
    ]
  },

  {
    title: "British Rulers & Religions Triple Match Challenge",
    description: "Match rulers with their reign periods and religious affiliations. Explore the complex relationship between monarchy and religion in British history.",
    category: "matching",
    gameType: "rulers-religions-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 17,
    instructions: "Match each ruler with their reign period and religious affiliation.",
    estimatedTime: 15,
    tags: ["Rulers", "Religion", "History"],
    tripleMatches: [
      { id: "1", column1: "Henry VIII", column2: "1509-1547", column3: "Founded Church of England", category: "Tudor" },
      { id: "2", column1: "Elizabeth I", column2: "1558-1603", column3: "Established Protestant supremacy", category: "Tudor" },
      { id: "3", column1: "James I", column2: "1603-1625", column3: "Authorized King James Bible", category: "Stuart" },
      { id: "4", column1: "Charles I", column2: "1625-1649", column3: "Anglican, executed by Parliament", category: "Stuart" },
      { id: "5", column1: "William III", column2: "1689-1702", column3: "Protestant, Glorious Revolution", category: "Stuart" }
    ]
  },

  {
    title: "Sports Heroes Triple Match Challenge",
    description: "Match British sports legends with their sports and achievements. Learn about Olympic heroes, World Cup winners, and sporting legends.",
    category: "matching",
    gameType: "sports-heroes-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 18,
    instructions: "Match each sports hero with their sport and greatest achievement.",
    estimatedTime: 15,
    tags: ["Sports", "Heroes", "Achievements"],
    tripleMatches: [
      { id: "1", column1: "Sir Mo Farah", column2: "Athletics", column3: "4-time Olympic gold medalist", category: "Olympic" },
      { id: "2", column1: "Sir Andy Murray", column2: "Tennis", column3: "2-time Wimbledon champion", category: "Grand Slam" },
      { id: "3", column1: "Lewis Hamilton", column2: "Formula 1", column3: "7-time World Champion", category: "Motorsport" },
      { id: "4", column1: "Sir Chris Hoy", column2: "Cycling", column3: "6-time Olympic champion", category: "Olympic" },
      { id: "5", column1: "Sir Steve Redgrave", column2: "Rowing", column3: "5-time Olympic gold medalist", category: "Olympic" }
    ]
  },

  {
    title: "Traditional Foods Triple Match Challenge",
    description: "Match dishes with their regions and ingredients. Explore British culinary heritage across all four countries of the UK.",
    category: "matching",
    gameType: "traditional-foods-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 19,
    instructions: "Match each traditional dish with its region and key ingredients.",
    estimatedTime: 15,
    tags: ["Food", "Culture", "Regional"],
    tripleMatches: [
      { id: "1", column1: "Fish and Chips", column2: "England", column3: "Fried fish and potatoes", category: "Traditional" },
      { id: "2", column1: "Haggis", column2: "Scotland", column3: "Sheep's heart, liver, and lungs with oats", category: "Traditional" },
      { id: "3", column1: "Welsh Cakes", column2: "Wales", column3: "Sweet griddle cakes with currants", category: "Traditional" },
      { id: "4", column1: "Ulster Fry", column2: "Northern Ireland", column3: "Fried breakfast with soda bread", category: "Traditional" },
      { id: "5", column1: "Sunday Roast", column2: "England", column3: "Roasted meat with vegetables and Yorkshire pudding", category: "Traditional" }
    ]
  },

  {
    title: "UK International Memberships Triple Match Challenge",
    description: "Match international organizations with the UK's role and membership details. Learn about Britain's place in global institutions.",
    category: "matching",
    gameType: "uk-memberships-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 20,
    instructions: "Match each organization with the UK's role and membership status.",
    estimatedTime: 15,
    tags: ["International", "Organizations", "Global"],
    tripleMatches: [
      { id: "1", column1: "United Nations", column2: "Founding member", column3: "Permanent Security Council member", category: "Global" },
      { id: "2", column1: "NATO", column2: "Founding member", column3: "Nuclear-armed member", category: "Military" },
      { id: "3", column1: "G7", column2: "Member", column3: "Leading industrialized nation", category: "Economic" },
      { id: "4", column1: "Commonwealth", column2: "Head of Commonwealth", column3: "Monarch as symbolic head", category: "Commonwealth" },
      { id: "5", column1: "World Trade Organization", column2: "Member", column3: "Independent trading nation", category: "Trade" }
    ]
  },

  {
    title: "UK Constituent Countries Triple Match Challenge",
    description: "Match countries with their capitals and symbols. Test your knowledge of UK geography, culture, and national identity including patron saints, symbols, flags, and major cities.",
    category: "matching",
    gameType: "uk-constituent-countries-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 21,
    instructions: "Match each country with its capital and national symbol.",
    estimatedTime: 15,
    tags: ["Geography", "Countries", "Symbols"],
    tripleMatches: [
      { id: "1", column1: "England", column2: "London", column3: "St. George's Cross, Rose", category: "Country" },
      { id: "2", column1: "Scotland", column2: "Edinburgh", column3: "St. Andrew's Cross, Thistle", category: "Country" },
      { id: "3", column1: "Wales", column2: "Cardiff", column3: "Red Dragon, Daffodil", category: "Country" },
      { id: "4", column1: "Northern Ireland", column2: "Belfast", column3: "St. Patrick's Cross, Shamrock", category: "Country" },
      { id: "5", column1: "United Kingdom", column2: "London", column3: "Union Jack, Crown", category: "Union" }
    ]
  },

  {
    title: "UK Parliament & Devolution Triple Match Challenge",
    description: "Match regions with their parliaments and powers. Learn about UK government structure, devolution, and democratic institutions including Westminster, Holyrood, Senedd, and Stormont.",
    category: "matching",
    gameType: "uk-parliament-devolution-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 22,
    instructions: "Match each region with its parliament and devolved powers.",
    estimatedTime: 15,
    tags: ["Parliament", "Devolution", "Government"],
    tripleMatches: [
      { id: "1", column1: "England", column2: "Westminster", column3: "No devolved parliament", category: "Central" },
      { id: "2", column1: "Scotland", column2: "Holyrood", column3: "Education, health, justice", category: "Devolved" },
      { id: "3", column1: "Wales", column2: "Senedd", column3: "Education, health, transport", category: "Devolved" },
      { id: "4", column1: "Northern Ireland", column2: "Stormont", column3: "Education, health, justice", category: "Devolved" },
      { id: "5", column1: "UK-wide", column2: "Westminster", column3: "Defense, foreign affairs, immigration", category: "Reserved" }
    ]
  },

  {
    title: "UK Places of Interest Triple Match Challenge",
    description: "Match places with their regions and descriptions. Discover iconic locations across England, Scotland, Wales, and Northern Ireland.",
    category: "matching",
    gameType: "uk-places-matching",
    difficulty: "advanced",
    isActive: true,
    orderIndex: 23,
    instructions: "Match each place with its region and description.",
    estimatedTime: 15,
    tags: ["Places", "Geography", "Tourism"],
    tripleMatches: [
      { id: "1", column1: "Stonehenge", column2: "England", column3: "Ancient stone circle in Wiltshire", category: "Historical" },
      { id: "2", column1: "Edinburgh Castle", column2: "Scotland", column3: "Historic fortress on Castle Rock", category: "Historical" },
      { id: "3", column1: "Giant's Causeway", column2: "Northern Ireland", column3: "Natural basalt columns", category: "Natural" },
      { id: "4", column1: "Snowdonia", column2: "Wales", column3: "Mountainous national park", category: "Natural" },
      { id: "5", column1: "Tower of London", column2: "England", column3: "Historic castle and Crown Jewels", category: "Historical" }
    ]
  }
];

async function populateAllGames() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Populating ALL games database...\n');
    
    // Clear existing games
    await client.query('DELETE FROM games');
    console.log('✅ Cleared existing games');
    
    // Insert all games
    for (const game of allGamesData) {
      const query = `
        INSERT INTO games (
          title, description, category, game_type, difficulty, is_active, 
          order_index, instructions, estimated_time, tags, 
          true_false_questions, matching_pairs, triple_matches, flip_cards, ai_topics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
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
        game.tags ? JSON.stringify(game.tags) : null,
        game.trueFalseQuestions ? JSON.stringify(game.trueFalseQuestions) : null,
        game.matchingPairs ? JSON.stringify(game.matchingPairs) : null,
        game.tripleMatches ? JSON.stringify(game.tripleMatches) : null,
        game.flipCards ? JSON.stringify(game.flipCards) : null,
        game.aiTopics ? JSON.stringify(game.aiTopics) : null
      ];
      
      const result = await client.query(query, values);
      console.log(`✅ ${game.title} (${game.gameType})`);
    }
    
    console.log(`\n🎉 Successfully populated ${allGamesData.length} games!`);
    
    // Show statistics
    const stats = await client.query(`
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN true_false_questions IS NOT NULL THEN 1 END) as with_true_false,
        COUNT(CASE WHEN matching_pairs IS NOT NULL THEN 1 END) as with_matching,
        COUNT(CASE WHEN triple_matches IS NOT NULL THEN 1 END) as with_triple,
        COUNT(CASE WHEN flip_cards IS NOT NULL THEN 1 END) as with_flip_cards,
        COUNT(CASE WHEN ai_topics IS NOT NULL THEN 1 END) as with_ai_topics
      FROM games 
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('\n📊 Final Statistics:');
    console.log('Category | Total | T/F | Match | Triple | Flip | AI');
    console.log('---------|-------|-----|-------|--------|------|----');
    stats.rows.forEach(row => {
      console.log(`${row.category.padEnd(8)} | ${row.count.toString().padEnd(5)} | ${row.with_true_false.toString().padEnd(3)} | ${row.with_matching.toString().padEnd(5)} | ${row.with_triple.toString().padEnd(6)} | ${row.with_flip_cards.toString().padEnd(4)} | ${row.with_ai_topics}`);
    });
    
    const totalResult = await client.query('SELECT COUNT(*) FROM games');
    console.log(`\n📈 Total games: ${totalResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateAllGames();
}

export { populateAllGames };
