import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://localhost:5432/lifeskills'
});

// Complete games data with exact structure from games page
const completeGamesData = [
  // AI Generated Games (1)
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
    tags: JSON.stringify(["AI", "Personalized", "Adaptive", "Life in UK"]),
    gameData: JSON.stringify({
      topics: [
        { name: "British Government", description: "Parliament, Prime Ministers, political system", icon: "🏛️" },
        { name: "UK History", description: "From Roman Britain to modern times", icon: "📜" },
        { name: "British Culture", description: "Arts, traditions, festivals, literature", icon: "🎭" },
        { name: "British Values", description: "Democracy, rule of law, liberty, tolerance", icon: "⚖️" },
        { name: "UK Geography", description: "Countries, cities, landmarks, demographics", icon: "🗺️" },
        { name: "Sports & Achievements", description: "British sports history and heroes", icon: "🏆" },
        { name: "Laws & Justice", description: "Legal system, courts, police", icon: "⚖️" }
      ],
      difficultyLevels: [
        { name: "Beginner", description: "Basic knowledge, 8-10 questions", color: "green" },
        { name: "Intermediate", description: "Standard level, 10-12 questions", color: "blue" },
        { name: "Advanced", description: "Challenge mode, 12 questions", color: "purple" }
      ],
      questionTypes: ["Multiple Choice", "Fill in the Blank", "True/False"]
    })
  },

  // True/False Games (1) - with complete question set
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
    tags: JSON.stringify(["Quick Learning", "Instant Feedback", "UK Facts", "Confidence Building"]),
    gameData: JSON.stringify({
      questions: [
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
        },
        {
          id: "11",
          statement: "The UK Parliament is located in Westminster Palace in London.",
          isTrue: true,
          explanation: "The UK Parliament meets in the Palace of Westminster, also known as the Houses of Parliament, located in London.",
          category: "Politics"
        },
        {
          id: "12",
          statement: "Cricket was invented in England and is considered the national summer sport.",
          isTrue: true,
          explanation: "Cricket originated in England and is widely considered the national summer sport, with football being the national winter sport.",
          category: "Sport"
        },
        {
          id: "13",
          statement: "The NHS was established immediately after World War I in 1919.",
          isTrue: false,
          explanation: "The National Health Service (NHS) was established in 1948, after World War II, not World War I.",
          category: "History"
        },
        {
          id: "14",
          statement: "William Shakespeare was born in Stratford-upon-Avon in England.",
          isTrue: true,
          explanation: "William Shakespeare was born in Stratford-upon-Avon, Warwickshire, England in 1564.",
          category: "Culture"
        },
        {
          id: "15",
          statement: "The driving age in the UK is 17 for cars and 16 for mopeds.",
          isTrue: true,
          explanation: "You can get a provisional driving licence and start learning to drive a car at 17, and ride a moped at 16.",
          category: "Law"
        }
      ],
      categories: ["All", "Politics", "History", "Traditions", "Economy", "Law", "Media", "Sport", "Culture"]
    })
  },

  // Flip Cards Games (1) - with complete card set
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
    tags: JSON.stringify(["Interactive", "Self-Paced", "Memory Training", "Visual Learning"]),
    gameData: JSON.stringify({
      cards: [
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
      ],
      categories: ["All", "Geography", "History", "Values", "Government", "Religion", "Culture", "Symbols"]
    })
  },

  // 2-Column Matching Games (8) - with complete data
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
    tags: JSON.stringify(["Matching", "Critical Thinking", "Progressive Difficulty", "Conceptual Learning"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", left: "1066", right: "Norman Conquest", category: "History" },
        { id: "2", left: "1215", right: "Magna Carta signed", category: "History" },
        { id: "3", left: "1314", right: "Battle of Bannockburn", category: "History" },
        { id: "4", left: "London", right: "Capital of England", category: "Geography" },
        { id: "5", left: "Edinburgh", right: "Capital of Scotland", category: "Geography" },
        { id: "6", left: "Cardiff", right: "Capital of Wales", category: "Geography" },
        { id: "7", left: "House of Commons", right: "Lower house of Parliament", category: "Government" },
        { id: "8", left: "House of Lords", right: "Upper house of Parliament", category: "Government" },
        { id: "9", left: "Shakespeare", right: "Famous English playwright", category: "Culture" },
        { id: "10", left: "Burns Night", right: "Scottish celebration on January 25th", category: "Culture" },
        { id: "11", left: "18", right: "Legal voting age in UK", category: "Values" },
        { id: "12", left: "NHS", right: "National Health Service", category: "Values" }
      ],
      difficultyLevels: [
        { name: "Starter", items: 4, difficulty: "Easy", color: "blue" },
        { name: "Standard", items: 6, difficulty: "Medium", color: "green" },
        { name: "Advanced", items: 8, difficulty: "Hard", color: "orange" },
        { name: "Master", items: 12, difficulty: "Expert", color: "purple" }
      ],
      categories: ["All", "History", "Government", "Geography"]
    })
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
    tags: JSON.stringify(["Holidays", "Dates", "British Culture", "Traditions"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", holiday: "Lent", date: "February/March (46 days before Easter)", description: "Christian period of fasting and reflection" },
        { id: "2", holiday: "Easter", date: "March/April (First Sunday after first full moon after spring equinox)", description: "Christian celebration of Jesus Christ's resurrection" },
        { id: "3", holiday: "Vaisakhi", date: "April 13th or 14th", description: "Sikh New Year and harvest festival" },
        { id: "4", holiday: "Diwali", date: "October/November (5-day festival)", description: "Hindu and Sikh festival of lights" },
        { id: "5", holiday: "Hanukkah", date: "November/December (8-day festival)", description: "Jewish festival of lights" },
        { id: "6", holiday: "Eid al-Fitr", date: "End of Ramadan (Date varies each year)", description: "Islamic celebration marking end of fasting month" },
        { id: "7", holiday: "Eid al-Adha", date: "70 days after Eid al-Fitr (Date varies each year)", description: "Islamic festival of sacrifice" },
        { id: "8", holiday: "Valentine's Day", date: "February 14th", description: "Day of romance and love" },
        { id: "9", holiday: "April Fool's Day", date: "April 1st", description: "Day of practical jokes and pranks" },
        { id: "10", holiday: "Mother's Day", date: "Fourth Sunday of Lent (March/April)", description: "Day to honor mothers and maternal figures" },
        { id: "11", holiday: "Father's Day", date: "Third Sunday in June", description: "Day to honor fathers and paternal figures" },
        { id: "12", holiday: "Halloween", date: "October 31st", description: "Ancient Celtic festival, now celebration with costumes" },
        { id: "13", holiday: "Bonfire Night", date: "November 5th", description: "Commemorates Guy Fawkes and Gunpowder Plot of 1605" },
        { id: "14", holiday: "Remembrance Day", date: "November 11th", description: "Honors those who died in military service" },
        { id: "15", holiday: "Christmas Eve", date: "December 24th", description: "Day before Christmas Day" },
        { id: "16", holiday: "Christmas Day", date: "December 25th", description: "Christian celebration of Jesus Christ's birth" },
        { id: "17", holiday: "Boxing Day", date: "December 26th", description: "Traditional day for giving gifts to service workers" },
        { id: "18", holiday: "Hogmanay", date: "December 31st", description: "Scottish New Year's Eve celebration" }
      ]
    })
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
    tags: JSON.stringify(["Holidays", "Meanings", "Cultural Significance", "Religious Events"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", holiday: "Lent", meaning: "Christian period of fasting, prayer, and reflection before Easter", category: "Christian" },
        { id: "2", holiday: "Easter", meaning: "Christian celebration of Jesus Christ's resurrection from the dead", category: "Christian" },
        { id: "3", holiday: "Vaisakhi", meaning: "Sikh New Year and harvest festival celebrating the founding of the Khalsa", category: "Sikh" },
        { id: "4", holiday: "Diwali", meaning: "Hindu and Sikh festival of lights celebrating victory of light over darkness", category: "Hindu/Sikh" },
        { id: "5", holiday: "Hanukkah", meaning: "Jewish festival of lights commemorating the rededication of the Temple", category: "Jewish" },
        { id: "6", holiday: "Eid al-Fitr", meaning: "Islamic celebration marking the end of Ramadan fasting month", category: "Islamic" },
        { id: "7", holiday: "Eid al-Adha", meaning: "Islamic festival of sacrifice commemorating Abraham's willingness to sacrifice his son", category: "Islamic" },
        { id: "8", holiday: "Valentine's Day", meaning: "Day dedicated to romantic love and affection between intimate companions", category: "Cultural" },
        { id: "9", holiday: "April Fool's Day", meaning: "Day of practical jokes, pranks, and hoaxes in many countries", category: "Cultural" },
        { id: "10", holiday: "Mother's Day", meaning: "Day honoring mothers, motherhood, maternal bonds, and mothers' influence in society", category: "Cultural" },
        { id: "11", holiday: "Father's Day", meaning: "Day celebrating fatherhood, paternal bonds, and fathers' influence in society", category: "Cultural" },
        { id: "12", holiday: "Halloween", meaning: "Ancient Celtic festival now celebrated with costumes, trick-or-treating, and spooky themes", category: "Cultural" },
        { id: "13", holiday: "Bonfire Night", meaning: "British commemoration of Guy Fawkes' failed Gunpowder Plot to blow up Parliament", category: "British Historical" },
        { id: "14", holiday: "Remembrance Day", meaning: "Memorial day honoring military personnel who died in service to their country", category: "Memorial" },
        { id: "15", holiday: "Christmas Eve", meaning: "Evening before Christmas Day, traditionally a time of preparation and anticipation", category: "Christian" },
        { id: "16", holiday: "Christmas Day", meaning: "Christian celebration of the birth of Jesus Christ and gift-giving", category: "Christian" },
        { id: "17", holiday: "Boxing Day", meaning: "British tradition of giving gifts to service workers and the less fortunate", category: "British Cultural" },
        { id: "18", holiday: "Hogmanay", meaning: "Scottish celebration of New Year's Eve with unique traditions and customs", category: "Scottish Cultural" }
      ]
    })
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
    tags: JSON.stringify(["Sports", "Achievements", "British Champions", "Olympic Heroes"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", athlete: "Sir Mo Farah", achievement: "Four-time Olympic gold medalist in long-distance running (5000m and 10000m)", sport: "Athletics", era: "Modern" },
        { id: "2", athlete: "Sir Andy Murray", achievement: "Three-time Grand Slam champion and two-time Olympic tennis gold medalist", sport: "Tennis", era: "Modern" },
        { id: "3", athlete: "Dame Jessica Ennis-Hill", achievement: "Olympic heptathlon champion and three-time world champion", sport: "Athletics", era: "Modern" },
        { id: "4", athlete: "Sir Chris Hoy", achievement: "Six-time Olympic cycling gold medalist, most successful British Olympian", sport: "Cycling", era: "Modern" },
        { id: "5", athlete: "Dame Kelly Holmes", achievement: "Double Olympic gold medalist in 800m and 1500m at Athens 2004", sport: "Athletics", era: "Modern" },
        { id: "6", athlete: "Sir Steve Redgrave", achievement: "Five consecutive Olympic rowing gold medals from 1984 to 2000", sport: "Rowing", era: "Modern" },
        { id: "7", athlete: "Sir Bobby Charlton", achievement: "1966 World Cup winner and Manchester United legend with 249 goals", sport: "Football", era: "Classic" },
        { id: "8", athlete: "Sir Geoff Hurst", achievement: "Only player to score hat-trick in World Cup final (1966 vs West Germany)", sport: "Football", era: "Classic" },
        { id: "9", athlete: "Dame Laura Kenny", achievement: "Most successful female British Olympian with five cycling gold medals", sport: "Cycling", era: "Modern" },
        { id: "10", athlete: "Sir Bradley Wiggins", achievement: "First Briton to win Tour de France and eight-time Olympic medalist", sport: "Cycling", era: "Modern" },
        { id: "11", athlete: "Dame Sarah Storey", achievement: "Britain's most successful Paralympian with 17 gold medals in swimming and cycling", sport: "Paralympics", era: "Modern" },
        { id: "12", athlete: "Sir Lewis Hamilton", achievement: "Seven-time Formula 1 World Champion, joint-record with Michael Schumacher", sport: "Formula 1", era: "Modern" },
        { id: "13", athlete: "Dame Virginia Wade", achievement: "Wimbledon singles champion 1977 and three-time Grand Slam winner", sport: "Tennis", era: "Classic" },
        { id: "14", athlete: "Sir Nick Faldo", achievement: "Six-time major golf champion including three Masters and three Open Championships", sport: "Golf", era: "Classic" },
        { id: "15", athlete: "Dame Tanni Grey-Thompson", achievement: "Eleven Paralympic gold medals in wheelchair racing and marathon world record holder", sport: "Paralympics", era: "Modern" },
        { id: "16", athlete: "Sir Ian Botham", achievement: "Cricket all-rounder with 5,200 runs and 383 wickets in Test matches", sport: "Cricket", era: "Classic" },
        { id: "17", athlete: "Jonny Wilkinson", achievement: "Scored winning drop goal in 2003 Rugby World Cup final for England", sport: "Rugby", era: "Modern" },
        { id: "18", athlete: "Sir AP McCoy", achievement: "Champion jockey 20 consecutive times with over 4,300 career wins", sport: "Horse Racing", era: "Modern" }
      ]
    })
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
    tags: JSON.stringify(["Art", "British Artists", "Cultural Heritage", "Art Forms"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", artist: "Thomas Gainsborough", artForm: "Portrait and Landscape Painting", period: "18th Century", details: "Famous for elegant portraits and romantic landscapes like 'The Blue Boy'" },
        { id: "2", artist: "David Allan", artForm: "Genre and Historical Painting", period: "18th Century", details: "Scottish painter known for scenes of everyday life and historical subjects" },
        { id: "3", artist: "J.M.W. Turner", artForm: "Romantic Landscape Painting", period: "19th Century", details: "Master of light and atmosphere, precursor to Impressionism" },
        { id: "4", artist: "John Constable", artForm: "Naturalist Landscape Painting", period: "19th Century", details: "Famous for countryside scenes like 'The Hay Wain' and cloud studies" },
        { id: "5", artist: "Pre-Raphaelites", artForm: "Romantic Revival Painting", period: "19th Century", details: "Brotherhood rejecting academic art, focusing on medieval and literary themes" },
        { id: "6", artist: "John Lavery", artForm: "Portrait and Society Painting", period: "Late 19th/Early 20th Century", details: "Belfast-born painter famous for society portraits and tennis scenes" },
        { id: "7", artist: "Henry Moore", artForm: "Modern Sculpture", period: "20th Century", details: "Known for abstract bronze sculptures and reclining figures" },
        { id: "8", artist: "John Petts", artForm: "Stained Glass and Printmaking", period: "20th Century", details: "Welsh artist renowned for church stained glass windows and wood engravings" },
        { id: "9", artist: "Lucian Freud", artForm: "Figurative Painting", period: "20th/21st Century", details: "Known for psychologically intense portraits and nude studies" },
        { id: "10", artist: "David Hockney", artForm: "Pop Art and Digital Art", period: "Contemporary", details: "Famous for pool paintings, photo collages, and iPad art" }
      ]
    })
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
    tags: JSON.stringify(["Legal System", "Age Requirements", "Citizenship", "Rights and Responsibilities"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", activity: "Get National Insurance Number (NINO)", age: "16 years old", category: "Employment", details: "Automatically sent before 16th birthday for work eligibility" },
        { id: "2", activity: "Drive a moped (up to 50cc)", age: "16 years old", category: "Transport", details: "With provisional licence and after passing CBT test" },
        { id: "3", activity: "Drive a car", age: "17 years old", category: "Transport", details: "With provisional licence, must pass theory and practical tests" },
        { id: "4", activity: "Buy alcohol in shops/supermarkets", age: "18 years old", category: "Legal Rights", details: "Can buy beer/wine at 16 with meal in hotel/restaurant with adult" },
        { id: "5", activity: "Buy alcohol in hotel/restaurant with meal and adult", age: "16 years old", category: "Legal Rights", details: "Only beer, wine or cider with meal when accompanied by adult" },
        { id: "6", activity: "Betting and National Lottery", age: "18 years old", category: "Gambling", details: "All forms of gambling including lottery tickets and scratch cards" },
        { id: "7", activity: "Vote in elections", age: "18 years old", category: "Civic Duties", details: "General elections, local elections, and referendums" },
        { id: "8", activity: "Stand for public office (general)", age: "18 years old", category: "Civic Duties", details: "Most elected positions except certain restrictions" },
        { id: "9", activity: "Stand for office (armed forces exception)", age: "18 years old", category: "Civic Duties", details: "Active armed forces personnel cannot stand for Parliament" },
        { id: "10", activity: "Stand for office (criminal conviction exception)", age: "18 years old", category: "Civic Duties", details: "Certain criminal convictions disqualify from standing" },
        { id: "11", activity: "Stand for office (civil servant exception)", age: "18 years old", category: "Civic Duties", details: "Senior civil servants must resign before standing" },
        { id: "12", activity: "Free TV licence", age: "Over 75 years old", category: "Benefits", details: "Free TV licence for households where everyone is over 75" }
      ]
    })
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
    tags: JSON.stringify(["History", "Leadership", "Monarchs", "Prime Ministers", "Political Figures"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", name: "William the Conqueror", achievement: "Norman Conquest of England", year: "1066", category: "Medieval", era: "Norman" },
        { id: "2", name: "King John", achievement: "Signed Magna Carta", year: "1215", category: "Medieval", era: "Plantagenet" },
        { id: "3", name: "Henry VIII", achievement: "English Reformation & Break from Rome", year: "1534", category: "Tudor", era: "Renaissance" },
        { id: "4", name: "Elizabeth I", achievement: "Defeated Spanish Armada", year: "1588", category: "Tudor", era: "Golden Age" },
        { id: "5", name: "James I (VI of Scotland)", achievement: "Union of English and Scottish Crowns", year: "1603", category: "Stuart", era: "Early Modern" },
        { id: "6", name: "Charles I", achievement: "English Civil War Execution", year: "1649", category: "Stuart", era: "Civil War" },
        { id: "7", name: "Oliver Cromwell", achievement: "Established Commonwealth Republic", year: "1649", category: "Stuart", era: "Commonwealth" },
        { id: "8", name: "George III", achievement: "American Revolutionary War Loss", year: "1783", category: "Hanoverian", era: "Georgian" },
        { id: "9", name: "Queen Victoria", achievement: "British Empire Peak & Industrial Revolution", year: "1837-1901", category: "Hanoverian", era: "Victorian" },
        { id: "10", name: "George VI", achievement: "Led Britain Through World War II", year: "1939-1945", category: "Modern", era: "20th Century" },
        { id: "11", name: "Winston Churchill", achievement: "Prime Minister During WWII Victory", year: "1940-1945", category: "Modern", era: "20th Century" },
        { id: "12", name: "Margaret Thatcher", achievement: "First Female Prime Minister", year: "1979", category: "Contemporary", era: "Modern" },
        { id: "13", name: "Elizabeth II", achievement: "Longest Reigning British Monarch", year: "1952-2022", category: "Contemporary", era: "Modern" },
        { id: "14", name: "Edward VII", achievement: "Edwardian Era & Entente Cordiale", year: "1904", category: "Modern", era: "Edwardian" },
        { id: "15", name: "Tony Blair", achievement: "Good Friday Agreement & Peace in Northern Ireland", year: "1998", category: "Contemporary", era: "Modern" }
      ]
    })
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
    tags: JSON.stringify(["Cultural Awards", "Arts", "Literature", "Music", "Theatre", "Prestigious Honors"]),
    gameData: JSON.stringify({
      pairs: [
        { id: "1", award: "Laurence Olivier Awards", category: "Theatre", description: "Prestigious awards recognizing excellence in London theatre", significance: "Highest honor in British theatre, named after legendary actor", frequency: "Annual" },
        { id: "2", award: "BRIT Awards", category: "Music", description: "Britain's premier music industry awards ceremony", significance: "Celebrates best of British and international music", frequency: "Annual" },
        { id: "3", award: "Turner Prize", category: "Art", description: "Award for outstanding contribution to contemporary art", significance: "Most prestigious art prize in Britain, named after J.M.W. Turner", frequency: "Annual" },
        { id: "4", award: "Booker Prize", category: "Literature", description: "Leading literary award for fiction written in English", significance: "Most prestigious fiction prize in the English-speaking world", frequency: "Annual" },
        { id: "5", award: "Mercury Prize", category: "Album", description: "Award for best album from the UK and Ireland", significance: "Recognizes artistic achievement regardless of commercial success", frequency: "Annual" },
        { id: "6", award: "Nobel Literature Prize", category: "Literature", description: "International prize for outstanding work in literature", significance: "Recent British winners include Seamus Heaney, Harold Pinter", frequency: "Annual" },
        { id: "7", award: "Edinburgh Festival Fringe", category: "Performance", description: "World's largest arts festival featuring comedy, theatre, and more", significance: "Launch pad for many successful careers in entertainment", frequency: "Annual" },
        { id: "8", award: "National Eisteddfod of Wales", category: "Welsh Culture", description: "Annual celebration of Welsh language, literature, music and performance", significance: "Most important cultural event in Wales, promotes Welsh heritage", frequency: "Annual" },
        { id: "9", award: "BAFTA Awards", category: "Film & Television", description: "British Academy Film and Television Arts awards", significance: "Britain's equivalent to the Oscars and Emmys", frequency: "Annual" },
        { id: "10", award: "Royal Television Society Awards", category: "Television", description: "Recognition of excellence in television production", significance: "Honors innovation and excellence in British broadcasting", frequency: "Annual" },
        { id: "11", award: "The Guardian First Book Award", category: "Literature", description: "Prize for debut novels by new British and Irish authors", significance: "Supports emerging literary talent", frequency: "Annual" },
        { id: "12", award: "Stirling Prize", category: "Architecture", description: "UK's most prestigious architecture award", significance: "Recognizes buildings that make greatest contribution to British architecture", frequency: "Annual" },
        { id: "13", award: "Critics' Circle Theatre Awards", category: "Theatre", description: "Awards from London theatre critics for excellence in drama", significance: "Professional recognition from theatre critics", frequency: "Annual" },
        { id: "14", award: "British Comedy Awards", category: "Comedy", description: "Celebration of the best in British comedy", significance: "Recognition of Britain's strong comedy tradition", frequency: "Annual" },
        { id: "15", award: "Royal Academy Summer Exhibition", category: "Art", description: "Annual open exhibition of contemporary art", significance: "World's largest open submission exhibition", frequency: "Annual" }
      ]
    })
  }
];

async function uploadCompleteGamesDashboard() {
  const client = await pool.connect();
  
  try {
    console.log('🎮 UPLOADING COMPLETE GAMES DASHBOARD');
    console.log('====================================');
    console.log(`📋 Total games to upload: ${completeGamesData.length}`);
    
    // Clear existing games
    await client.query('DELETE FROM games');
    console.log('✅ Cleared existing games');
    
    // Insert all games
    for (const gameData of completeGamesData) {
      const query = `
        INSERT INTO games (title, description, category, game_type, difficulty, is_active, order_index, instructions, estimated_time, tags, game_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      const values = [
        gameData.title,
        gameData.description,
        gameData.category,
        gameData.gameType,
        gameData.difficulty,
        gameData.isActive,
        gameData.orderIndex,
        gameData.instructions,
        gameData.estimatedTime,
        gameData.tags,
        gameData.gameData
      ];
      
      await client.query(query, values);
      console.log(`✅ Uploaded: ${gameData.title}`);
    }
    
    console.log(`\n🎉 Successfully uploaded ${completeGamesData.length} games with complete dashboard data!`);
    
    // Verify upload
    const result = await client.query('SELECT COUNT(*) FROM games');
    console.log(`📊 Database now contains: ${result.rows[0].count} games`);
    
    // Show breakdown by category
    const categoryResult = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM games 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('\n📈 GAMES BY CATEGORY:');
    categoryResult.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} games`);
    });
    
    console.log('\n🚀 COMPLETE GAMES DASHBOARD SUCCESSFULLY UPLOADED!');
    console.log('🎮 Admin can now manage all games at /admin/games with full data structure');
    
  } catch (error) {
    console.error('❌ Error uploading games:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

uploadCompleteGamesDashboard().catch(console.error);
