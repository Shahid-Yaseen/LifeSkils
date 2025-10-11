#!/usr/bin/env node

/**
 * RAG System Test Script
 * 
 * This script tests the RAG system endpoints to ensure they're working correctly.
 * Run with: node test-rag-system.js
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_PDF_PATH = './test-book.pdf'; // You'll need to add a test PDF

async function testRAGSystem() {
  console.log('🧪 Testing RAG System...\n');

  try {
    // Test 1: Check if RAG routes are accessible
    console.log('1. Testing RAG routes accessibility...');
    const response = await fetch(`${BASE_URL}/api/rag/books`);
    
    if (response.ok) {
      console.log('✅ RAG routes are accessible');
    } else {
      console.log('❌ RAG routes not accessible:', response.status);
      return;
    }

    // Test 2: Test book upload (if test PDF exists)
    if (fs.existsSync(TEST_PDF_PATH)) {
      console.log('\n2. Testing book upload...');
      
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(TEST_PDF_PATH);
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      formData.append('book', blob, 'test-book.pdf');
      formData.append('title', 'Test Book');
      formData.append('author', 'Test Author');
      formData.append('description', 'A test book for RAG system');

      const uploadResponse = await fetch(`${BASE_URL}/api/rag/books/upload`, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log('✅ Book upload successful:', uploadResult.book.id);
        
        // Test 3: Generate topics
        console.log('\n3. Testing topic generation...');
        const topicsResponse = await fetch(`${BASE_URL}/api/rag/books/${uploadResult.book.id}/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'Generate topics about UK history' }),
        });

        if (topicsResponse.ok) {
          const topicsResult = await topicsResponse.json();
          console.log('✅ Topic generation successful:', topicsResult.topics.length, 'topics generated');
          
          // Test 4: Generate content for first topic
          if (topicsResult.topics.length > 0) {
            console.log('\n4. Testing content generation...');
            const contentResponse = await fetch(`${BASE_URL}/api/rag/topics/${topicsResult.topics[0].id}/content`, {
              method: 'POST',
            });

            if (contentResponse.ok) {
              const contentResult = await contentResponse.json();
              console.log('✅ Content generation successful');
              console.log('📝 Generated content preview:', contentResult.content.substring(0, 200) + '...');
            } else {
              console.log('❌ Content generation failed:', await contentResponse.text());
            }
          }

          // Test 5: Generate test for first topic
          if (topicsResult.topics.length > 0) {
            console.log('\n5. Testing test generation...');
            const testResponse = await fetch(`${BASE_URL}/api/rag/topics/${topicsResult.topics[0].id}/tests`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                testType: 'multiple_choice', 
                difficulty: 'intermediate' 
              }),
            });

            if (testResponse.ok) {
              const testResult = await testResponse.json();
              console.log('✅ Test generation successful');
              console.log('📝 Generated test:', testResult.test.title);
              console.log('📝 Questions count:', testResult.test.questions.length);
            } else {
              console.log('❌ Test generation failed:', await testResponse.text());
            }
          }
        } else {
          console.log('❌ Topic generation failed:', await topicsResponse.text());
        }
      } else {
        console.log('❌ Book upload failed:', await uploadResponse.text());
      }
    } else {
      console.log('⚠️  Test PDF not found. Skipping upload test.');
      console.log('   To test book upload, place a PDF file at:', TEST_PDF_PATH);
    }

    // Test 6: Test search functionality
    console.log('\n6. Testing search functionality...');
    const searchResponse = await fetch(`${BASE_URL}/api/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'UK history' }),
    });

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      console.log('✅ Search functionality working');
      console.log('📝 Search results:', searchResult.results.length, 'items found');
    } else {
      console.log('❌ Search failed:', await searchResponse.text());
    }

    console.log('\n🎉 RAG System test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Helper function to create a simple test PDF (if needed)
function createTestPDF() {
  const testContent = `
    Life in the United Kingdom
    
    Chapter 1: British History
    The United Kingdom has a rich and complex history spanning thousands of years. 
    From the Roman invasion in 43 AD to the present day, Britain has been shaped by 
    numerous events, people, and cultural influences.
    
    The Industrial Revolution, which began in the late 18th century, transformed 
    Britain into the world's first industrial nation. This period saw significant 
    advances in technology, manufacturing, and social organization.
    
    Chapter 2: Government and Politics
    The UK is a constitutional monarchy with a parliamentary democracy. 
    The current system of government has evolved over centuries and includes 
    the monarchy, Parliament, and the judiciary.
    
    Parliament consists of two houses: the House of Commons and the House of Lords. 
    The Prime Minister is the head of government and is usually the leader of 
    the political party with the most seats in the House of Commons.
  `;

  // Note: This is a simplified example. In a real scenario, you'd use a proper PDF library
  console.log('📄 Test content created. For full testing, use a real PDF file.');
  return testContent;
}

// Run the test
if (require.main === module) {
  testRAGSystem();
}

module.exports = { testRAGSystem, createTestPDF };
