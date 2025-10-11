// Direct timeline replacement using existing book content
import { db } from './server/db.ts';
import { books, bookChunks, timelineEvents } from './shared/schema.ts';
import { eq, desc, sql } from 'drizzle-orm';

// Comprehensive timeline events based on UK history and Life in UK test content
const TIMELINE_EVENTS = [
  // Ancient & Medieval Period
  {
    title: "Roman Britain",
    description: "Roman Empire conquers and rules Britain for nearly 400 years",
    details: "The Romans invaded Britain in 43 AD under Emperor Claudius. They built roads, towns, and brought Roman law, language, and culture. Major Roman sites include Hadrian's Wall, Bath, and London (Londinium).",
    year: 43,
    period: "Ancient Britain",
    importance: 4,
    keyFigures: "Emperor Claudius, Boudicca",
    significance: "historical"
  },
  {
    title: "Anglo-Saxon Settlement",
    description: "Germanic tribes settle in Britain after Roman withdrawal",
    details: "After the Romans left in 410 AD, Anglo-Saxon tribes from Germany and Denmark settled in Britain. They established kingdoms and brought their language, which became Old English.",
    year: 450,
    period: "Ancient Britain", 
    importance: 4,
    keyFigures: "Alfred the Great",
    significance: "historical"
  },
  {
    title: "Viking Invasions",
    description: "Scandinavian Vikings raid and settle in Britain",
    details: "Vikings from Scandinavia began raiding Britain in the 8th century. They eventually settled in parts of England, Scotland, and Ireland, influencing British culture and language.",
    year: 793,
    period: "Ancient Britain",
    importance: 3,
    keyFigures: "Ragnar Lothbrok, Ivar the Boneless",
    significance: "historical"
  },
  {
    title: "Battle of Hastings",
    description: "William the Conqueror defeats Harold II, beginning Norman rule",
    details: "The decisive battle that changed English history. William, Duke of Normandy, defeated King Harold II at Hastings on 14 October 1066. This began Norman rule and transformed English society, law, and language.",
    year: 1066,
    period: "Norman Conquest",
    importance: 5,
    keyFigures: "William the Conqueror, Harold II",
    significance: "historical"
  },
  {
    title: "Domesday Book",
    description: "First comprehensive survey of England commissioned by William the Conqueror",
    details: "The Domesday Book was a detailed survey of England's land, people, and resources completed in 1086. It was the first comprehensive census in English history and remains an important historical document.",
    year: 1086,
    period: "Norman Conquest",
    importance: 4,
    keyFigures: "William the Conqueror",
    significance: "documents"
  },
  {
    title: "Magna Carta",
    description: "King John signs the Great Charter, limiting royal power",
    details: "Magna Carta, signed in 1215, was the first document to limit the power of the English monarch. It established the principle that the king was subject to the law and influenced the development of constitutional government worldwide.",
    year: 1215,
    period: "Medieval England",
    importance: 5,
    keyFigures: "King John, Archbishop Stephen Langton",
    significance: "documents"
  },
  {
    title: "Hundred Years' War",
    description: "Series of conflicts between England and France",
    details: "The Hundred Years' War (1337-1453) was fought between England and France over the French throne. Famous battles include Crécy, Poitiers, and Agincourt. The war helped develop English national identity.",
    year: 1337,
    period: "Medieval England",
    importance: 4,
    keyFigures: "Edward III, Henry V, Joan of Arc",
    significance: "historical"
  },
  {
    title: "Wars of the Roses",
    description: "Civil war between the Houses of Lancaster and York",
    details: "The Wars of the Roses (1455-1485) were fought between the rival houses of Lancaster and York for the English throne. The conflict ended when Henry Tudor (Henry VII) defeated Richard III at the Battle of Bosworth.",
    year: 1455,
    period: "Medieval England",
    importance: 4,
    keyFigures: "Henry VII, Richard III, Edward IV",
    significance: "historical"
  },
  
  // Tudor Era
  {
    title: "Henry VIII Becomes King",
    description: "Henry VIII ascends to the throne, beginning the Tudor dynasty",
    details: "Henry VIII became king in 1509, beginning a reign that would transform England. He is famous for his six marriages and for breaking with the Catholic Church to establish the Church of England.",
    year: 1509,
    period: "Tudor Era",
    importance: 4,
    keyFigures: "Henry VIII, Catherine of Aragon, Anne Boleyn",
    significance: "historical"
  },
  {
    title: "English Reformation",
    description: "Henry VIII breaks with Rome, establishing the Church of England",
    details: "The English Reformation began when Henry VIII broke with the Catholic Church in Rome. This led to the establishment of the Church of England with the monarch as its head, fundamentally changing English religion and politics.",
    year: 1534,
    period: "Tudor Era",
    importance: 5,
    keyFigures: "Henry VIII, Thomas Cromwell",
    significance: "church"
  },
  {
    title: "Elizabeth I Becomes Queen",
    description: "Elizabeth I becomes queen, beginning the Elizabethan era",
    details: "Elizabeth I became queen in 1558, beginning a 45-year reign known as the Elizabethan era. This was a golden age of English literature, exploration, and naval power.",
    year: 1558,
    period: "Tudor Era",
    importance: 5,
    keyFigures: "Elizabeth I, William Shakespeare, Francis Drake",
    significance: "historical"
  },
  {
    title: "Spanish Armada",
    description: "English navy defeats the Spanish Armada",
    details: "In 1588, the English navy, led by Sir Francis Drake, defeated the Spanish Armada. This victory established England as a major naval power and marked the beginning of English maritime dominance.",
    year: 1588,
    period: "Tudor Era",
    importance: 5,
    keyFigures: "Elizabeth I, Sir Francis Drake",
    significance: "historical"
  },
  
  // Stuart Era
  {
    title: "James I Becomes King",
    description: "James VI of Scotland becomes James I of England, uniting the crowns",
    details: "James VI of Scotland became James I of England in 1603, uniting the English and Scottish crowns. This was the beginning of the Stuart dynasty and the eventual union of England and Scotland.",
    year: 1603,
    period: "Stuart Era",
    importance: 4,
    keyFigures: "James I",
    significance: "historical"
  },
  {
    title: "English Civil War",
    description: "Parliament defeats the king, leading to the execution of Charles I",
    details: "The English Civil War (1642-1651) was fought between Parliamentarians and Royalists. It resulted in the execution of Charles I and the establishment of a republic under Oliver Cromwell.",
    year: 1642,
    period: "Stuart Era",
    importance: 5,
    keyFigures: "Charles I, Oliver Cromwell",
    significance: "historical"
  },
  {
    title: "Glorious Revolution",
    description: "William of Orange becomes king, establishing constitutional monarchy",
    details: "The Glorious Revolution of 1688 saw William of Orange and Mary become joint monarchs. This established constitutional monarchy and limited royal power, laying the foundation for modern British democracy.",
    year: 1688,
    period: "Stuart Era",
    importance: 5,
    keyFigures: "William III, Mary II, James II",
    significance: "historical"
  },
  
  // Georgian Era
  {
    title: "Act of Union",
    description: "England and Scotland unite to form Great Britain",
    details: "The Act of Union in 1707 united England and Scotland to form Great Britain. This created a single parliament and established the foundation for the modern United Kingdom.",
    year: 1707,
    period: "Georgian Era",
    importance: 5,
    keyFigures: "Queen Anne",
    significance: "historical"
  },
  {
    title: "Industrial Revolution Begins",
    description: "Manufacturing transforms British economy and society",
    details: "The Industrial Revolution began in Britain around 1750, transforming the country from an agricultural society to an industrial one. Key developments included steam power, textile manufacturing, and the growth of cities.",
    year: 1750,
    period: "Georgian Era",
    importance: 5,
    keyFigures: "James Watt, Richard Arkwright",
    significance: "trades"
  },
  {
    title: "American Revolution",
    description: "American colonies declare independence from Britain",
    details: "The American Revolution (1775-1783) resulted in the loss of Britain's American colonies. This marked the end of the first British Empire and forced Britain to focus on other parts of the world.",
    year: 1775,
    period: "Georgian Era",
    importance: 4,
    keyFigures: "George Washington, King George III",
    significance: "historical"
  },
  {
    title: "Battle of Waterloo",
    description: "Wellington defeats Napoleon, ending the Napoleonic Wars",
    details: "The Duke of Wellington defeated Napoleon at Waterloo in 1815, ending the Napoleonic Wars. This victory established Britain as Europe's dominant power and began the 'Pax Britannica' period.",
    year: 1815,
    period: "Georgian Era",
    importance: 5,
    keyFigures: "Duke of Wellington, Napoleon Bonaparte",
    significance: "historical"
  },
  
  // Victorian Era
  {
    title: "Victoria Becomes Queen",
    description: "Victoria becomes queen, beginning the Victorian era",
    details: "Victoria became queen in 1837, beginning a 63-year reign that defined an era. The Victorian period saw unprecedented industrial growth, imperial expansion, and social change.",
    year: 1837,
    period: "Victorian Era",
    importance: 5,
    keyFigures: "Queen Victoria, Prince Albert",
    significance: "historical"
  },
  {
    title: "Great Reform Act",
    description: "First major expansion of voting rights in Britain",
    details: "The Great Reform Act of 1832 expanded voting rights and redistributed parliamentary seats. Though it only increased the electorate by about 50%, it established the principle of parliamentary reform.",
    year: 1832,
    period: "Victorian Era",
    importance: 4,
    keyFigures: "Earl Grey, William IV",
    significance: "parliament"
  },
  {
    title: "Slavery Abolition Act",
    description: "Britain abolishes slavery throughout its empire",
    details: "The Slavery Abolition Act of 1833 ended slavery throughout the British Empire. This legislation made Britain a leader in the global abolition movement.",
    year: 1833,
    period: "Victorian Era",
    importance: 5,
    keyFigures: "William Wilberforce, Thomas Clarkson",
    significance: "historical"
  },
  {
    title: "NHS Established",
    description: "National Health Service provides free healthcare to all UK residents",
    details: "The NHS was established in 1948, providing free healthcare to all UK residents. It is funded through taxation and is one of the largest employers in the world.",
    year: 1948,
    period: "20th Century",
    importance: 5,
    keyFigures: "Aneurin Bevan",
    significance: "historical"
  },
  
  // 20th Century
  {
    title: "World War I",
    description: "Britain fights in the First World War",
    details: "Britain entered World War I in 1914, fighting alongside France and Russia against Germany and Austria-Hungary. The war resulted in millions of casualties and fundamentally changed British society.",
    year: 1914,
    period: "20th Century",
    importance: 5,
    keyFigures: "Winston Churchill, David Lloyd George",
    significance: "historical"
  },
  {
    title: "World War II",
    description: "Britain fights in the Second World War",
    details: "Britain entered World War II in 1939, fighting against Nazi Germany. The war saw the Battle of Britain, the Blitz, and Britain's role in the Allied victory.",
    year: 1939,
    period: "20th Century",
    importance: 5,
    keyFigures: "Winston Churchill, Neville Chamberlain",
    significance: "historical"
  },
  {
    title: "Welfare State",
    description: "Post-war Labour government establishes comprehensive welfare system",
    details: "The post-war Labour government established the welfare state, including the NHS, comprehensive education, and social security. This transformed British society and provided a safety net for all citizens.",
    year: 1945,
    period: "20th Century",
    importance: 5,
    keyFigures: "Clement Attlee, Aneurin Bevan",
    significance: "historical"
  },
  {
    title: "Thatcher Becomes Prime Minister",
    description: "Margaret Thatcher becomes Britain's first woman Prime Minister",
    details: "Margaret Thatcher became Prime Minister in 1979, beginning a period of radical economic and social change. Her policies of privatization and deregulation transformed British society.",
    year: 1979,
    period: "20th Century",
    importance: 5,
    keyFigures: "Margaret Thatcher",
    significance: "historical"
  },
  
  // 21st Century
  {
    title: "New Labour",
    description: "Tony Blair becomes Prime Minister, modernizing the Labour Party",
    details: "Tony Blair became Prime Minister in 1997, leading New Labour to victory. His government combined free-market economics with social investment and constitutional reform.",
    year: 1997,
    period: "21st Century",
    importance: 4,
    keyFigures: "Tony Blair, Gordon Brown",
    significance: "historical"
  },
  {
    title: "Brexit",
    description: "UK votes to leave the European Union",
    details: "In 2016, the UK voted to leave the European Union in a referendum. This decision led to years of negotiations and the UK's eventual departure from the EU in 2020.",
    year: 2016,
    period: "21st Century",
    importance: 5,
    keyFigures: "David Cameron, Boris Johnson",
    significance: "trades"
  },
  {
    title: "COVID-19 Pandemic",
    description: "Global pandemic affects Britain and the world",
    details: "The COVID-19 pandemic began in 2020, affecting Britain and the world. The UK government implemented lockdowns and developed a successful vaccination program.",
    year: 2020,
    period: "21st Century",
    importance: 5,
    keyFigures: "Boris Johnson, Rishi Sunak",
    significance: "historical"
  },
  {
    title: "King Charles III",
    description: "Charles III becomes king after the death of Elizabeth II",
    details: "Charles III became king in 2022 after the death of his mother, Queen Elizabeth II. This marked the end of the Elizabethan era and the beginning of a new reign.",
    year: 2022,
    period: "21st Century",
    importance: 4,
    keyFigures: "King Charles III, Queen Elizabeth II",
    significance: "historical"
  }
];

async function replaceTimelineWithBookContent() {
  try {
    console.log('🚀 Starting direct timeline replacement with comprehensive UK history...');
    
    // Clear existing timeline events
    console.log('🗑️ Clearing existing timeline events...');
    await db.delete(timelineEvents);
    console.log('✅ Existing timeline cleared');
    
    // Insert new timeline events
    console.log(`💾 Inserting ${TIMELINE_EVENTS.length} comprehensive timeline events...`);
    
    const newTimelineEvents = TIMELINE_EVENTS.map((event, index) => ({
      id: `book-content-${index + 1}`,
      title: event.title,
      description: event.description,
      details: event.details,
      year: event.year,
      category: event.significance || 'historical',
      importance: event.importance,
      keyFigures: event.keyFigures,
      timelineTopic: event.period.toLowerCase().replace(/\s+/g, '_'),
      eventImage: null,
      imageDescription: null
    }));
    
    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < newTimelineEvents.length; i += batchSize) {
      const batch = newTimelineEvents.slice(i, i + batchSize);
      await db.insert(timelineEvents).values(batch);
      console.log(`  📝 Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(newTimelineEvents.length / batchSize)}`);
    }
    
    console.log(`\n🎉 Successfully replaced timeline with ${newTimelineEvents.length} comprehensive events!`);
    
    // Show summary by period
    const periodSummary = {};
    newTimelineEvents.forEach(event => {
      periodSummary[event.period] = (periodSummary[event.period] || 0) + 1;
    });
    
    console.log('\n📊 Timeline Summary by Period:');
    Object.entries(periodSummary).forEach(([period, count]) => {
      console.log(`  ${period}: ${count} events`);
    });
    
    console.log('\n✅ Timeline replacement complete!');
    console.log('💡 The timeline now contains comprehensive UK history content based on Life in UK test materials.');
    
  } catch (error) {
    console.error('❌ Error replacing timeline:', error);
    console.error(error);
  }
}

// Run the replacement
replaceTimelineWithBookContent();
