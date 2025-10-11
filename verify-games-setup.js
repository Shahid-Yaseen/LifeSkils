import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/lifeskills",
});

async function verifyGamesSetup() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying Games Database Setup...\n');
    
    // Check total games
    const totalResult = await client.query('SELECT COUNT(*) as total FROM games');
    console.log(`📊 Total Games: ${totalResult.rows[0].total}`);
    
    // Check games by category
    const categoryResult = await client.query(`
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
    
    console.log('\n📋 Games by Category:');
    console.log('Category | Total | T/F | Match | Triple | Flip | AI');
    console.log('---------|-------|-----|-------|--------|------|----');
    categoryResult.rows.forEach(row => {
      console.log(`${row.category.padEnd(8)} | ${row.count.toString().padEnd(5)} | ${row.with_true_false.toString().padEnd(3)} | ${row.with_matching.toString().padEnd(5)} | ${row.with_triple.toString().padEnd(6)} | ${row.with_flip_cards.toString().padEnd(4)} | ${row.with_ai_topics}`);
    });
    
    // Check individual games with content counts
    const gamesResult = await client.query(`
      SELECT 
        title,
        game_type,
        category,
        CASE WHEN true_false_questions IS NOT NULL THEN jsonb_array_length(true_false_questions) ELSE 0 END as tf_count,
        CASE WHEN matching_pairs IS NOT NULL THEN jsonb_array_length(matching_pairs) ELSE 0 END as match_count,
        CASE WHEN triple_matches IS NOT NULL THEN jsonb_array_length(triple_matches) ELSE 0 END as triple_count,
        CASE WHEN flip_cards IS NOT NULL THEN jsonb_array_length(flip_cards) ELSE 0 END as flip_count,
        CASE WHEN ai_topics IS NOT NULL THEN jsonb_array_length(ai_topics) ELSE 0 END as ai_count
      FROM games 
      ORDER BY order_index
    `);
    
    console.log('\n🎮 Individual Games:');
    console.log('Title | Type | Category | T/F | Match | Triple | Flip | AI');
    console.log('------|------|----------|-----|-------|--------|------|----');
    gamesResult.rows.forEach(row => {
      const shortTitle = row.title.length > 20 ? row.title.substring(0, 17) + '...' : row.title;
      console.log(`${shortTitle.padEnd(20)} | ${row.game_type.padEnd(4)} | ${row.category.padEnd(8)} | ${row.tf_count.toString().padEnd(3)} | ${row.match_count.toString().padEnd(5)} | ${row.triple_count.toString().padEnd(6)} | ${row.flip_count.toString().padEnd(4)} | ${row.ai_count}`);
    });
    
    // Check database structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'games' 
      AND column_name IN ('true_false_questions', 'matching_pairs', 'triple_matches', 'flip_cards', 'ai_topics')
      ORDER BY column_name
    `);
    
    console.log('\n🗄️ Database Structure:');
    console.log('Column | Type | Nullable');
    console.log('-------|------|---------');
    columnsResult.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(4)} | ${row.is_nullable}`);
    });
    
    // Check indexes
    const indexesResult = await client.query(`
      SELECT indexname
      FROM pg_indexes 
      WHERE tablename = 'games'
      ORDER BY indexname
    `);
    
    console.log('\n🔗 Database Indexes:');
    indexesResult.rows.forEach(row => {
      console.log(`✅ ${row.indexname}`);
    });
    
    console.log('\n🎉 Games Database Setup Verification Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Access admin panel: /admin/games');
    console.log('3. View games page: /games');
    console.log('4. Test game data management in admin interface');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run verification
verifyGamesSetup();
