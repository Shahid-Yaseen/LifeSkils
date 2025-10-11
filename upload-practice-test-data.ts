#!/usr/bin/env node

/**
 * Script to upload the given practice test data to the database
 * This script processes the question pools from practice-tests.ts and uploads them
 */

import { dataUploadService } from './server/services/data-upload-service.ts';

// The question pools data from practice-tests.ts
const questionPools = {
  history: [
    {
      question: "When did the Norman Conquest take place?",
      options: ["1066", "1086", "1046", "1076"],
      correctAnswer: 0,
      explanation: "The Norman Conquest occurred in 1066 when William the Conqueror defeated King Harold at the Battle of Hastings.",
      category: "History"
    },
    {
      question: "Who was the first Prime Minister of the UK?",
      options: ["Winston Churchill", "Robert Walpole", "Benjamin Disraeli", "William Pitt"],
      correctAnswer: 1,
      explanation: "Sir Robert Walpole is generally considered the first Prime Minister, serving from 1721 to 1742.",
      category: "History"
    },
    {
      question: "When did the English Civil War begin?",
      options: ["1639", "1642", "1645", "1649"],
      correctAnswer: 1,
      explanation: "The English Civil War began in 1642 between supporters of King Charles I and Parliament.",
      category: "History"
    },
    {
      question: "In which year did the Great Fire of London occur?",
      options: ["1665", "1666", "1667", "1668"],
      correctAnswer: 1,
      explanation: "The Great Fire of London occurred in 1666, destroying much of medieval London.",
      category: "History"
    },
    {
      question: "When did women over 30 first get the vote in the UK?",
      options: ["1918", "1928", "1920", "1925"],
      correctAnswer: 0,
      explanation: "Women over 30 got the vote in 1918, with all women over 21 getting the vote in 1928.",
      category: "History"
    },
    {
      question: "Who was known as the 'Iron Lady'?",
      options: ["Queen Victoria", "Margaret Thatcher", "Elizabeth I", "Theresa May"],
      correctAnswer: 1,
      explanation: "Margaret Thatcher was known as the 'Iron Lady' and served as Prime Minister from 1979-1990.",
      category: "History"
    }
  ],
  government: [
    {
      question: "How often are general elections held in the UK?",
      options: ["Every 3 years", "Every 4 years", "Every 5 years", "Every 6 years"],
      correctAnswer: 2,
      explanation: "UK general elections are held every 5 years, though they can be called earlier.",
      category: "Government"
    },
    {
      question: "What is the upper house of Parliament called?",
      options: ["House of Commons", "House of Lords", "Senate", "Assembly"],
      correctAnswer: 1,
      explanation: "The House of Lords is the upper house of the UK Parliament.",
      category: "Government"
    },
    {
      question: "Who appoints the Prime Minister?",
      options: ["The people", "Parliament", "The monarch", "The Cabinet"],
      correctAnswer: 2,
      explanation: "The monarch appoints the Prime Minister, usually the leader of the largest party in the Commons.",
      category: "Government"
    },
    {
      question: "How many MPs are there in the House of Commons?",
      options: ["600", "625", "650", "675"],
      correctAnswer: 2,
      explanation: "There are 650 Members of Parliament (MPs) in the House of Commons.",
      category: "Government"
    },
    {
      question: "What is the minimum voting age in the UK?",
      options: ["16", "17", "18", "21"],
      correctAnswer: 2,
      explanation: "The minimum voting age in the UK is 18 years old.",
      category: "Government"
    },
    {
      question: "Which system is used for general elections in the UK?",
      options: ["Proportional representation", "First past the post", "Alternative vote", "Single transferable vote"],
      correctAnswer: 1,
      explanation: "The UK uses the 'first past the post' system for general elections.",
      category: "Government"
    }
  ],
  geography: [
    {
      question: "What is the highest mountain in the UK?",
      options: ["Snowdon", "Scafell Pike", "Ben Nevis", "Helvellyn"],
      correctAnswer: 2,
      explanation: "Ben Nevis in Scotland is the highest mountain in the UK at 1,345 meters.",
      category: "Geography"
    },
    {
      question: "Which river flows through London?",
      options: ["River Severn", "River Thames", "River Mersey", "River Tyne"],
      correctAnswer: 1,
      explanation: "The River Thames flows through London and is the longest river entirely in England.",
      category: "Geography"
    },
    {
      question: "What is the capital of Wales?",
      options: ["Swansea", "Newport", "Cardiff", "Wrexham"],
      correctAnswer: 2,
      explanation: "Cardiff is the capital city of Wales.",
      category: "Geography"
    },
    {
      question: "Which country is NOT part of Great Britain?",
      options: ["England", "Scotland", "Wales", "Northern Ireland"],
      correctAnswer: 3,
      explanation: "Great Britain consists of England, Scotland, and Wales. Northern Ireland is part of the UK but not Great Britain.",
      category: "Geography"
    },
    {
      question: "What is the longest river in the UK?",
      options: ["River Thames", "River Severn", "River Trent", "River Wye"],
      correctAnswer: 1,
      explanation: "The River Severn is the longest river in the UK at 220 miles (354 km).",
      category: "Geography"
    },
    {
      question: "Which city is known as the 'Granite City'?",
      options: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
      correctAnswer: 2,
      explanation: "Aberdeen is known as the 'Granite City' due to its many buildings made from local granite.",
      category: "Geography"
    }
  ],
  culture: [
    {
      question: "When is St. George's Day celebrated?",
      options: ["April 21st", "April 22nd", "April 23rd", "April 24th"],
      correctAnswer: 2,
      explanation: "St. George's Day, the patron saint day of England, is celebrated on April 23rd.",
      category: "Culture"
    },
    {
      question: "What is the national flower of Scotland?",
      options: ["Rose", "Daffodil", "Thistle", "Shamrock"],
      correctAnswer: 2,
      explanation: "The thistle is the national flower of Scotland.",
      category: "Culture"
    },
    {
      question: "Which sport was invented in England?",
      options: ["Basketball", "Football (Soccer)", "Tennis", "Golf"],
      correctAnswer: 1,
      explanation: "Football (soccer) was invented in England in the 19th century.",
      category: "Culture"
    },
    {
      question: "What is a traditional Sunday meal in Britain?",
      options: ["Fish and chips", "Bangers and mash", "Sunday roast", "Shepherd's pie"],
      correctAnswer: 2,
      explanation: "Sunday roast (roast beef, Yorkshire pudding, vegetables) is a traditional British Sunday meal.",
      category: "Culture"
    },
    {
      question: "Which festival is celebrated on November 5th?",
      options: ["Halloween", "Bonfire Night", "All Saints' Day", "Remembrance Day"],
      correctAnswer: 1,
      explanation: "Bonfire Night (Guy Fawkes Night) is celebrated on November 5th.",
      category: "Culture"
    },
    {
      question: "What does 'Boxing Day' commemorate?",
      options: ["Boxing matches", "Gift giving to servants", "Boxing up Christmas decorations", "St. Stephen's Day"],
      correctAnswer: 1,
      explanation: "Boxing Day traditionally involved giving gifts to servants and tradespeople.",
      category: "Culture"
    }
  ]
};

async function uploadPracticeTestData() {
  console.log('🚀 Starting practice test data upload...');
  console.log('📊 Processing question pools:', Object.keys(questionPools));
  
  try {
    // Create comprehensive tests from the question pools
    const result = await dataUploadService.createComprehensiveTestsFromData(questionPools);
    
    if (result.success) {
      console.log('✅ Successfully uploaded practice test data!');
      console.log(`📈 Created ${result.createdTests.length} tests`);
      console.log('📋 Test details:');
      
      result.createdTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testTitle} - ${test.message}`);
      });
      
      console.log('\n🎯 Upload Summary:');
      console.log(`   • Total categories processed: ${Object.keys(questionPools).length}`);
      console.log(`   • Tests created: ${result.createdTests.length}`);
      console.log(`   • Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
    } else {
      console.error('❌ Failed to upload practice test data');
      console.error('Error:', result.message);
    }
    
  } catch (error) {
    console.error('💥 Error during upload process:', error);
    process.exit(1);
  }
}

// Run the upload if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadPracticeTestData()
    .then(() => {
      console.log('🏁 Upload process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Upload process failed:', error);
      process.exit(1);
    });
}

export { uploadPracticeTestData, questionPools };
