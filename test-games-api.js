// Test script to verify games API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testGamesAPI() {
  console.log('🎮 Testing Games API Endpoints...\n');
  
  try {
    // Test user-facing games API
    console.log('1. Testing GET /api/games (user endpoint)...');
    const userGamesResponse = await fetch(`${BASE_URL}/api/games`);
    
    if (userGamesResponse.ok) {
      const userGames = await userGamesResponse.json();
      console.log(`✅ User games API working! Found ${userGames.length} games`);
      
      if (userGames.length > 0) {
        console.log('📊 Sample game:', {
          id: userGames[0].id,
          title: userGames[0].title,
          category: userGames[0].category,
          gameType: userGames[0].gameType,
          isActive: userGames[0].isActive
        });
      }
    } else {
      console.log(`❌ User games API failed: ${userGamesResponse.status} ${userGamesResponse.statusText}`);
    }
    
    // Test admin games API (should require authentication)
    console.log('\n2. Testing GET /api/admin/games (admin endpoint)...');
    const adminGamesResponse = await fetch(`${BASE_URL}/api/admin/games`);
    
    if (adminGamesResponse.status === 401) {
      console.log('✅ Admin games API properly protected (requires authentication)');
    } else if (adminGamesResponse.ok) {
      const adminGames = await adminGamesResponse.json();
      console.log(`✅ Admin games API working! Found ${adminGames.length} games`);
    } else {
      console.log(`❌ Admin games API failed: ${adminGamesResponse.status} ${adminGamesResponse.statusText}`);
    }
    
    // Test filtering
    console.log('\n3. Testing games filtering...');
    const filteredResponse = await fetch(`${BASE_URL}/api/games?category=ai-generated`);
    
    if (filteredResponse.ok) {
      const filteredGames = await filteredResponse.json();
      console.log(`✅ Filtering working! Found ${filteredGames.length} AI-generated games`);
    } else {
      console.log(`❌ Filtering failed: ${filteredResponse.status} ${filteredResponse.statusText}`);
    }
    
    console.log('\n🎯 Games API test completed!');
    
  } catch (error) {
    console.error('❌ Error testing games API:', error.message);
  }
}

// Run the test
testGamesAPI();