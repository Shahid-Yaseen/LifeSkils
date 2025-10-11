// Generate comprehensive timeline from RAG book content
import { db } from './server/db.ts';
import { books, bookChunks, timelineEvents } from './shared/schema.ts';
import { ragContentGenerator } from './server/services/rag-content-generator.ts';
import { ragService } from './server/services/rag-service.ts';
import { eq, desc, sql } from 'drizzle-orm';

// Define major historical periods and topics to cover
const HISTORICAL_PERIODS = [
  // Ancient & Medieval
  { period: "Ancient Britain", years: "Pre-1066", topics: ["Celtic Britain", "Roman Britain", "Anglo-Saxon England", "Viking invasions"] },
  { period: "Norman Conquest", years: "1066-1154", topics: ["Battle of Hastings", "William the Conqueror", "Domesday Book", "Norman rule"] },
  { period: "Medieval England", years: "1154-1485", topics: ["Plantagenet dynasty", "Magna Carta", "Hundred Years War", "Wars of the Roses"] },
  
  // Early Modern
  { period: "Tudor Era", years: "1485-1603", topics: ["Henry VIII", "English Reformation", "Elizabeth I", "Spanish Armada"] },
  { period: "Stuart Era", years: "1603-1714", topics: ["James I", "English Civil War", "Oliver Cromwell", "Glorious Revolution"] },
  
  // Modern Period
  { period: "Georgian Era", years: "1714-1837", topics: ["Hanoverian succession", "Industrial Revolution", "American Revolution", "Napoleonic Wars"] },
  { period: "Victorian Era", years: "1837-1901", topics: ["Queen Victoria", "Industrial expansion", "British Empire", "Social reforms"] },
  { period: "20th Century", years: "1901-2000", topics: ["World Wars", "Welfare State", "Decolonization", "Thatcher era"] },
  { period: "21st Century", years: "2000-present", topics: ["New Labour", "Brexit", "COVID-19", "Modern Britain"] }
];

// Key topics for comprehensive coverage
const KEY_TOPICS = [
  "Norman Conquest", "Magna Carta", "English Civil War", "Glorious Revolution",
  "Industrial Revolution", "Victorian Era", "World War I", "World War II",
  "NHS", "Thatcher", "Brexit", "British Empire", "Parliament", "Monarchy",
  "British Values", "UK Government", "British History", "Constitutional Monarchy",
  "Battle of Hastings", "William the Conqueror", "Henry VIII", "Elizabeth I",
  "Oliver Cromwell", "Charles I", "James I", "George III", "Queen Victoria",
  "Winston Churchill", "Margaret Thatcher", "Tony Blair", "David Cameron",
  "Boris Johnson", "Rishi Sunak", "King Charles III"
];

async function generateComprehensiveTimeline() {
  try {
    console.log('🚀 Starting comprehensive timeline generation from RAG book content...');
    
    // Clear existing timeline events
    console.log('🗑️ Clearing existing timeline events...');
    await db.delete(timelineEvents);
    console.log('✅ Existing timeline cleared');
    
    // Get all books from RAG system
    const allBooks = await db.select().from(books);
    console.log(`📚 Found ${allBooks.length} books in RAG system`);
    
    if (allBooks.length === 0) {
      console.log('❌ No books found in RAG system. Please populate the system first.');
      return;
    }
    
    const newTimelineEvents = [];
    let eventCounter = 0;
    
    // Generate events for each historical period
    for (const period of HISTORICAL_PERIODS) {
      console.log(`\n📅 Processing ${period.period} (${period.years})...`);
      
      for (const topic of period.topics) {
        try {
          console.log(`  🔍 Generating timeline content for: ${topic}`);
          
          // Generate timeline content using RAG system
          const timelineContent = await ragContentGenerator.generateTimelineContent(topic);
          
          if (timelineContent && timelineContent.title) {
            // Create timeline event
            const timelineEvent = {
              id: `generated-${++eventCounter}`,
              title: timelineContent.title,
              description: timelineContent.description || timelineContent.details || '',
              details: timelineContent.details || timelineContent.rawContent || '',
              year: timelineContent.year || extractYearFromTopic(topic),
              period: period.period,
              importance: timelineContent.importance || getImportanceForTopic(topic),
              keyFigures: timelineContent.keyFigures || '',
              significance: timelineContent.timelineTopic || getSignificanceForTopic(topic),
              sourceBook: 'RAG Generated Content',
              chapterReference: period.period,
              pageNumber: null,
              eventImage: null,
              imageDescription: null,
              enhanced: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            newTimelineEvents.push(timelineEvent);
            console.log(`    ✅ Generated: ${timelineEvent.title} (${timelineEvent.year})`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`    ❌ Error generating content for ${topic}:`, error.message);
        }
      }
    }
    
    // Generate additional events for key topics
    console.log('\n🔑 Generating events for key topics...');
    for (const topic of KEY_TOPICS) {
      try {
        console.log(`  🔍 Generating content for key topic: ${topic}`);
        
        const timelineContent = await ragContentGenerator.generateTimelineContent(topic);
        
        if (timelineContent && timelineContent.title) {
          const timelineEvent = {
            id: `key-topic-${++eventCounter}`,
            title: timelineContent.title,
            description: timelineContent.description || timelineContent.details || '',
            details: timelineContent.details || timelineContent.rawContent || '',
            year: timelineContent.year || extractYearFromTopic(topic),
            period: getPeriodForTopic(topic),
            importance: timelineContent.importance || getImportanceForTopic(topic),
            keyFigures: timelineContent.keyFigures || '',
            significance: timelineContent.timelineTopic || getSignificanceForTopic(topic),
            sourceBook: 'RAG Generated Content',
            chapterReference: 'Key Topics',
            pageNumber: null,
            eventImage: null,
            imageDescription: null,
            enhanced: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          newTimelineEvents.push(timelineEvent);
          console.log(`    ✅ Generated: ${timelineEvent.title} (${timelineEvent.year})`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`    ❌ Error generating content for key topic ${topic}:`, error.message);
      }
    }
    
    // Insert all new timeline events
    console.log(`\n💾 Inserting ${newTimelineEvents.length} timeline events...`);
    
    if (newTimelineEvents.length > 0) {
      // Insert in batches to avoid memory issues
      const batchSize = 50;
      for (let i = 0; i < newTimelineEvents.length; i += batchSize) {
        const batch = newTimelineEvents.slice(i, i + batchSize);
        await db.insert(timelineEvents).values(batch);
        console.log(`  📝 Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(newTimelineEvents.length / batchSize)}`);
      }
      
      console.log(`\n🎉 Successfully generated and inserted ${newTimelineEvents.length} timeline events!`);
      
      // Show summary by period
      const periodSummary = {};
      newTimelineEvents.forEach(event => {
        periodSummary[event.period] = (periodSummary[event.period] || 0) + 1;
      });
      
      console.log('\n📊 Timeline Summary by Period:');
      Object.entries(periodSummary).forEach(([period, count]) => {
        console.log(`  ${period}: ${count} events`);
      });
      
    } else {
      console.log('❌ No timeline events were generated');
    }
    
  } catch (error) {
    console.error('❌ Error generating comprehensive timeline:', error);
    console.error(error);
  }
}

// Helper functions
function extractYearFromTopic(topic) {
  // Try to extract year from topic name
  const yearMatch = topic.match(/\b(10\d{2}|11\d{2}|12\d{2}|13\d{2}|14\d{2}|15\d{2}|16\d{2}|17\d{2}|18\d{2}|19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  
  // Default years for known topics
  const topicYears = {
    'Norman Conquest': 1066,
    'Magna Carta': 1215,
    'English Civil War': 1642,
    'Glorious Revolution': 1688,
    'Industrial Revolution': 1750,
    'Victorian Era': 1837,
    'World War I': 1914,
    'World War II': 1939,
    'NHS': 1948,
    'Brexit': 2020
  };
  
  return topicYears[topic] || 1000;
}

function getImportanceForTopic(topic) {
  const highImportance = ['Norman Conquest', 'Magna Carta', 'Industrial Revolution', 'World War I', 'World War II', 'NHS', 'Brexit'];
  const mediumImportance = ['English Civil War', 'Glorious Revolution', 'Victorian Era', 'Thatcher'];
  
  if (highImportance.includes(topic)) return 5;
  if (mediumImportance.includes(topic)) return 4;
  return 3;
}

function getSignificanceForTopic(topic) {
  const significanceMap = {
    'Norman Conquest': 'historical',
    'Magna Carta': 'documents',
    'English Civil War': 'historical',
    'Glorious Revolution': 'historical',
    'Industrial Revolution': 'trades',
    'Victorian Era': 'historical',
    'World War I': 'historical',
    'World War II': 'historical',
    'NHS': 'historical',
    'Brexit': 'trades',
    'Parliament': 'parliament',
    'Monarchy': 'historical',
    'British Values': 'historical',
    'UK Government': 'parliament'
  };
  
  return significanceMap[topic] || 'historical';
}

function getPeriodForTopic(topic) {
  const periodMap = {
    'Norman Conquest': 'Medieval England',
    'Magna Carta': 'Medieval England',
    'English Civil War': 'Stuart Era',
    'Glorious Revolution': 'Stuart Era',
    'Industrial Revolution': 'Georgian Era',
    'Victorian Era': 'Victorian Era',
    'World War I': '20th Century',
    'World War II': '20th Century',
    'NHS': '20th Century',
    'Brexit': '21st Century',
    'Thatcher': '20th Century',
    'Parliament': 'Medieval England',
    'Monarchy': 'Medieval England',
    'British Values': '21st Century',
    'UK Government': '21st Century'
  };
  
  return periodMap[topic] || 'General';
}

// Run the generation
generateComprehensiveTimeline();
