import { db } from './server/db.js';
import { games } from './shared/schema.js';
import { asc, desc } from 'drizzle-orm';

async function testServerDB() {
  try {
    console.log('🔧 Testing server database connection...');
    
    const allGames = await db
      .select()
      .from(games)
      .orderBy(asc(games.orderIndex), desc(games.createdAt));
    
    console.log('✅ Server database connection successful!');
    console.log('📊 Games found:', allGames.length);
    
    allGames.slice(0, 3).forEach((game, index) => {
      console.log(`${index + 1}. ${game.title}`);
      console.log(`   Category: ${game.category} | Type: ${game.gameType} | Difficulty: ${game.difficulty}`);
      console.log(`   Active: ${game.isActive ? '✅' : '❌'}`);
      console.log('');
    });
    
    console.log('🎯 Server can access all games from database!');
    
  } catch (error) {
    console.error('❌ Server database error:', error);
  }
}

testServerDB();
