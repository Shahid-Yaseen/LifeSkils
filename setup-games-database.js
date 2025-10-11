#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/lifeskills",
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running database migration...');
    
    // Read and execute the migration file
    const migrationPath = path.join(__dirname, 'migrations', '0002_update_games_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    console.log('✅ Database migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function populateGames() {
  const client = await pool.connect();
  
  try {
    console.log('🎮 Populating games database...');
    
    // Import and run the population script
    const { populateComprehensiveGames } = await import('./populate-comprehensive-games.js');
    await populateComprehensiveGames();
    
  } catch (error) {
    console.error('❌ Games population failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('🚀 Setting up games database...\n');
  
  try {
    // Step 1: Run migration
    await runMigration();
    console.log('');
    
    // Step 2: Populate games
    await populateGames();
    console.log('');
    
    console.log('🎉 Games database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Access admin panel: /admin/games');
    console.log('3. View games page: /games');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runMigration, populateGames };
