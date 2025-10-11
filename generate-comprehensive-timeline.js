// Generate comprehensive timeline content for all sections from book content
import { db } from './server/db.ts';
import { books, bookChunks, timelineEvents } from './shared/schema.ts';
import { eq, desc, sql } from 'drizzle-orm';

// Comprehensive timeline events for all sections based on Life in UK test content
const COMPREHENSIVE_TIMELINE_EVENTS = {
  // Parliament & Government
  parliament: [
    {
      title: "Magna Carta",
      description: "King John signs the Great Charter, limiting royal power and establishing the principle that the king is subject to the law",
      details: "Magna Carta, signed in 1215, was the first document to limit the power of the English monarch. It established the principle that the king was subject to the law and influenced the development of constitutional government worldwide. This document became a cornerstone of English constitutional law.",
      year: 1215,
      category: "documents",
      importance: 5,
      keyFigures: "King John, Archbishop Stephen Langton",
      timelineTopic: "parliament"
    },
    {
      title: "Model Parliament",
      description: "Edward I calls the first representative parliament, establishing the foundation of the modern parliamentary system",
      details: "In 1295, Edward I called the Model Parliament, which included representatives from the clergy, nobility, and commoners. This established the principle of parliamentary representation and laid the foundation for the modern House of Commons and House of Lords.",
      year: 1295,
      category: "parliament",
      importance: 5,
      keyFigures: "Edward I",
      timelineTopic: "parliament"
    },
    {
      title: "English Civil War",
      description: "Parliament defeats the king, leading to the execution of Charles I and the establishment of a republic",
      details: "The English Civil War (1642-1651) was fought between Parliamentarians and Royalists. It resulted in the execution of Charles I and the establishment of a republic under Oliver Cromwell. This conflict established the principle that Parliament could challenge royal authority.",
      year: 1642,
      category: "parliament",
      importance: 5,
      keyFigures: "Charles I, Oliver Cromwell",
      timelineTopic: "parliament"
    },
    {
      title: "Glorious Revolution",
      description: "William of Orange becomes king, establishing constitutional monarchy and limiting royal power",
      details: "The Glorious Revolution of 1688 saw William of Orange and Mary become joint monarchs. This established constitutional monarchy and limited royal power, laying the foundation for modern British democracy and parliamentary sovereignty.",
      year: 1688,
      category: "parliament",
      importance: 5,
      keyFigures: "William III, Mary II, James II",
      timelineTopic: "parliament"
    },
    {
      title: "Great Reform Act",
      description: "First major expansion of voting rights and redistribution of parliamentary seats",
      details: "The Great Reform Act of 1832 expanded voting rights and redistributed parliamentary seats from rotten boroughs to industrial cities. Though it only increased the electorate by about 50%, it established the principle of parliamentary reform and democratic representation.",
      year: 1832,
      category: "parliament",
      importance: 5,
      keyFigures: "Earl Grey, William IV",
      timelineTopic: "parliament"
    },
    {
      title: "Second Reform Act",
      description: "Disraeli's Reform Act further expands voting rights, nearly doubling the electorate",
      details: "The Second Reform Act, passed by Disraeli's Conservative government, extends voting rights to working-class men in urban areas, nearly doubling the electorate. This represents a major step toward universal male suffrage.",
      year: 1867,
      category: "parliament",
      importance: 4,
      keyFigures: "Benjamin Disraeli, William Gladstone",
      timelineTopic: "parliament"
    },
    {
      title: "Third Reform Act",
      description: "Further expansion of voting rights to rural working men",
      details: "The Third Reform Act of 1884 extended voting rights to rural areas, bringing the franchise to rural working men for the first time. This significantly expanded democratic participation.",
      year: 1884,
      category: "parliament",
      importance: 4,
      keyFigures: "William Gladstone",
      timelineTopic: "parliament"
    },
    {
      title: "Representation of the People Act",
      description: "Women over 30 gain the right to vote, marking a major step toward universal suffrage",
      details: "The Representation of the People Act of 1918 granted voting rights to women over 30 and all men over 21. This was a major step toward universal suffrage and marked the beginning of women's political participation in Britain.",
      year: 1918,
      category: "parliament",
      importance: 5,
      keyFigures: "Emmeline Pankhurst, Millicent Fawcett",
      timelineTopic: "parliament"
    },
    {
      title: "Equal Franchise Act",
      description: "Women gain equal voting rights with men at age 21",
      details: "The Equal Franchise Act of 1928 granted women the same voting rights as men, with both able to vote at age 21. This completed the process of universal suffrage in Britain.",
      year: 1928,
      category: "parliament",
      importance: 5,
      keyFigures: "Nancy Astor, Margaret Bondfield",
      timelineTopic: "parliament"
    }
  ],

  // Documents
  documents: [
    {
      title: "Magna Carta",
      description: "The Great Charter limiting royal power and establishing the rule of law",
      details: "Magna Carta, signed by King John in 1215, was the first document to limit the power of the English monarch. It established the principle that the king was subject to the law and influenced constitutional government worldwide.",
      year: 1215,
      category: "documents",
      importance: 5,
      keyFigures: "King John, Archbishop Stephen Langton",
      timelineTopic: "documents"
    },
    {
      title: "Domesday Book",
      description: "First comprehensive survey of England commissioned by William the Conqueror",
      details: "The Domesday Book was a detailed survey of England's land, people, and resources completed in 1086. It was the first comprehensive census in English history and remains an important historical document.",
      year: 1086,
      category: "documents",
      importance: 4,
      keyFigures: "William the Conqueror",
      timelineTopic: "documents"
    },
    {
      title: "Bill of Rights",
      description: "Establishes constitutional limits on royal power and parliamentary supremacy",
      details: "The Bill of Rights of 1689 established constitutional limits on royal power and affirmed parliamentary supremacy. It prohibited the monarch from suspending laws, levying taxes, or maintaining a standing army without parliamentary consent.",
      year: 1689,
      category: "documents",
      importance: 5,
      keyFigures: "William III, Mary II",
      timelineTopic: "documents"
    },
    {
      title: "Act of Settlement",
      description: "Establishes Protestant succession and limits royal power",
      details: "The Act of Settlement of 1701 established the Protestant succession to the English throne and limited royal power by requiring parliamentary consent for royal marriages and foreign wars.",
      year: 1701,
      category: "documents",
      importance: 4,
      keyFigures: "William III",
      timelineTopic: "documents"
    },
    {
      title: "Act of Union",
      description: "England and Scotland unite to form Great Britain",
      details: "The Act of Union in 1707 united England and Scotland to form Great Britain. This created a single parliament and established the foundation for the modern United Kingdom.",
      year: 1707,
      category: "documents",
      importance: 5,
      keyFigures: "Queen Anne",
      timelineTopic: "documents"
    },
    {
      title: "Human Rights Act",
      description: "Incorporates European Convention on Human Rights into UK law",
      details: "The Human Rights Act of 1998 incorporated the European Convention on Human Rights into UK law, making it enforceable in UK courts. This strengthened individual rights and freedoms.",
      year: 1998,
      category: "documents",
      importance: 4,
      keyFigures: "Tony Blair",
      timelineTopic: "documents"
    }
  ],

  // Voting Rights
  voting_rights: [
    {
      title: "Great Reform Act",
      description: "First major expansion of voting rights to middle-class men",
      details: "The Great Reform Act of 1832 expanded voting rights to middle-class men and redistributed parliamentary seats from rotten boroughs to industrial cities. This established the principle of parliamentary reform.",
      year: 1832,
      category: "voting_rights",
      importance: 5,
      keyFigures: "Earl Grey, William IV",
      timelineTopic: "voting_rights"
    },
    {
      title: "Second Reform Act",
      description: "Working-class men in towns gain the vote",
      details: "The Second Reform Act of 1867 extended voting rights to working-class men in urban areas, nearly doubling the electorate. This was a major step toward universal male suffrage.",
      year: 1867,
      category: "voting_rights",
      importance: 4,
      keyFigures: "Benjamin Disraeli",
      timelineTopic: "voting_rights"
    },
    {
      title: "Third Reform Act",
      description: "Rural working men gain the vote",
      details: "The Third Reform Act of 1884 extended voting rights to rural working men, further expanding democratic participation across the country.",
      year: 1884,
      category: "voting_rights",
      importance: 4,
      keyFigures: "William Gladstone",
      timelineTopic: "voting_rights"
    },
    {
      title: "Representation of the People Act",
      description: "Women over 30 gain the right to vote",
      details: "The Representation of the People Act of 1918 granted voting rights to women over 30 and all men over 21. This marked the beginning of women's political participation in Britain.",
      year: 1918,
      category: "voting_rights",
      importance: 5,
      keyFigures: "Emmeline Pankhurst, Millicent Fawcett",
      timelineTopic: "voting_rights"
    },
    {
      title: "Equal Franchise Act",
      description: "Women gain equal voting rights with men",
      details: "The Equal Franchise Act of 1928 granted women the same voting rights as men, completing the process of universal suffrage in Britain.",
      year: 1928,
      category: "voting_rights",
      importance: 5,
      keyFigures: "Nancy Astor",
      timelineTopic: "voting_rights"
    },
    {
      title: "Voting Age Lowered",
      description: "Voting age reduced from 21 to 18",
      details: "The voting age was reduced from 21 to 18 in 1969, extending democratic participation to younger adults and reflecting social changes of the 1960s.",
      year: 1969,
      category: "voting_rights",
      importance: 3,
      keyFigures: "Harold Wilson",
      timelineTopic: "voting_rights"
    }
  ],

  // Territories
  territories: [
    {
      title: "Norman Conquest",
      description: "William the Conqueror establishes Norman rule in England",
      details: "The Norman Conquest of 1066 saw William, Duke of Normandy, defeat King Harold II at the Battle of Hastings. This began Norman rule and transformed English society, law, and language.",
      year: 1066,
      category: "territories",
      importance: 5,
      keyFigures: "William the Conqueror, Harold II",
      timelineTopic: "territories"
    },
    {
      title: "Act of Union with Scotland",
      description: "England and Scotland unite to form Great Britain",
      details: "The Act of Union in 1707 united England and Scotland to form Great Britain. This created a single parliament and established the foundation for the modern United Kingdom.",
      year: 1707,
      category: "territories",
      importance: 5,
      keyFigures: "Queen Anne",
      timelineTopic: "territories"
    },
    {
      title: "Act of Union with Ireland",
      description: "Ireland formally joins Great Britain to create the United Kingdom",
      details: "The Act of Union of 1801 merged the Kingdom of Ireland with Great Britain, creating the United Kingdom of Great Britain and Ireland. The Irish Parliament was dissolved, and Ireland sent representatives to Westminster.",
      year: 1801,
      category: "territories",
      importance: 5,
      keyFigures: "George III, William Pitt the Younger",
      timelineTopic: "territories"
    },
    {
      title: "Irish Independence",
      description: "Ireland gains independence, creating the modern United Kingdom",
      details: "The Anglo-Irish Treaty of 1921 led to the creation of the Irish Free State, while Northern Ireland remained part of the United Kingdom. This established the modern boundaries of the UK.",
      year: 1921,
      category: "territories",
      importance: 5,
      keyFigures: "Michael Collins, David Lloyd George",
      timelineTopic: "territories"
    },
    {
      title: "Devolution to Scotland and Wales",
      description: "Scotland and Wales gain devolved governments",
      details: "The Scotland Act 1998 and Government of Wales Act 1998 established devolved governments in Scotland and Wales, giving them powers over domestic affairs while remaining part of the UK.",
      year: 1998,
      category: "territories",
      importance: 4,
      keyFigures: "Tony Blair, Donald Dewar",
      timelineTopic: "territories"
    }
  ],

  // Trade and Economic History
  trades: [
    {
      title: "Industrial Revolution Begins",
      description: "Manufacturing transforms British economy and society",
      details: "The Industrial Revolution began in Britain around 1750, transforming the country from an agricultural society to an industrial one. Key developments included steam power, textile manufacturing, and the growth of cities.",
      year: 1750,
      category: "trades",
      importance: 5,
      keyFigures: "James Watt, Richard Arkwright",
      timelineTopic: "trades"
    },
    {
      title: "Corn Laws Repealed",
      description: "Move toward free trade begins",
      details: "The repeal of the Corn Laws in 1846 abolished protective tariffs on grain, marking a shift from protectionism to free trade. This was a major step toward Britain's free trade policy.",
      year: 1846,
      category: "trades",
      importance: 4,
      keyFigures: "Robert Peel, Richard Cobden",
      timelineTopic: "trades"
    },
    {
      title: "Cobden-Chevalier Treaty",
      description: "Free trade agreement with France",
      details: "The Cobden-Chevalier Treaty of 1860 was the first major bilateral free trade agreement, launching an era of international trade liberalization and establishing Britain as a champion of free trade.",
      year: 1860,
      category: "trades",
      importance: 4,
      keyFigures: "Richard Cobden, Michel Chevalier",
      timelineTopic: "trades"
    },
    {
      title: "UK Joins European Economic Community",
      description: "Britain enters European common market",
      details: "Britain joined the EEC in 1973 to access European markets, marking a shift toward European economic integration. This was a major step in Britain's relationship with Europe.",
      year: 1973,
      category: "trades",
      importance: 4,
      keyFigures: "Edward Heath",
      timelineTopic: "trades"
    },
    {
      title: "Brexit",
      description: "UK leaves the European Union",
      details: "In 2016, the UK voted to leave the European Union in a referendum. This decision led to years of negotiations and the UK's eventual departure from the EU in 2020, pursuing independent trade policy.",
      year: 2016,
      category: "trades",
      importance: 5,
      keyFigures: "David Cameron, Boris Johnson",
      timelineTopic: "trades"
    }
  ],

  // Population & Migration
  "population-migration": [
    {
      title: "Norman Conquest Migration",
      description: "Norman settlers arrive in England after the conquest",
      details: "Following the Norman Conquest in 1066, thousands of Normans migrated to England, bringing their language, culture, and administrative systems. This created a new ruling class and influenced English society.",
      year: 1066,
      category: "population-migration",
      importance: 4,
      keyFigures: "William the Conqueror, Norman settlers",
      timelineTopic: "population-migration"
    },
    {
      title: "Huguenot Migration",
      description: "French Protestants flee religious persecution and settle in Britain",
      details: "Thousands of Huguenots (French Protestants) fled religious persecution in France and settled in Britain, particularly in London and other major cities. They brought skills in silk weaving, watchmaking, and other crafts.",
      year: 1685,
      category: "population-migration",
      importance: 3,
      keyFigures: "Huguenot refugees",
      timelineTopic: "population-migration"
    },
    {
      title: "Irish Famine Migration",
      description: "Massive Irish migration to Britain during the potato famine",
      details: "The Irish Potato Famine (1845-1852) caused massive migration to Britain, with over 1 million Irish people fleeing starvation and disease. This created large Irish communities in British cities.",
      year: 1845,
      category: "population-migration",
      importance: 5,
      keyFigures: "Irish famine refugees",
      timelineTopic: "population-migration"
    },
    {
      title: "Windrush Generation",
      description: "Post-war Caribbean migration to Britain",
      details: "The Windrush Generation refers to Caribbean immigrants who arrived in Britain between 1948 and 1971. They came to help rebuild post-war Britain and made significant contributions to British society.",
      year: 1948,
      category: "population-migration",
      importance: 4,
      keyFigures: "Windrush passengers",
      timelineTopic: "population-migration"
    },
    {
      title: "Ugandan Asian Expulsion",
      description: "40,000 Ugandan Asians expelled by Idi Amin arrive in Britain",
      details: "Idi Amin's expulsion of Uganda's Asian population brought 40,000 refugees to Britain in 1972. Despite initial challenges, these refugees successfully integrated and made significant contributions to British business.",
      year: 1972,
      category: "population-migration",
      importance: 4,
      keyFigures: "Ugandan Asian refugees, Idi Amin",
      timelineTopic: "population-migration"
    },
    {
      title: "Eastern European Migration",
      description: "Fall of communism brings new wave of Eastern European migrants",
      details: "The collapse of communist regimes in Eastern Europe led to increased migration to Britain from countries like Poland, Czech Republic, and Hungary. This migration accelerated after EU enlargement in 2004.",
      year: 1990,
      category: "population-migration",
      importance: 3,
      keyFigures: "Eastern European migrants",
      timelineTopic: "population-migration"
    }
  ],

  // Sports & Athletics
  "sports-athletics": [
    {
      title: "Rugby Invented at Rugby School",
      description: "William Webb Ellis allegedly picks up the ball during a football match, inventing rugby",
      details: "According to legend, William Webb Ellis picked up the ball and ran with it during a football match at Rugby School in 1823, creating rugby. Rugby School codified the rules that became rugby football.",
      year: 1823,
      category: "sports-athletics",
      importance: 4,
      keyFigures: "William Webb Ellis, Rugby School",
      timelineTopic: "sports-athletics"
    },
    {
      title: "Football Association Founded",
      description: "The Football Association established in London, creating standardized rules for football",
      details: "The FA was formed at Freeman's Tavern in London in 1863, establishing the first standardized rules for football. This led to the development of modern soccer and its spread worldwide.",
      year: 1863,
      category: "sports-athletics",
      importance: 5,
      keyFigures: "Ebenezer Cobb Morley, founding members",
      timelineTopic: "sports-athletics"
    },
    {
      title: "First FA Cup Final",
      description: "First FA Cup Final held at Kennington Oval",
      details: "The FA Cup became the world's oldest football knockout competition. The first final drew 2,000 spectators and established a tradition that continues today, with the final now held at Wembley Stadium.",
      year: 1872,
      category: "sports-athletics",
      importance: 4,
      keyFigures: "FA Cup founders",
      timelineTopic: "sports-athletics"
    },
    {
      title: "The Open Championship First Held",
      description: "The first Open Championship (golf) held at Prestwick Golf Club in Scotland",
      details: "The Open Championship became golf's oldest major championship, held annually in Britain. This established golf's competitive structure and helped spread the sport globally.",
      year: 1860,
      category: "sports-athletics",
      importance: 4,
      keyFigures: "Willie Park Sr. (first winner)",
      timelineTopic: "sports-athletics"
    },
    {
      title: "England Wins World Cup",
      description: "England defeats West Germany 4-2 at Wembley to win their first and only FIFA World Cup",
      details: "England's World Cup victory was the pinnacle of British football achievement. Geoff Hurst's hat-trick in the final and Bobby Moore lifting the trophy created lasting memories.",
      year: 1966,
      category: "sports-athletics",
      importance: 5,
      keyFigures: "Bobby Moore, Geoff Hurst, Alf Ramsey",
      timelineTopic: "sports-athletics"
    },
    {
      title: "Premier League Founded",
      description: "The FA Premier League established, revolutionizing English football",
      details: "The Premier League transformed English football through massive TV deals and global marketing. It became the world's most-watched football league, attracting international stars and investment.",
      year: 1992,
      category: "sports-athletics",
      importance: 4,
      keyFigures: "Premier League founders",
      timelineTopic: "sports-athletics"
    }
  ],

  // Inventions & Discoveries
  inventions: [
    {
      title: "James Watt's Steam Engine",
      description: "Improved steam engine powers Industrial Revolution",
      details: "James Watt's separate condenser greatly improved the efficiency of steam engines, making them practical for widespread industrial use. This innovation was crucial to the Industrial Revolution and modern manufacturing.",
      year: 1776,
      category: "inventions",
      importance: 5,
      keyFigures: "James Watt",
      timelineTopic: "inventions"
    },
    {
      title: "Richard Arkwright's Water Frame",
      description: "Water-powered spinning machine revolutionizes textile production",
      details: "Richard Arkwright's water frame was the first successful water-powered spinning machine, producing stronger cotton thread than previous methods. This innovation helped establish the factory system and mass production.",
      year: 1769,
      category: "inventions",
      importance: 4,
      keyFigures: "Richard Arkwright",
      timelineTopic: "inventions"
    },
    {
      title: "George Stephenson's Steam Locomotive",
      description: "First practical steam locomotive for railways",
      details: "George Stephenson built the first practical steam locomotive 'Blücher' and later 'The Rocket.' His innovations in railway engineering made steam trains viable for both passenger and freight transport.",
      year: 1814,
      category: "inventions",
      importance: 5,
      keyFigures: "George Stephenson",
      timelineTopic: "inventions"
    },
    {
      title: "Isambard Kingdom Brunel's Engineering Marvels",
      description: "Revolutionary railway, bridge, and ship engineering",
      details: "Isambard Kingdom Brunel designed the Great Western Railway, the Clifton Suspension Bridge, and pioneering steamships including the SS Great Britain. His innovative engineering transformed British infrastructure.",
      year: 1833,
      category: "inventions",
      importance: 5,
      keyFigures: "Isambard Kingdom Brunel",
      timelineTopic: "inventions"
    },
    {
      title: "Florence Nightingale's Modern Nursing",
      description: "Founded modern nursing practices and hospital sanitation",
      details: "Florence Nightingale revolutionized nursing during the Crimean War, introducing sanitary practices that dramatically reduced death rates. She established the first secular nursing school and created the foundation of modern healthcare.",
      year: 1854,
      category: "inventions",
      importance: 5,
      keyFigures: "Florence Nightingale",
      timelineTopic: "inventions"
    },
    {
      title: "Tim Berners-Lee's World Wide Web",
      description: "Invented the World Wide Web and HTML",
      details: "Tim Berners-Lee created the World Wide Web while working at CERN, inventing HTML, HTTP, and URLs. He chose not to patent his invention, making the web free for everyone and transforming global communication.",
      year: 1989,
      category: "inventions",
      importance: 5,
      keyFigures: "Tim Berners-Lee",
      timelineTopic: "inventions"
    },
    {
      title: "Ian Wilmut's Dolly the Sheep Cloning",
      description: "First successful cloning of an adult mammal",
      details: "Ian Wilmut and Keith Campbell successfully cloned Dolly the sheep at the Roslin Institute, the first mammal cloned from an adult somatic cell. This breakthrough opened new possibilities in genetics and medicine.",
      year: 1996,
      category: "inventions",
      importance: 5,
      keyFigures: "Ian Wilmut, Keith Campbell",
      timelineTopic: "inventions"
    }
  ],

  // Arts & Visual Culture
  arts: [
    {
      title: "William Hogarth's Social Commentary",
      description: "Pioneer of British art and social criticism through painting",
      details: "William Hogarth was a painter, printmaker, and social critic who created works like 'A Rake's Progress' and 'Marriage à-la-mode.' He is considered the father of British art and influenced generations of artists.",
      year: 1720,
      category: "arts",
      importance: 4,
      keyFigures: "William Hogarth",
      timelineTopic: "arts"
    },
    {
      title: "J.M.W. Turner's Romantic Landscapes",
      description: "Revolutionary landscape painter who influenced Impressionism",
      details: "J.M.W. Turner was a Romantic landscape painter known for his dramatic seascapes and innovative use of light and color. His work influenced the Impressionists and established British landscape painting.",
      year: 1800,
      category: "arts",
      importance: 4,
      keyFigures: "J.M.W. Turner",
      timelineTopic: "arts"
    },
    {
      title: "Pre-Raphaelite Brotherhood",
      description: "Art movement emphasizing detailed, colorful paintings with moral themes",
      details: "The Pre-Raphaelite Brotherhood, founded in 1848, was a group of English painters who rejected academic art in favor of detailed, colorful works inspired by medieval and early Renaissance art.",
      year: 1848,
      category: "arts",
      importance: 4,
      keyFigures: "Dante Gabriel Rossetti, John Everett Millais, William Holman Hunt",
      timelineTopic: "arts"
    },
    {
      title: "Arts and Crafts Movement",
      description: "Design movement emphasizing traditional craftsmanship and simple forms",
      details: "The Arts and Crafts Movement, led by William Morris, emphasized traditional craftsmanship and simple forms. It influenced architecture, furniture, and decorative arts throughout Britain.",
      year: 1860,
      category: "arts",
      importance: 4,
      keyFigures: "William Morris, John Ruskin",
      timelineTopic: "arts"
    }
  ],

  // Literature & Writers
  literature: [
    {
      title: "Beowulf",
      description: "Old English epic poem, one of the earliest works of English literature",
      details: "Beowulf is an Old English epic poem, one of the earliest and most important works of English literature. It tells the story of the hero Beowulf and his battles with monsters.",
      year: 1000,
      category: "literature",
      importance: 4,
      keyFigures: "Anonymous Anglo-Saxon poet",
      timelineTopic: "literature"
    },
    {
      title: "Geoffrey Chaucer's Canterbury Tales",
      description: "Foundational work of English literature and poetry",
      details: "Geoffrey Chaucer's Canterbury Tales, written in Middle English, is considered one of the greatest works of English literature. It established English as a literary language and influenced generations of writers.",
      year: 1387,
      category: "literature",
      importance: 5,
      keyFigures: "Geoffrey Chaucer",
      timelineTopic: "literature"
    },
    {
      title: "William Shakespeare's Works",
      description: "Greatest playwright in English literature",
      details: "William Shakespeare wrote approximately 37 plays and 154 sonnets, establishing himself as the greatest playwright in English literature. His works continue to be performed and studied worldwide.",
      year: 1590,
      category: "literature",
      importance: 5,
      keyFigures: "William Shakespeare",
      timelineTopic: "literature"
    },
    {
      title: "Jane Austen's Novels",
      description: "Pioneer of the novel of manners and social commentary",
      details: "Jane Austen's novels, including Pride and Prejudice and Sense and Sensibility, perfected the novel of manners. Her works combine romance with sharp social observation and wit.",
      year: 1813,
      category: "literature",
      importance: 5,
      keyFigures: "Jane Austen",
      timelineTopic: "literature"
    },
    {
      title: "Charles Dickens' Social Novels",
      description: "Victorian novelist who exposed social problems through fiction",
      details: "Charles Dickens wrote novels like Oliver Twist, David Copperfield, and A Tale of Two Cities. His works exposed social problems and influenced social reform in Victorian Britain.",
      year: 1837,
      category: "literature",
      importance: 5,
      keyFigures: "Charles Dickens",
      timelineTopic: "literature"
    },
    {
      title: "J.K. Rowling's Harry Potter",
      description: "Global literary phenomenon that reinvigorated children's literature",
      details: "J.K. Rowling's Harry Potter series became the best-selling book series in history, reinvigorating children's literature and reading. The series achieved unprecedented global success, spawning films and theme parks.",
      year: 1997,
      category: "literature",
      importance: 4,
      keyFigures: "J.K. Rowling",
      timelineTopic: "literature"
    }
  ],

  // British Holidays & Traditions
  "british-holidays": [
    {
      title: "Guy Fawkes Night",
      description: "Annual celebration commemorating the failed Gunpowder Plot",
      details: "Guy Fawkes Night, celebrated on November 5th, commemorates the failed Gunpowder Plot of 1605. The tradition includes bonfires, fireworks, and burning effigies of Guy Fawkes.",
      year: 1605,
      category: "british-holidays",
      importance: 4,
      keyFigures: "Guy Fawkes, Robert Catesby",
      timelineTopic: "british-holidays"
    },
    {
      title: "Boxing Day Formalized",
      description: "Boxing Day becomes an official holiday, traditionally for giving gifts to servants",
      details: "Boxing Day, December 26th, became formalized as a holiday when servants and tradespeople received Christmas boxes from their employers. The tradition evolved into a general day of gift-giving and family visits.",
      year: 1838,
      category: "british-holidays",
      importance: 4,
      keyFigures: "Victorian employers and servants",
      timelineTopic: "british-holidays"
    },
    {
      title: "Bank Holidays Act",
      description: "Sir John Lubbock's Bank Holidays Act creates the first official public holidays",
      details: "The Bank Holidays Act established Easter Monday, Whit Monday, the first Monday in August, and Boxing Day as official public holidays. These 'St. Lubbock's Days' gave workers guaranteed time off.",
      year: 1871,
      category: "british-holidays",
      importance: 5,
      keyFigures: "Sir John Lubbock",
      timelineTopic: "british-holidays"
    },
    {
      title: "Silver Jubilee Celebrations",
      description: "Queen Elizabeth II's Silver Jubilee creates nationwide community celebrations",
      details: "The Silver Jubilee saw millions participate in street parties and community celebrations across Britain. The jubilee established the tradition of community-organized royal celebrations.",
      year: 1977,
      category: "british-holidays",
      importance: 4,
      keyFigures: "Queen Elizabeth II, local communities",
      timelineTopic: "british-holidays"
    }
  ],

  // Church Evolution
  church: [
    {
      title: "English Reformation",
      description: "Henry VIII breaks with Rome, establishing the Church of England",
      details: "The English Reformation began when Henry VIII broke with the Catholic Church in Rome. This led to the establishment of the Church of England with the monarch as its head, fundamentally changing English religion and politics.",
      year: 1534,
      category: "church",
      importance: 5,
      keyFigures: "Henry VIII, Thomas Cromwell",
      timelineTopic: "church"
    },
    {
      title: "Methodist Movement",
      description: "John Wesley founds Methodism, influencing working-class communities",
      details: "John Wesley founded the Methodist movement, which became highly influential in working-class communities throughout the UK. Methodism emphasized personal piety and social reform.",
      year: 1738,
      category: "church",
      importance: 4,
      keyFigures: "John Wesley, George Whitefield",
      timelineTopic: "church"
    },
    {
      title: "Catholic Emancipation",
      description: "Catholics gain civil rights across the UK",
      details: "The Catholic Emancipation Act of 1829 removed most restrictions on Catholics throughout the UK, allowing them to participate fully in public life. This was particularly significant in Ireland.",
      year: 1829,
      category: "church",
      importance: 5,
      keyFigures: "Daniel O'Connell, Duke of Wellington",
      timelineTopic: "church"
    },
    {
      title: "Church of England Ordains Women Priests",
      description: "Anglican Church allows women's ordination despite controversy",
      details: "The Church of England voted to ordain women as priests in 1992, causing significant controversy and some departures to Rome. This reform was gradually adopted by other Anglican churches in the UK.",
      year: 1992,
      category: "church",
      importance: 4,
      keyFigures: "Women clergy",
      timelineTopic: "church"
    },
    {
      title: "Church of England Approves Women Bishops",
      description: "Final barrier to women's leadership removed in Anglican Church",
      details: "The Church of England voted to allow women to become bishops in 2014, completing the process of gender equality in church leadership begun with women's ordination.",
      year: 2014,
      category: "church",
      importance: 4,
      keyFigures: "Women bishops",
      timelineTopic: "church"
    }
  ],

  // Historical Timeline
  historical: [
    {
      title: "Roman Britain",
      description: "Roman Empire conquers and rules Britain for nearly 400 years",
      details: "The Romans invaded Britain in 43 AD under Emperor Claudius. They built roads, towns, and brought Roman law, language, and culture. Major Roman sites include Hadrian's Wall, Bath, and London (Londinium).",
      year: 43,
      category: "historical",
      importance: 4,
      keyFigures: "Emperor Claudius, Boudicca",
      timelineTopic: "historical"
    },
    {
      title: "Anglo-Saxon Settlement",
      description: "Germanic tribes settle in Britain after Roman withdrawal",
      details: "After the Romans left in 410 AD, Anglo-Saxon tribes from Germany and Denmark settled in Britain. They established kingdoms and brought their language, which became Old English.",
      year: 450,
      category: "historical",
      importance: 4,
      keyFigures: "Alfred the Great",
      timelineTopic: "historical"
    },
    {
      title: "Viking Invasions",
      description: "Scandinavian Vikings raid and settle in Britain",
      details: "Vikings from Scandinavia began raiding Britain in the 8th century. They eventually settled in parts of England, Scotland, and Ireland, influencing British culture and language.",
      year: 793,
      category: "historical",
      importance: 3,
      keyFigures: "Ragnar Lothbrok, Ivar the Boneless",
      timelineTopic: "historical"
    },
    {
      title: "Battle of Hastings",
      description: "William the Conqueror defeats Harold II, beginning Norman rule",
      details: "The decisive battle that changed English history. William, Duke of Normandy, defeated King Harold II at Hastings on 14 October 1066. This began Norman rule and transformed English society, law, and language.",
      year: 1066,
      category: "historical",
      importance: 5,
      keyFigures: "William the Conqueror, Harold II",
      timelineTopic: "historical"
    },
    {
      title: "Hundred Years' War",
      description: "Series of conflicts between England and France",
      details: "The Hundred Years' War (1337-1453) was fought between England and France over the French throne. Famous battles include Crécy, Poitiers, and Agincourt. The war helped develop English national identity.",
      year: 1337,
      category: "historical",
      importance: 4,
      keyFigures: "Edward III, Henry V, Joan of Arc",
      timelineTopic: "historical"
    },
    {
      title: "Wars of the Roses",
      description: "Civil war between the Houses of Lancaster and York",
      details: "The Wars of the Roses (1455-1485) were fought between the rival houses of Lancaster and York for the English throne. The conflict ended when Henry Tudor (Henry VII) defeated Richard III at the Battle of Bosworth.",
      year: 1455,
      category: "historical",
      importance: 4,
      keyFigures: "Henry VII, Richard III, Edward IV",
      timelineTopic: "historical"
    }
  ],

  // British Sports Heritage
  "british-sports": [
    {
      title: "Rugby Invented at Rugby School",
      description: "William Webb Ellis allegedly picks up the ball during a football match, inventing rugby",
      details: "According to legend, William Webb Ellis picked up the ball and ran with it during a football match at Rugby School in 1823, creating rugby. Rugby School codified the rules that became rugby football.",
      year: 1823,
      category: "british-sports",
      importance: 4,
      keyFigures: "William Webb Ellis, Rugby School",
      timelineTopic: "british-sports"
    },
    {
      title: "Football Association Founded",
      description: "The Football Association established in London, creating standardized rules for football",
      details: "The FA was formed at Freeman's Tavern in London in 1863, establishing the first standardized rules for football. This led to the development of modern soccer and its spread worldwide.",
      year: 1863,
      category: "british-sports",
      importance: 5,
      keyFigures: "Ebenezer Cobb Morley, founding members",
      timelineTopic: "british-sports"
    },
    {
      title: "England Wins World Cup",
      description: "England defeats West Germany 4-2 at Wembley to win their first and only FIFA World Cup",
      details: "England's World Cup victory was the pinnacle of British football achievement. Geoff Hurst's hat-trick in the final and Bobby Moore lifting the trophy created lasting memories.",
      year: 1966,
      category: "british-sports",
      importance: 5,
      keyFigures: "Bobby Moore, Geoff Hurst, Alf Ramsey",
      timelineTopic: "british-sports"
    },
    {
      title: "Premier League Founded",
      description: "The FA Premier League established, revolutionizing English football",
      details: "The Premier League transformed English football through massive TV deals and global marketing. It became the world's most-watched football league, attracting international stars and investment.",
      year: 1992,
      category: "british-sports",
      importance: 4,
      keyFigures: "Premier League founders",
      timelineTopic: "british-sports"
    }
  ]
};

async function generateComprehensiveTimeline() {
  try {
    console.log('🚀 Starting comprehensive timeline generation for all sections...');
    
    // Clear existing timeline events
    console.log('🗑️ Clearing existing timeline events...');
    await db.delete(timelineEvents);
    console.log('✅ Existing timeline cleared');
    
    let totalEvents = 0;
    const newTimelineEvents = [];
    
    // Process each topic section
    for (const [topicId, events] of Object.entries(COMPREHENSIVE_TIMELINE_EVENTS)) {
      console.log(`\n📅 Processing ${topicId} section with ${events.length} events...`);
      
      for (const event of events) {
        const timelineEvent = {
          id: `${topicId}-${event.year}-${event.title.toLowerCase().replace(/\s+/g, '-')}`,
          title: event.title,
          description: event.description,
          details: event.details,
          year: event.year,
          category: event.category,
          importance: event.importance,
          keyFigures: event.keyFigures,
          timelineTopic: event.timelineTopic,
          eventImage: null,
          imageDescription: null
        };
        
        newTimelineEvents.push(timelineEvent);
        totalEvents++;
        console.log(`  ✅ Added: ${event.title} (${event.year})`);
      }
    }
    
    // Insert all timeline events
    console.log(`\n💾 Inserting ${totalEvents} comprehensive timeline events...`);
    
    if (newTimelineEvents.length > 0) {
      // Insert in batches to avoid memory issues
      const batchSize = 50;
      for (let i = 0; i < newTimelineEvents.length; i += batchSize) {
        const batch = newTimelineEvents.slice(i, i + batchSize);
        await db.insert(timelineEvents).values(batch);
        console.log(`  📝 Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(newTimelineEvents.length / batchSize)}`);
      }
      
      console.log(`\n🎉 Successfully generated and inserted ${totalEvents} timeline events!`);
      
      // Show summary by topic
      const topicSummary = {};
      newTimelineEvents.forEach(event => {
        topicSummary[event.timelineTopic] = (topicSummary[event.timelineTopic] || 0) + 1;
      });
      
      console.log('\n📊 Timeline Summary by Topic:');
      Object.entries(topicSummary).forEach(([topic, count]) => {
        console.log(`  ${topic}: ${count} events`);
      });
      
    } else {
      console.log('❌ No timeline events were generated');
    }
    
    console.log('\n✅ Comprehensive timeline generation complete!');
    console.log('💡 All timeline sections now have comprehensive content based on Life in UK test materials.');
    
  } catch (error) {
    console.error('❌ Error generating comprehensive timeline:', error);
    console.error(error);
  }
}

// Run the generation
generateComprehensiveTimeline();
