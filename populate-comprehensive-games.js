import { Pool } from 'pg';
import { createComprehensiveGameData } from './extract-component-data.js';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/lifeskills",
});

async function populateComprehensiveGames() {
  const client = await pool.connect();
  
  try {
    console.log('Starting comprehensive games population...');
    
    // Clear existing games
    await client.query('DELETE FROM games');
    console.log('Cleared existing games');
    
    // Get comprehensive game data
    const gameData = createComprehensiveGameData();
    console.log(`Loaded ${gameData.length} games to populate`);
    
    // Insert games one by one
    for (const game of gameData) {
      const query = `
        INSERT INTO games (
          title, description, category, game_type, difficulty, is_active, 
          order_index, instructions, estimated_time, tags, 
          true_false_questions, matching_pairs, triple_matches, flip_cards, ai_topics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `;
      
      const values = [
        game.title,
        game.description,
        game.category,
        game.gameType,
        game.difficulty,
        game.isActive,
        game.orderIndex,
        game.instructions,
        game.estimatedTime,
        game.tags ? JSON.stringify(game.tags) : null,
        game.trueFalseQuestions ? JSON.stringify(game.trueFalseQuestions) : null,
        game.matchingPairs ? JSON.stringify(game.matchingPairs) : null,
        game.tripleMatches ? JSON.stringify(game.tripleMatches) : null,
        game.flipCards ? JSON.stringify(game.flipCards) : null,
        game.aiTopics ? JSON.stringify(game.aiTopics) : null
      ];
      
      const result = await client.query(query, values);
      console.log(`✅ Inserted game: ${game.title} (ID: ${result.rows[0].id})`);
    }
    
    console.log('\n🎉 Games population completed successfully!');
    
    // Verify the data with detailed statistics
    const stats = await client.query(`
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN true_false_questions IS NOT NULL THEN 1 END) as with_true_false,
        COUNT(CASE WHEN matching_pairs IS NOT NULL THEN 1 END) as with_matching,
        COUNT(CASE WHEN triple_matches IS NOT NULL THEN 1 END) as with_triple,
        COUNT(CASE WHEN flip_cards IS NOT NULL THEN 1 END) as with_flip_cards,
        COUNT(CASE WHEN ai_topics IS NOT NULL THEN 1 END) as with_ai_topics
      FROM games 
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('\n📊 Database Statistics:');
    console.log('Category | Total | T/F | Match | Triple | Flip | AI');
    console.log('---------|-------|-----|-------|--------|------|----');
    stats.rows.forEach(row => {
      console.log(`${row.category.padEnd(8)} | ${row.count.toString().padEnd(5)} | ${row.with_true_false.toString().padEnd(3)} | ${row.with_matching.toString().padEnd(5)} | ${row.with_triple.toString().padEnd(6)} | ${row.with_flip_cards.toString().padEnd(4)} | ${row.with_ai_topics}`);
    });
    
    // Get total count
    const totalResult = await client.query('SELECT COUNT(*) FROM games');
    console.log(`\n📈 Total games in database: ${totalResult.rows[0].count}`);
    
    // Show sample data
    const sampleResult = await client.query(`
      SELECT title, game_type, category, 
             CASE WHEN true_false_questions IS NOT NULL THEN jsonb_array_length(true_false_questions) ELSE 0 END as true_false_count,
             CASE WHEN matching_pairs IS NOT NULL THEN jsonb_array_length(matching_pairs) ELSE 0 END as matching_count,
             CASE WHEN triple_matches IS NOT NULL THEN jsonb_array_length(triple_matches) ELSE 0 END as triple_count,
             CASE WHEN flip_cards IS NOT NULL THEN jsonb_array_length(flip_cards) ELSE 0 END as flip_count,
             CASE WHEN ai_topics IS NOT NULL THEN jsonb_array_length(ai_topics) ELSE 0 END as ai_count
      FROM games 
      ORDER BY order_index
    `);
    
    console.log('\n🎮 Game Details:');
    console.log('Title | Type | Category | T/F | Match | Triple | Flip | AI');
    console.log('------|------|----------|-----|-------|--------|------|----');
    sampleResult.rows.forEach(row => {
      console.log(`${row.title.substring(0, 20).padEnd(20)} | ${row.game_type.padEnd(4)} | ${row.category.padEnd(8)} | ${row.true_false_count.toString().padEnd(3)} | ${row.matching_count.toString().padEnd(5)} | ${row.triple_count.toString().padEnd(6)} | ${row.flip_count.toString().padEnd(4)} | ${row.ai_count}`);
    });
    
  } catch (error) {
    console.error('❌ Error populating games:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to verify database structure
async function verifyDatabaseStructure() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying database structure...');
    
    // Check if all required columns exist
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'games' 
      AND column_name IN ('true_false_questions', 'matching_pairs', 'triple_matches', 'flip_cards', 'ai_topics')
      ORDER BY column_name
    `);
    
    console.log('📋 Required columns status:');
    const requiredColumns = ['true_false_questions', 'matching_pairs', 'triple_matches', 'flip_cards', 'ai_topics'];
    requiredColumns.forEach(col => {
      const found = columnsResult.rows.find(row => row.column_name === col);
      if (found) {
        console.log(`✅ ${col}: ${found.data_type} (nullable: ${found.is_nullable})`);
      } else {
        console.log(`❌ ${col}: NOT FOUND`);
      }
    });
    
    // Check indexes
    const indexesResult = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'games'
      ORDER BY indexname
    `);
    
    console.log('\n📊 Database indexes:');
    indexesResult.rows.forEach(row => {
      console.log(`🔗 ${row.indexname}`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying database structure:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Main execution
async function main() {
  try {
    await verifyDatabaseStructure();
    console.log('\n' + '='.repeat(50));
    await populateComprehensiveGames();
    console.log('\n🎉 All operations completed successfully!');
  } catch (error) {
    console.error('💥 Operation failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { populateComprehensiveGames, verifyDatabaseStructure };
