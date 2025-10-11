import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://localhost:5432/lifeskills'
});

// Complete list of ALL games from the /games page
const expectedGames = [
  // AI Generated Games (1)
  { title: "AI-Powered Exercise Generator", category: "ai-generated", gameType: "ai-exercises" },
  
  // True/False Games (1)
  { title: "True/False Challenge Games", category: "true-false", gameType: "true-false" },
  
  // Flip Cards Games (1)
  { title: "Flip Cards Game", category: "flip-cards", gameType: "flip-cards" },
  
  // 2-Column Matching Games (8)
  { title: "General Matching Game", category: "matching", gameType: "matching-cards" },
  { title: "UK Holiday Dates Matching Game", category: "matching", gameType: "matching-cards" },
  { title: "Holiday Meanings Matching Game", category: "matching", gameType: "matching-cards" },
  { title: "Sports Achievements Matching Game", category: "matching", gameType: "matching-cards" },
  { title: "British Artists Matching Game", category: "matching", gameType: "matching-cards" },
  { title: "UK Age Requirements Matching Game", category: "matching", gameType: "matching-cards" },
  { title: "British Leaders Matching Game", category: "matching", gameType: "matching-cards" },
  { title: "UK Cultural Awards Matching Challenge", category: "matching", gameType: "matching-cards" },
  
  // 3-Column Matching Games (Advanced) (12)
  { title: "Acts, Treaties & Bills Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "Sports Heroes Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "UK Justice System Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "UK Religion & Demographics Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "UK International Memberships Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "British Battles & Wars Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "British Rulers & Religions Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "British Prime Ministers Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "UK Places of Interest Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "Traditional Foods Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "UK Constituent Countries Triple Match Challenge", category: "matching", gameType: "matching-cards" },
  { title: "UK Parliament & Devolution Triple Match Challenge", category: "matching", gameType: "matching-cards" }
];

async function verifyAllGames() {
  const client = await pool.connect();
  try {
    console.log('🔍 COMPREHENSIVE GAMES VERIFICATION');
    console.log('=====================================');
    console.log(`📋 Expected games from /games page: ${expectedGames.length}`);
    
    // Get all games from database
    const result = await client.query('SELECT title, category, game_type, difficulty, is_active FROM games ORDER BY order_index');
    const dbGames = result.rows;
    
    console.log(`📊 Games in database: ${dbGames.length}`);
    console.log('');
    
    // Check each expected game
    let foundCount = 0;
    let missingGames = [];
    
    console.log('✅ VERIFICATION RESULTS:');
    console.log('========================');
    
    for (const expectedGame of expectedGames) {
      const found = dbGames.find(dbGame => dbGame.title === expectedGame.title);
      if (found) {
        console.log(`✅ ${expectedGame.title}`);
        console.log(`   Category: ${found.category} | Type: ${found.game_type} | Difficulty: ${found.difficulty} | Active: ${found.is_active ? 'Yes' : 'No'}`);
        foundCount++;
      } else {
        console.log(`❌ MISSING: ${expectedGame.title}`);
        missingGames.push(expectedGame);
      }
      console.log('');
    }
    
    console.log('📈 SUMMARY:');
    console.log('===========');
    console.log(`✅ Found: ${foundCount}/${expectedGames.length} games`);
    console.log(`❌ Missing: ${missingGames.length} games`);
    
    if (missingGames.length > 0) {
      console.log('\n🚨 MISSING GAMES:');
      missingGames.forEach(game => {
        console.log(`   - ${game.title} (${game.category}/${game.gameType})`);
      });
    } else {
      console.log('\n🎉 ALL GAMES SUCCESSFULLY UPLOADED!');
    }
    
    // Category breakdown
    const categoryBreakdown = dbGames.reduce((acc, game) => {
      acc[game.category] = (acc[game.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 DATABASE BREAKDOWN:');
    Object.keys(categoryBreakdown).forEach(category => {
      console.log(`   ${category}: ${categoryBreakdown[category]} games`);
    });
    
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAllGames().catch(console.error);
