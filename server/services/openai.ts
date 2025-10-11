import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ExerciseContent {
  topic: string;
  text: string;
}

export async function generateExercise(topic: string, difficulty: number = 1): Promise<ExerciseContent> {
  try {
    // Authentic Life in UK test content from official study guide
    const lifeInUKFacts = `
    OFFICIAL LIFE IN UK TEST FACTS (from lifeintheuktests.co.uk study guide):
    
    FUNDAMENTAL VALUES & PRINCIPLES:
    British society founded on fundamental values: Democracy, Rule of law, Individual liberty, Tolerance of different faiths and beliefs, Participation in community life.
    New citizens pledge: "I will give my loyalty to the United Kingdom and respect its rights and freedoms. I will uphold its democratic values. I will observe its laws faithfully and fulfil my duties and obligations as a British citizen."
    Responsibilities: respect and obey the law, respect rights of others, treat others with fairness, look after yourself and your family, look after the area in which you live and the environment.
    Rights offered: freedom of belief and religion, freedom of speech, freedom from unfair discrimination, right to a fair trial, right to join in election of a government.
    
    UK STRUCTURE & GEOGRAPHY:
    UK made up of England, Scotland, Wales and Northern Ireland. Rest of Ireland is independent country.
    Official name: United Kingdom of Great Britain and Northern Ireland.
    'Great Britain' refers only to England, Scotland and Wales, not Northern Ireland.
    Crown dependencies: Channel Islands and Isle of Man (own governments, not part of UK).
    British overseas territories: St Helena, Falkland Islands (linked to UK but not part of it).
    Governed by parliament sitting in Westminster. Scotland, Wales and Northern Ireland have own parliaments/assemblies with devolved powers.
    
    CAPITAL CITIES:
    UK capital: London
    Scotland capital: Edinburgh  
    Wales capital: Cardiff
    Northern Ireland capital: Belfast
    
    MAJOR CITIES:
    England: London, Birmingham, Liverpool, Leeds, Sheffield, Bristol, Manchester, Bradford, Newcastle Upon Tyne, Plymouth, Southampton, Norwich
    Wales: Cardiff, Swansea, Newport
    Scotland: Edinburgh, Glasgow, Dundee, Aberdeen
    Northern Ireland: Belfast
    
    CURRENCY:
    Pound sterling (symbol £). 100 pence in a pound.
    Coins: 1p, 2p, 5p, 10p, 20p, 50p, £1, £2
    Notes: £5, £10, £20, £50
    Northern Ireland and Scotland have own banknotes, valid everywhere in UK but shops don't have to accept them.
    
    POPULATION GROWTH:
    1600: Just over 4 million
    1700: 5 million  
    1801: 8 million
    1851: 20 million
    1901: 40 million
    1951: 50 million
    1998: 57 million
    2005: Just under 60 million
    2010: Just over 62 million
    Nearly 10% of population has parent or grandparent born outside UK.
    England consistently 84% of total population, Wales around 5%, Scotland just over 8%, Northern Ireland less than 3%.
    
    LANGUAGES:
    English has many accents and dialects across UK.
    Wales: Many people speak Welsh, taught in schools and universities.
    Scotland: Gaelic spoken in some parts of Highlands and Islands.
    Northern Ireland: Some people speak Irish Gaelic.
    
    EARLY BRITISH HISTORY:
    Stone Age: First people were hunter-gatherers. Britain connected to continent by land bridge. First farmers arrived 6,000 years ago from south-east Europe.
    Stonehenge: Stone Age monument in Wiltshire, probably gathering place for seasonal ceremonies.
    Skara Brae: Best preserved prehistoric village in northern Europe, on Orkney off north coast of Scotland.
    Bronze Age (4,000 years ago): People made bronze, lived in roundhouses, buried dead in round barrows.
    Iron Age: Made weapons and tools from iron, lived in roundhouses in larger settlements, defended hill forts. Maiden Castle in Dorset is impressive hill fort.
    Celtic language family spoken, related languages still spoken in Wales, Scotland, Ireland.
    First coins minted in Britain, some inscribed with Iron Age kings' names.
    
    ROMANS IN BRITAIN:
    Julius Caesar led unsuccessful Roman invasion 55 BC.
    AD 43: Emperor Claudius led successful Roman invasion.
    Boudicca: Queen of Iceni in eastern England, fought against Romans. Statue on Westminster Bridge in London.
    Areas of Scotland never conquered by Romans.
    Hadrian's Wall: Built by Emperor Hadrian in north England to keep out Picts (Scottish ancestors). Forts include Housesteads and Vindolanda. UNESCO World Heritage Site.
    Romans remained 400 years. Built roads, public buildings, created law structure, introduced new plants and animals.
    3rd and 4th centuries AD: First Christian communities appeared in Britain.
    
    ANGLO-SAXONS:
    AD 410: Roman army left Britain, never returned.
    Invaded by Jutes, Angles, and Saxons from northern Europe.
    Their languages basis of modern English.
    By AD 600: Anglo-Saxon kingdoms established in Britain, mainly in England.
    Sutton Hoo in Suffolk: Burial place of Anglo-Saxon king with treasure and armour in ship under earth mound.
    West Britain (Wales) and Scotland remained free of Anglo-Saxon rule.
    Not Christians initially. Missionaries came to preach Christianity.
    St Patrick: Patron saint of Ireland. St Columba: Founded monastery on Iona island off Scotland.
    St Augustine: Led missionaries from Rome, spread Christianity in south, became first Archbishop of Canterbury.
    
    VIKINGS:
    Came from Denmark and Norway. First visited AD 789 to raid coastal towns.
    Stayed and formed communities in east England and Scotland.
    King Alfred the Great united Anglo-Saxon kingdoms and defeated Vikings.
    Many Vikings stayed in Britain, especially east and north England in area called Danelaw.
    Place names like Grimsby and Scunthorpe come from Viking languages.
    Viking settlers mixed with local communities, some converted to Christianity.
    Danish kings ruled briefly: first was Cnut (also called Canute).
    In north, Viking threat encouraged people to unite under King Kenneth MacAlpin. Term Scotland began to be used.
    
    NORMAN CONQUEST:
    1066: William, Duke of Normandy, defeated Harold (Saxon king) at Battle of Hastings. Harold killed in battle.
    William became king of England, known as William the Conqueror.
    Battle commemorated in Bayeux Tapestry, still seen in France today.
    Last successful foreign invasion of England.
    Led to changes in government and social structures.
    Norman French influenced development of English language.
    Normans conquered Wales initially but Welsh gradually won territory back.
    Scots and Normans fought on border; Normans took some border land but didn't invade Scotland.
    Domesday Book: William sent people across England to list towns, villages, people, land ownership, animals. Still exists today.
    
    EQUAL SOCIETY:
    Legal requirement: no discrimination against men and women because of gender or marital status.
    Equal rights to work, own property, marry and divorce.
    Both parents equally responsible for children.
    Women make up about half workforce.
    Girls leave school with better qualifications than boys.
    More women than men study at university.
    Women work in all sectors, more in high-level positions than ever.
    Men work in more varied jobs than past.
    No longer expected women stay home and not work.
    Both partners often work and share childcare and household responsibilities.
    `;

    const prompt = `Using ONLY authentic facts from the official Life in UK test handbook, generate an educational text passage about "${topic}". 
    Create a flowing, informative paragraph that reads naturally with 8-12 multiple choice questions embedded directly within the text using inline format.
    Each choice should use the format {correct_answer|option2|option3|option4} where the FIRST option is always the correct answer.
    Difficulty level: ${difficulty}/5 (1=basic, 5=advanced)
    
    ${lifeInUKFacts}
    
    CRITICAL: Use ONLY the authentic facts from the official Life in UK study guide provided above. Create educational passages like:
    "The Norman Conquest occurred in {1066|1065|1067|1070} when William, Duke of {Normandy|Brittany|Anjou|Maine}, defeated Harold at the Battle of {Hastings|Stamford Bridge|Bannockburn|Agincourt}. This was the {last|first|second|third} successful foreign invasion of England..."
    
    IMPORTANT: Maximize the number of inline choices throughout the text using ONLY verified facts. Include choices for:
    - Exact historical dates (AD 43, AD 410, AD 789, 1066, etc.)
    - Real historical figures (Julius Caesar, Boudicca, William the Conqueror, King Alfred, etc.)
    - Actual places and landmarks (Stonehenge, Skara Brae, Hadrian's Wall, Sutton Hoo, etc.)
    - Government structure and values (Democracy, Rule of law, Individual liberty, etc.)
    - Population statistics from official data (4 million in 1600, 8 million in 1801, 84% England, etc.)
    - Currency information (pound sterling, 100 pence, £1 and £2 coins, etc.)
    - Capital cities (London, Edinburgh, Cardiff, Belfast)
    - Languages (English, Welsh, Gaelic, Celtic language family)
    
    Create natural flowing text that educates students about Life in UK topics while testing their knowledge.
    
    Return the response in this exact JSON format:
    {
      "topic": "${topic}",
      "text": "A natural, educational paragraph using authentic Life in UK facts with many inline multiple choice using {correct|wrong1|wrong2|wrong3} format throughout the text that flows well and reads naturally"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in the official Life in UK test handbook from lifeintheuktests.co.uk study guide. Generate ONLY authentic content using verified facts, exact dates, real names, and accurate information that appears in the official test materials. Never invent, approximate, or use unverified information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    // Validate the response structure
    if (!result.topic || !result.text) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Ensure the text contains inline choices
    const inlineChoiceRegex = /\{([^}]+)\}/g;
    const matches = result.text.match(inlineChoiceRegex);
    if (!matches || matches.length === 0) {
      throw new Error("Generated text must contain inline multiple choice options using {option1|option2|option3|option4} format");
    }

    return result as ExerciseContent;
  } catch (error) {
    console.error("Error generating exercise:", error);
    throw new Error("Failed to generate exercise: " + (error as Error).message);
  }
}

export async function generateExerciseVariation(originalExercise: ExerciseContent): Promise<ExerciseContent> {
  try {
    // Use same authentic Life in UK facts from official study guide
    const lifeInUKFacts = `
    OFFICIAL LIFE IN UK TEST FACTS (from lifeintheuktests.co.uk study guide):
    
    FUNDAMENTAL VALUES: Democracy, Rule of law, Individual liberty, Tolerance of different faiths and beliefs, Participation in community life.
    
    UK STRUCTURE: UK made up of England, Scotland, Wales and Northern Ireland. Official name: United Kingdom of Great Britain and Northern Ireland.
    Capital cities: London (UK), Edinburgh (Scotland), Cardiff (Wales), Belfast (Northern Ireland).
    Population distribution: England 84%, Scotland just over 8%, Wales around 5%, Northern Ireland less than 3%.
    
    EARLY HISTORY:
    Stone Age: First farmers arrived 6,000 years ago. Stonehenge in Wiltshire. Skara Brae on Orkney.
    Bronze Age: 4,000 years ago, people made bronze, lived in roundhouses.
    Iron Age: Made iron weapons, lived in hill forts like Maiden Castle in Dorset.
    Romans: Julius Caesar invaded 55 BC (unsuccessful). Claudius successful invasion AD 43. Boudicca fought Romans. Hadrian's Wall built. Romans left AD 410.
    Anglo-Saxons: Jutes, Angles, Saxons invaded after Romans left. By AD 600 established kingdoms. Sutton Hoo burial site in Suffolk.
    Vikings: First came AD 789 from Denmark and Norway. King Alfred the Great defeated them. Danelaw area in east England.
    Norman Conquest: 1066 Battle of Hastings, William the Conqueror defeated Harold. Commemorated in Bayeux Tapestry. Domesday Book created.
    
    CURRENCY: Pound sterling (£). 100 pence in pound. Coins: 1p, 2p, 5p, 10p, 20p, 50p, £1, £2. Notes: £5, £10, £20, £50.
    
    LANGUAGES: English with many accents and dialects. Welsh spoken in Wales. Gaelic in parts of Scotland Highlands and Islands. Irish Gaelic in Northern Ireland.
    
    EQUAL SOCIETY: No discrimination by gender or marital status. Equal rights to work, own property, marry, divorce. Women make up half workforce. More women than men study at university.
    `;

    const prompt = `Based on this existing Life in UK test exercise, create a completely new variation using different authentic facts:

    Original topic: ${originalExercise.topic}
    
    ${lifeInUKFacts}
    
    CRITICAL: Use ONLY authentic facts from the official Life in UK test handbook provided above. Create a completely new text passage about the same topic category but with different authentic facts, examples, and structure.
    Generate 8-12 new inline multiple choice questions that test real Life in UK knowledge.
    Each choice should use the format {correct_answer|option2|option3|option4} where the FIRST option is always the correct answer.
    This variation should test different authentic facts within the same topic area.
    
    IMPORTANT: Maximize the number of inline choices throughout the text. Use only real dates, names, places, numbers, and facts from the authentic content provided.
    
    Return the response in this exact JSON format:
    {
      "topic": "${originalExercise.topic}",
      "text": "A completely new paragraph using different authentic Life in UK facts with many inline multiple choice using {correct|wrong1|wrong2|wrong3} format"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in the official Life in UK test handbook from lifeintheuktests.co.uk study guide. Create ONLY authentic variations using verified facts from the official test materials. Never invent dates, names, or information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    if (!result.topic || !result.text) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Ensure the text contains inline choices
    const inlineChoiceRegex = /\{([^}]+)\}/g;
    const matches = result.text.match(inlineChoiceRegex);
    if (!matches || matches.length === 0) {
      throw new Error("Generated text must contain inline multiple choice options using {option1|option2|option3|option4} format");
    }

    return result as ExerciseContent;
  } catch (error) {
    console.error("Error generating exercise variation:", error);
    throw new Error("Failed to generate exercise variation: " + (error as Error).message);
  }
}
