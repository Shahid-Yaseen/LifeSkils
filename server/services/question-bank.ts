// Comprehensive question bank with unique questions for each test
interface QuestionTemplate {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  category: string;
}

export const QUESTION_BANK: Record<string, QuestionTemplate[]> = {
  "British History": [
    // Set 1: Medieval Period
    {
      question: "When did the Norman Conquest take place?",
      options: ["1066", "1086", "1046", "1076"],
      correctAnswer: 0,
      explanation: "The Norman Conquest occurred in 1066 when William the Conqueror defeated King Harold at the Battle of Hastings.",
      category: "British History"
    },
    {
      question: "Who was the first Norman King of England?",
      options: ["Harold Godwinson", "William the Conqueror", "Edward the Confessor", "Henry I"],
      correctAnswer: 1,
      explanation: "William the Conqueror became the first Norman King of England after his victory at Hastings in 1066.",
      category: "British History"
    },
    {
      question: "What was the Domesday Book?",
      options: ["A religious text", "A survey of England ordered by William I", "A collection of laws", "A military strategy guide"],
      correctAnswer: 1,
      explanation: "The Domesday Book was a comprehensive survey of England commissioned by William I in 1086.",
      category: "British History"
    },
    
    // Set 2: Tudor Period  
    {
      question: "How many wives did Henry VIII have?",
      options: ["4", "5", "6", "7"],
      correctAnswer: 2,
      explanation: "Henry VIII had six wives: Catherine of Aragon, Anne Boleyn, Jane Seymore, Anne of Cleves, Catherine Howard, and Catherine Parr.",
      category: "British History"
    },
    {
      question: "What major event happened in 1588?",
      options: ["Great Fire of London", "Spanish Armada defeated", "Plague outbreak", "Shakespeare's birth"],
      correctAnswer: 1,
      explanation: "The Spanish Armada was defeated by the English fleet in 1588, marking England's rise as a naval power.",
      category: "British History"
    },
    {
      question: "Who was known as the 'Virgin Queen'?",
      options: ["Mary I", "Elizabeth I", "Anne Boleyn", "Catherine of Aragon"],
      correctAnswer: 1,
      explanation: "Elizabeth I was known as the 'Virgin Queen' because she never married and had no children.",
      category: "British History"
    },

    // Set 3: Civil War Period
    {
      question: "When did the English Civil War take place?",
      options: ["1639-1651", "1642-1651", "1640-1660", "1645-1655"],
      correctAnswer: 1,
      explanation: "The English Civil War was fought between 1642 and 1651, ending with Parliament's victory.",
      category: "British History"
    },
    {
      question: "Who led the Parliamentary forces during the Civil War?",
      options: ["King Charles I", "Oliver Cromwell", "Prince Rupert", "Thomas Fairfax"],
      correctAnswer: 1,
      explanation: "Oliver Cromwell was a key leader of the Parliamentary forces and later became Lord Protector.",
      category: "British History"
    },
    {
      question: "What happened to King Charles I?",
      options: ["He died in battle", "He was executed", "He fled to France", "He abdicated"],
      correctAnswer: 1,
      explanation: "King Charles I was executed in 1649 following his trial for treason against Parliament.",
      category: "British History"
    },

    // Set 4: Industrial Revolution
    {
      question: "When did the Industrial Revolution begin in Britain?",
      options: ["1750s", "1760s", "1770s", "1780s"],
      correctAnswer: 1,
      explanation: "The Industrial Revolution in Britain is generally considered to have begun in the 1760s.",
      category: "British History"
    },
    {
      question: "What was the first major industry to be mechanized?",
      options: ["Mining", "Textile manufacturing", "Steel production", "Transportation"],
      correctAnswer: 1,
      explanation: "Textile manufacturing was the first major industry to be mechanized during the Industrial Revolution.",
      category: "British History"
    },
    {
      question: "Who invented the spinning jenny?",
      options: ["James Watt", "James Hargreaves", "Richard Arkwright", "Samuel Crompton"],
      correctAnswer: 1,
      explanation: "James Hargreaves invented the spinning jenny in 1764, revolutionizing textile production.",
      category: "British History"
    },

    // Set 5: World Wars
    {
      question: "In which year did World War I begin?",
      options: ["1913", "1914", "1915", "1916"],
      correctAnswer: 1,
      explanation: "World War I began in 1914 following the assassination of Archduke Franz Ferdinand.",
      category: "British History"
    },
    {
      question: "Who was the British Prime Minister during most of World War II?",
      options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"],
      correctAnswer: 1,
      explanation: "Winston Churchill was Prime Minister from 1940-1945 during most of World War II.",
      category: "British History"
    },
    {
      question: "In which year did World War II end?",
      options: ["1944", "1945", "1946", "1947"],
      correctAnswer: 1,
      explanation: "World War II ended in 1945 with the surrender of Japan in September.",
      category: "British History"
    },

    // Set 6: Modern Era
    {
      question: "Who was the first Prime Minister of the UK?",
      options: ["Winston Churchill", "Robert Walpole", "Benjamin Disraeli", "William Pitt"],
      correctAnswer: 1,
      explanation: "Sir Robert Walpole is generally considered the first Prime Minister, serving from 1721 to 1742.",
      category: "British History"
    },
    {
      question: "When did the UK join the European Economic Community?",
      options: ["1971", "1972", "1973", "1974"],
      correctAnswer: 2,
      explanation: "The UK joined the European Economic Community (EEC) in 1973.",
      category: "British History"
    },
    {
      question: "Who was the longest-reigning British monarch before Elizabeth II?",
      options: ["Victoria", "George III", "Henry VIII", "Elizabeth I"],
      correctAnswer: 0,
      explanation: "Queen Victoria reigned for 63 years (1837-1901) before Elizabeth II surpassed her record.",
      category: "British History"
    }
  ],

  "Government & Politics": [
    // Set 1: Parliamentary System
    {
      question: "How often are general elections held in the UK?",
      options: ["Every 3 years", "Every 4 years", "Every 5 years", "Every 6 years"],
      correctAnswer: 2,
      explanation: "UK general elections are held every 5 years, though they can be called earlier.",
      category: "Government & Politics"
    },
    {
      question: "What is the upper house of Parliament called?",
      options: ["House of Commons", "House of Lords", "Senate", "Assembly"],
      correctAnswer: 1,
      explanation: "The House of Lords is the upper house of the UK Parliament.",
      category: "Government & Politics"
    },
    {
      question: "Who is the head of state in the UK?",
      options: ["Prime Minister", "President", "The Monarch", "Speaker of the House"],
      correctAnswer: 2,
      explanation: "The Monarch is the head of state in the UK, while the Prime Minister is the head of government.",
      category: "Government & Politics"
    },

    // Set 2: Electoral System
    {
      question: "How many MPs are there in the House of Commons?",
      options: ["600", "650", "700", "750"],
      correctAnswer: 1,
      explanation: "There are 650 Members of Parliament (MPs) in the House of Commons.",
      category: "Government & Politics"
    },
    {
      question: "When can someone vote in UK elections?",
      options: ["Age 16", "Age 17", "Age 18", "Age 21"],
      correctAnswer: 2,
      explanation: "Citizens can vote in UK elections from age 18, and must be registered to vote.",
      category: "Government & Politics"
    },
    {
      question: "What electoral system is used for UK general elections?",
      options: ["Proportional representation", "First past the post", "Alternative vote", "Single transferable vote"],
      correctAnswer: 1,
      explanation: "The UK uses the 'first past the post' system for general elections.",
      category: "Government & Politics"
    },

    // Set 3: Government Structure
    {
      question: "What is the role of the House of Lords?",
      options: ["Make laws", "Review and revise legislation", "Control taxes", "Appoint ministers"],
      correctAnswer: 1,
      explanation: "The House of Lords reviews and can revise legislation passed by the House of Commons.",
      category: "Government & Politics"
    },
    {
      question: "Who appoints the Prime Minister?",
      options: ["The people directly", "Parliament", "The Monarch", "The Cabinet"],
      correctAnswer: 2,
      explanation: "The Monarch appoints the Prime Minister, usually the leader of the party with the most seats.",
      category: "Government & Politics"
    },
    {
      question: "What is the Cabinet?",
      options: ["All MPs", "Senior government ministers", "Civil servants", "House of Lords members"],
      correctAnswer: 1,
      explanation: "The Cabinet consists of senior government ministers chosen by the Prime Minister.",
      category: "Government & Politics"
    },

    // Additional sets for variety...
    {
      question: "How long can someone serve as Prime Minister?",
      options: ["4 years maximum", "8 years maximum", "No term limits", "10 years maximum"],
      correctAnswer: 2,
      explanation: "There are no term limits for the Prime Minister in the UK system.",
      category: "Government & Politics"
    },
    {
      question: "What is a constituency?",
      options: ["A political party", "An electoral area", "A government department", "A type of vote"],
      correctAnswer: 1,
      explanation: "A constituency is an electoral area that elects one MP to the House of Commons.",
      category: "Government & Politics"
    },
    {
      question: "Who is the Speaker of the House of Commons?",
      options: ["The Prime Minister", "An elected MP who chairs debates", "The Deputy PM", "The Monarch's representative"],
      correctAnswer: 1,
      explanation: "The Speaker is an elected MP who chairs debates and maintains order in the House of Commons.",
      category: "Government & Politics"
    }
  ],

  "Geography & Culture": [
    // Set 1: Geography
    {
      question: "What is the highest mountain in the UK?",
      options: ["Snowdon", "Scafell Pike", "Ben Nevis", "Helvellyn"],
      correctAnswer: 2,
      explanation: "Ben Nevis in Scotland is the highest mountain in the UK at 1,345 meters.",
      category: "Geography & Culture"
    },
    {
      question: "Which river flows through London?",
      options: ["River Severn", "River Thames", "River Trent", "River Mersey"],
      correctAnswer: 1,
      explanation: "The River Thames flows through London and is the longest river entirely in England.",
      category: "Geography & Culture"
    },
    {
      question: "What are the four nations of the UK?",
      options: ["England, Scotland, Wales, Ireland", "England, Scotland, Wales, Northern Ireland", "England, Scotland, Ireland, Cornwall", "England, Wales, Scotland, Britain"],
      correctAnswer: 1,
      explanation: "The UK consists of England, Scotland, Wales, and Northern Ireland.",
      category: "Geography & Culture"
    },

    // Set 2: Capitals and Cities
    {
      question: "What is the capital of Scotland?",
      options: ["Glasgow", "Aberdeen", "Edinburgh", "Dundee"],
      correctAnswer: 2,
      explanation: "Edinburgh is the capital city of Scotland and home to the Scottish Parliament.",
      category: "Geography & Culture"
    },
    {
      question: "What is the capital of Wales?",
      options: ["Swansea", "Cardiff", "Newport", "Wrexham"],
      correctAnswer: 1,
      explanation: "Cardiff is the capital and largest city of Wales.",
      category: "Geography & Culture"
    },
    {
      question: "What is the capital of Northern Ireland?",
      options: ["Derry", "Belfast", "Armagh", "Newry"],
      correctAnswer: 1,
      explanation: "Belfast is the capital and largest city of Northern Ireland.",
      category: "Geography & Culture"
    },

    // Set 3: Culture and Traditions
    {
      question: "What is the national flower of England?",
      options: ["Daffodil", "Thistle", "Rose", "Shamrock"],
      correctAnswer: 2,
      explanation: "The rose is the national flower of England, specifically the Tudor rose.",
      category: "Geography & Culture"
    },
    {
      question: "Which sport was invented in England?",
      options: ["Basketball", "Football (Soccer)", "Baseball", "Hockey"],
      correctAnswer: 1,
      explanation: "Football (soccer) was invented in England in the 19th century.",
      category: "Geography & Culture"
    },
    {
      question: "What is Burns Night?",
      options: ["English harvest festival", "Scottish celebration of Robert Burns", "Welsh music festival", "Irish cultural day"],
      correctAnswer: 1,
      explanation: "Burns Night (January 25th) celebrates the Scottish poet Robert Burns with traditional Scottish food and poetry.",
      category: "Geography & Culture"
    },

    // Additional cultural questions...
    {
      question: "What is the longest river in the UK?",
      options: ["Thames", "Severn", "Trent", "Wye"],
      correctAnswer: 1,
      explanation: "The River Severn is the longest river in the UK at 354 kilometers long.",
      category: "Geography & Culture"
    },
    {
      question: "Which mountain range runs through northern England?",
      options: ["The Pennines", "The Cotswolds", "The Chilterns", "The Downs"],
      correctAnswer: 0,
      explanation: "The Pennines, known as the 'backbone of England', run through northern England.",
      category: "Geography & Culture"
    },
    {
      question: "What is Hadrian's Wall?",
      options: ["A Scottish castle", "A Roman wall across northern England", "A Welsh fortification", "An Irish monument"],
      correctAnswer: 1,
      explanation: "Hadrian's Wall was built by the Romans across northern England to defend against Scottish tribes.",
      category: "Geography & Culture"
    }
  ],

  "Laws & Society": [
    // Set 1: Legal System
    {
      question: "What is the minimum voting age in the UK?",
      options: ["16", "17", "18", "21"],
      correctAnswer: 2,
      explanation: "The minimum voting age in the UK is 18 years old.",
      category: "Laws & Society"
    },
    {
      question: "What is the emergency telephone number in the UK?",
      options: ["911", "999", "112", "000"],
      correctAnswer: 1,
      explanation: "999 is the main emergency number in the UK, though 112 also works.",
      category: "Laws & Society"
    },
    {
      question: "What is the legal drinking age in the UK?",
      options: ["16", "17", "18", "21"],
      correctAnswer: 2,
      explanation: "The legal drinking age in the UK is 18 years old.",
      category: "Laws & Society"
    },

    // Set 2: Courts and Justice
    {
      question: "Which court deals with serious criminal cases?",
      options: ["Magistrates' Court", "Crown Court", "County Court", "High Court"],
      correctAnswer: 1,
      explanation: "The Crown Court deals with serious criminal cases and appeals from Magistrates' Courts.",
      category: "Laws & Society"
    },
    {
      question: "What is the role of a jury?",
      options: ["Decide the sentence", "Decide guilt or innocence", "Investigate crimes", "Arrest suspects"],
      correctAnswer: 1,
      explanation: "A jury listens to evidence and decides whether the defendant is guilty or innocent.",
      category: "Laws & Society"
    },
    {
      question: "How many people are on a jury in England and Wales?",
      options: ["10", "12", "14", "16"],
      correctAnswer: 1,
      explanation: "A jury in England and Wales consists of 12 people.",
      category: "Laws & Society"
    },

    // Set 3: Public Services
    {
      question: "What is the National Health Service (NHS)?",
      options: ["Private healthcare", "Free healthcare system", "Insurance company", "Medical university"],
      correctAnswer: 1,
      explanation: "The NHS provides free healthcare to UK residents, funded through taxation.",
      category: "Laws & Society"
    },
    {
      question: "At what age do children start compulsory education in England?",
      options: ["4", "5", "6", "7"],
      correctAnswer: 1,
      explanation: "Compulsory education in England begins at age 5, though many children start at 4.",
      category: "Laws & Society"
    },
    {
      question: "Until what age must children stay in education or training?",
      options: ["16", "17", "18", "19"],
      correctAnswer: 2,
      explanation: "Young people must stay in education or training until age 18 in England.",
      category: "Laws & Society"
    },

    // Additional legal and social questions...
    {
      question: "What must you do if you are involved in a road traffic accident?",
      options: ["Drive away quickly", "Stop and exchange details", "Call a lawyer", "Wait for police only"],
      correctAnswer: 1,
      explanation: "You must stop and exchange insurance and contact details with other parties involved.",
      category: "Laws & Society"
    },
    {
      question: "What is the speed limit in built-up areas?",
      options: ["20 mph", "30 mph", "40 mph", "50 mph"],
      correctAnswer: 1,
      explanation: "The speed limit in built-up areas is typically 30 mph unless otherwise stated.",
      category: "Laws & Society"
    },
    {
      question: "What is council tax?",
      options: ["Income tax", "Property tax paid to local councils", "Sales tax", "Business tax"],
      correctAnswer: 1,
      explanation: "Council tax is a property tax paid to local councils to fund local services.",
      category: "Laws & Society"
    }
  ]
};

// Function to get unique questions for each test
export function getUniqueQuestionsForTest(topic: string, count: number, testSeed: number): any[] {
  const topicQuestions = QUESTION_BANK[topic] || QUESTION_BANK["British History"];
  
  // Use testSeed to create deterministic but different selection for each test
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Create a shuffled version based on the test seed
  const shuffled = [...topicQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(testSeed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the required count, cycling through if needed but in different order
  const result = [];
  for (let i = 0; i < count; i++) {
    const question = shuffled[i % shuffled.length];
    result.push({
      ...question,
      question: i >= shuffled.length ? `[Test ${testSeed % 100}] ${question.question}` : question.question
    });
  }
  
  return result;
}