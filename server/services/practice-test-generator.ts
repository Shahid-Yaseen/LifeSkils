import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Question {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface GenerateTestRequest {
  testId: string;
  difficulty: number;
  category: string;
  title: string;
}

export async function generatePracticeTestQuestions(request: GenerateTestRequest): Promise<Question[]> {
  const { testId, difficulty, category, title } = request;

  const difficultyMap: Record<number, string> = {
    1: "beginner level with basic facts",
    2: "easy level with straightforward questions", 
    3: "medium level with moderate complexity",
    4: "hard level with detailed knowledge required",
    5: "expert level with complex scenarios and nuanced understanding"
  };

  const topicDistribution = [
    { topic: "British History", count: 6 },
    { topic: "Government & Politics", count: 6 }, 
    { topic: "Geography & Culture", count: 6 },
    { topic: "Laws & Society", count: 6 }
  ];

  const questions: Question[] = [];
  let questionId = 1;

  // Use testId as seed for unique question selection
  const testSeed = parseInt(testId.replace(/\D/g, '').slice(0, 8), 10) || 1;

  for (const { topic, count } of topicDistribution) {
    const topicQuestions = await generateTopicQuestions(topic, count, difficulty, difficultyMap[difficulty], testSeed);
    
    topicQuestions.forEach(q => {
      questions.push({
        id: questionId++,
        ...q
      });
    });
  }

  return questions;
}

async function generateTopicQuestions(topic: string, count: number, difficulty: number, difficultyLevel: string, testSeed: number = 1): Promise<Omit<Question, 'id'>[]> {
  const prompt = `Generate ${count} multiple choice questions for the Life in UK test on the topic "${topic}" at ${difficultyLevel}.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Include authentic UK facts, dates, places, and cultural references
- Questions should test real knowledge required for UK citizenship
- Provide clear explanations for correct answers
- Focus on practical knowledge citizens need

Topics to cover for ${topic}:
${getTopicGuidelines(topic)}

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this answer is correct",
    "category": "${topic}"
  }
]

Generate exactly ${count} questions. Ensure variety in question types and difficulty appropriate for level ${difficulty}.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert on UK citizenship test preparation. Generate authentic, accurate questions based on official Life in UK test materials. Always respond with valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" } as any,
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse the response - it might be wrapped in an object
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
      
      // If the response is wrapped in an object, extract the array
      if (Array.isArray(parsedResponse)) {
        return parsedResponse;
      } else if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
        return parsedResponse.questions;
      } else {
        // Try to find any array in the response
        const values = Object.values(parsedResponse);
        const arrayValue = values.find(v => Array.isArray(v));
        if (arrayValue) {
          return arrayValue as any[];
        }
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON response from OpenAI");
    }

    throw new Error("Could not extract questions array from OpenAI response");

  } catch (error) {
    console.log(`Using fallback questions for ${topic} (${(error as Error).message})`);
    
    // Fallback to static questions if OpenAI fails
    return await generateFallbackQuestions(topic, count, difficulty, testSeed);
  }
}

function getTopicGuidelines(topic: string): string {
  switch (topic) {
    case "British History":
      return `- Key historical events (Norman Conquest 1066, English Civil War, WWII, etc.)
- Important monarchs and prime ministers
- Major wars and battles
- Industrial Revolution and social changes
- Formation of the United Kingdom`;
      
    case "Government & Politics":
      return `- Parliamentary system and democratic processes
- House of Commons and House of Lords
- Role of the monarch as head of state
- Electoral system and voting rights
- Local government and devolution`;
      
    case "Geography & Culture":
      return `- Four nations: England, Scotland, Wales, Northern Ireland
- Major cities, rivers, and geographical features
- Cultural traditions and festivals
- Sports and national symbols
- Languages and regional identities`;
      
    case "Laws & Society":
      return `- Fundamental British values and principles
- Legal system and rule of law
- Rights and responsibilities of citizens
- Community participation and volunteering
- Social welfare and public services`;
      
    default:
      return "General Life in UK knowledge covering history, government, geography, and culture";
  }
}

async function generateFallbackQuestions(topic: string, count: number, difficulty: number, testSeed: number = 1): Promise<Omit<Question, 'id'>[]> {
  // Expanded static fallback questions organized by topic
  const fallbackQuestions: Record<string, Omit<Question, 'id'>[]> = {
    "British History": [
      {
        question: "When did the Norman Conquest take place?",
        options: ["1066", "1086", "1046", "1076"],
        correctAnswer: 0,
        explanation: "The Norman Conquest occurred in 1066 when William the Conqueror defeated King Harold at the Battle of Hastings.",
        category: "British History"
      },
      {
        question: "Who was the first Prime Minister of the UK?",
        options: ["Winston Churchill", "Robert Walpole", "Benjamin Disraeli", "William Pitt"],
        correctAnswer: 1,
        explanation: "Sir Robert Walpole is generally considered the first Prime Minister, serving from 1721 to 1742.",
        category: "British History"
      },
      {
        question: "In which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correctAnswer: 1,
        explanation: "World War II ended in 1945 with the surrender of Japan in September.",
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
        question: "When did the English Civil War take place?",
        options: ["1639-1651", "1642-1651", "1640-1660", "1645-1655"],
        correctAnswer: 1,
        explanation: "The English Civil War was fought between 1642 and 1651, ending with Parliament's victory.",
        category: "British History"
      },
      {
        question: "What major event happened in 1588?",
        options: ["Great Fire of London", "Spanish Armada defeated", "Plague outbreak", "Shakespeare's birth"],
        correctAnswer: 1,
        explanation: "The Spanish Armada was defeated by the English fleet in 1588, marking England's rise as a naval power.",
        category: "British History"
      }
    ],
    "Government & Politics": [
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
      {
        question: "How many MPs are there in the House of Commons?",
        options: ["600", "650", "700", "750"],
        correctAnswer: 1,
        explanation: "There are 650 Members of Parliament (MPs) in the House of Commons.",
        category: "Government & Politics"
      },
      {
        question: "What is the role of the House of Lords?",
        options: ["Make laws", "Review and revise legislation", "Control taxes", "Appoint ministers"],
        correctAnswer: 1,
        explanation: "The House of Lords reviews and can revise legislation passed by the House of Commons.",
        category: "Government & Politics"
      },
      {
        question: "When can someone vote in UK elections?",
        options: ["Age 16", "Age 17", "Age 18", "Age 21"],
        correctAnswer: 2,
        explanation: "Citizens can vote in UK elections from age 18, and must be registered to vote.",
        category: "Government & Politics"
      }
    ],
    "Geography & Culture": [
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
        question: "What is the capital of Scotland?",
        options: ["Glasgow", "Aberdeen", "Edinburgh", "Dundee"],
        correctAnswer: 2,
        explanation: "Edinburgh is the capital city of Scotland and home to the Scottish Parliament.",
        category: "Geography & Culture"
      }
    ],
    "Laws & Society": [
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
      {
        question: "Which court deals with serious criminal cases?",
        options: ["Magistrates' Court", "Crown Court", "County Court", "High Court"],
        correctAnswer: 1,
        explanation: "The Crown Court deals with serious criminal cases and appeals from Magistrates' Courts.",
        category: "Laws & Society"
      },
      {
        question: "What is the National Health Service (NHS)?",
        options: ["Private healthcare", "Free healthcare system", "Insurance company", "Medical university"],
        correctAnswer: 1,
        explanation: "The NHS provides free healthcare to UK residents, funded through taxation.",
        category: "Laws & Society"
      },
      {
        question: "What must you do if you are involved in a road traffic accident?",
        options: ["Drive away quickly", "Stop and exchange details", "Call a lawyer", "Wait for police only"],
        correctAnswer: 1,
        explanation: "You must stop and exchange insurance and contact details with other parties involved.",
        category: "Laws & Society"
      }
    ]
  };

  // Import the comprehensive question bank
  const { getUniqueQuestionsForTest } = await import('./question-bank');
  return getUniqueQuestionsForTest(topic, count, testSeed) as Omit<Question, 'id'>[];
}