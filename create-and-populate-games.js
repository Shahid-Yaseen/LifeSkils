import pkg from 'pg';
const { Pool } = pkg;

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/lifeskills'
});

async function createTableAndPopulate() {
  const client = await pool.connect();
  
  try {
    console.log('Creating games table...');
    
    // Create the games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        category text NOT NULL,
        game_type text NOT NULL,
        difficulty text DEFAULT 'intermediate' NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        order_index integer DEFAULT 0 NOT NULL,
        game_data jsonb,
        instructions text,
        estimated_time integer,
        tags jsonb,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);
    
    console.log('Games table created successfully!');
    
    // Clear existing games
    await client.query('DELETE FROM games');
    console.log('Cleared existing games');
    
    // Games data
    const gamesData = [
      {
        title: "AI-Powered Exercise Generator",
        description: "Generate personalized practice exercises using advanced AI. Choose your topic and difficulty level for tailored learning using authentic Life in UK content.",
        category: "ai-generated",
        game_type: "ai-exercises",
        difficulty: "intermediate",
        is_active: true,
        order_index: 1,
        instructions: "Select your topic and difficulty level. The AI will generate personalized questions based on authentic Life in UK content.",
        estimated_time: 15,
        tags: JSON.stringify(["AI", "Personalized", "Adaptive", "Life in UK"]),
        game_data: JSON.stringify({
          topics: ["British History", "Government & Politics", "Culture & Traditions", "Geography", "British Values", "Legal System"],
          difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
          questionTypes: ["Multiple Choice", "Fill in the Blank", "True/False"]
        })
      },
      {
        title: "True/False Challenge Games",
        description: "Test your knowledge with True/False statements about UK facts, traditions, and values. Perfect for quick learning and building confidence!",
        category: "true-false",
        game_type: "true-false",
        difficulty: "beginner",
        is_active: true,
        order_index: 2,
        instructions: "Read each statement carefully and decide if it's True or False. Get immediate feedback with explanations.",
        estimated_time: 10,
        tags: JSON.stringify(["Quick Learning", "Instant Feedback", "UK Facts", "Confidence Building"]),
        game_data: JSON.stringify({
          questionCount: 20,
          timeLimit: 10,
          topics: ["British History", "Government", "Culture", "Geography", "Values"]
        })
      },
      {
        title: "Flip Cards Game",
        description: "Click on cards to reveal the answers. Test your knowledge and mark cards as completed when you've mastered them.",
        category: "flip-cards",
        game_type: "flip-cards",
        difficulty: "beginner",
        is_active: true,
        order_index: 3,
        instructions: "Click on any card to flip it and reveal the answer. Mark cards as 'Got it!' when you've mastered the content.",
        estimated_time: 15,
        tags: JSON.stringify(["Interactive", "Self-Paced", "Memory Training", "Visual Learning"]),
        game_data: JSON.stringify({
          cardTypes: ["Question/Answer", "Term/Definition", "Date/Event", "Person/Achievement"]
        })
      },
      {
        title: "General Matching Game",
        description: "Choose your difficulty (4, 6, 8, or 12 items) and match related concepts. Complete all variants to progress!",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "intermediate",
        is_active: true,
        order_index: 4,
        instructions: "Click one button from each of the two columns to make a match. Correct matches turn green and move to bottom of columns.",
        estimated_time: 12,
        tags: JSON.stringify(["Matching", "Critical Thinking", "Progressive Difficulty", "Conceptual Learning"]),
        game_data: JSON.stringify({
          difficultyLevels: [4, 6, 8, 12],
          nextGame: "Holiday Dates Matching"
        })
      },
      {
        title: "UK Holiday Dates Matching Game",
        description: "Match UK holidays with their celebration dates. Learn about traditional British celebrations, religious festivals, and cultural events.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "intermediate",
        is_active: true,
        order_index: 5,
        instructions: "Match UK holidays with their celebration dates. Learn about traditional British celebrations.",
        estimated_time: 10,
        tags: JSON.stringify(["Holidays", "Dates", "British Culture", "Traditions"]),
        game_data: JSON.stringify({
          holidays: ["Christmas", "Easter", "Guy Fawkes Night", "Burns Night", "Diwali", "Eid"],
          nextGame: "Holiday Meanings Matching"
        })
      },
      {
        title: "Holiday Meanings Matching Game",
        description: "Match UK holidays with their meanings and significance. Understand the cultural, religious, and historical importance of each celebration.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "intermediate",
        is_active: true,
        order_index: 6,
        instructions: "Match UK holidays with their meanings and significance.",
        estimated_time: 10,
        tags: JSON.stringify(["Holidays", "Meanings", "Cultural Significance", "Religious Events"]),
        game_data: JSON.stringify({
          focus: "Cultural and religious significance of British holidays"
        })
      },
      {
        title: "Sports Achievements Matching Game",
        description: "Match British sports champions with their greatest accomplishments. Learn about Olympic heroes, World Cup winners, and sporting legends.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "intermediate",
        is_active: true,
        order_index: 7,
        instructions: "Match British sports champions with their greatest accomplishments.",
        estimated_time: 12,
        tags: JSON.stringify(["Sports", "Achievements", "British Champions", "Olympic Heroes"]),
        game_data: JSON.stringify({
          sports: ["Football", "Cricket", "Tennis", "Rugby", "Athletics", "Swimming"]
        })
      },
      {
        title: "British Artists Matching Game",
        description: "Match renowned British artists with their art forms. Explore centuries of artistic heritage from landscape painting to modern sculpture.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "intermediate",
        is_active: true,
        order_index: 8,
        instructions: "Match renowned British artists with their art forms.",
        estimated_time: 12,
        tags: JSON.stringify(["Art", "British Artists", "Cultural Heritage", "Art Forms"]),
        game_data: JSON.stringify({
          artForms: ["Painting", "Sculpture", "Literature", "Music", "Theatre", "Architecture"]
        })
      },
      {
        title: "UK Age Requirements Matching Game",
        description: "Match legal activities with their correct age requirements. Learn about employment, driving, voting, and other important legal milestones in the UK.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "intermediate",
        is_active: true,
        order_index: 9,
        instructions: "Match legal activities with their correct age requirements.",
        estimated_time: 10,
        tags: JSON.stringify(["Legal System", "Age Requirements", "Citizenship", "Rights and Responsibilities"]),
        game_data: JSON.stringify({
          activities: ["Voting", "Driving", "Working", "Marriage", "Alcohol", "Smoking"]
        })
      },
      {
        title: "British Leaders Matching Game",
        description: "Match British monarchs, prime ministers, and historical figures with their achievements. Explore leadership throughout British history.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "intermediate",
        is_active: true,
        order_index: 10,
        instructions: "Match British monarchs, prime ministers, and historical figures with their achievements.",
        estimated_time: 15,
        tags: JSON.stringify(["History", "Leadership", "Monarchs", "Prime Ministers", "Political Figures"]),
        game_data: JSON.stringify({
          leaders: ["Monarchs", "Prime Ministers", "Historical Figures", "Political Leaders"]
        })
      },
      {
        title: "UK Cultural Awards Matching Challenge",
        description: "Match British cultural awards with their categories. Learn about prestigious honors in theatre, music, literature, and the arts including BRIT Awards, Turner Prize, Booker Prize, and more.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 11,
        instructions: "Match British cultural awards with their categories.",
        estimated_time: 15,
        tags: JSON.stringify(["Cultural Awards", "Arts", "Literature", "Music", "Theatre", "Prestigious Honors"]),
        game_data: JSON.stringify({
          awards: ["BRIT Awards", "Turner Prize", "Booker Prize", "Olivier Awards", "BAFTA", "Mercury Prize"]
        })
      },
      {
        title: "Acts, Treaties & Bills Triple Match Challenge",
        description: "Match important British acts, treaties, and bills with their years and purposes. Learn about landmark legislation that shaped UK history.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 12,
        instructions: "Select one item from each of the three columns to make a complete match. All three selections must relate to the same concept.",
        estimated_time: 20,
        tags: JSON.stringify(["Legislation", "History", "Triple Match", "Advanced", "Legal Documents"]),
        game_data: JSON.stringify({
          columns: ["Acts/Treaties/Bills", "Years", "Purposes"],
          complexity: "triple-match"
        })
      },
      {
        title: "Sports Heroes Triple Match Challenge",
        description: "Choose your challenge level (4, 6, 8, or 12 heroes) and match British sports legends with their sports and achievements. Complete all variants to unlock the next challenge!",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 13,
        instructions: "Match British sports legends with their sports and achievements.",
        estimated_time: 18,
        tags: JSON.stringify(["Sports Heroes", "Triple Match", "Advanced", "British Legends", "Achievements"]),
        game_data: JSON.stringify({
          columns: ["Sports Heroes", "Sports", "Achievements"],
          difficultyLevels: [4, 6, 8, 12],
          nextGame: "Justice System Triple Match"
        })
      },
      {
        title: "UK Justice System Triple Match Challenge",
        description: "Match courts with their jurisdictions and regions. Learn about the complex UK justice system across England & Wales, Scotland, and Northern Ireland.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 14,
        instructions: "Match courts with their jurisdictions and regions.",
        estimated_time: 20,
        tags: JSON.stringify(["Justice System", "Courts", "Jurisdictions", "Legal System", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Courts", "Jurisdictions", "Regions"],
          regions: ["England & Wales", "Scotland", "Northern Ireland"]
        })
      },
      {
        title: "UK Religion & Demographics Triple Match Challenge",
        description: "Match religions with their percentages and ethnic compositions. Understand the UK's diverse religious and demographic landscape.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 15,
        instructions: "Match religions with their percentages and ethnic compositions.",
        estimated_time: 18,
        tags: JSON.stringify(["Religion", "Demographics", "Diversity", "Statistics", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Religions", "Percentages", "Ethnic Compositions"]
        })
      },
      {
        title: "UK International Memberships Triple Match Challenge",
        description: "Match international organizations with the UK's role and membership details. Learn about Britain's place in global institutions.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 16,
        instructions: "Match international organizations with the UK's role and membership details.",
        estimated_time: 20,
        tags: JSON.stringify(["International Relations", "Organizations", "Global Institutions", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["International Organizations", "UK Role", "Membership Details"]
        })
      },
      {
        title: "British Battles & Wars Triple Match Challenge",
        description: "Match battles with their years and participants. Explore major military conflicts throughout British history from medieval times to modern warfare.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 17,
        instructions: "Match battles with their years and participants.",
        estimated_time: 22,
        tags: JSON.stringify(["Military History", "Battles", "Wars", "Historical Events", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Battles", "Years", "Participants"],
          periods: ["Medieval", "Tudor", "Civil War", "World Wars", "Modern"]
        })
      },
      {
        title: "British Rulers & Religions Triple Match Challenge",
        description: "Match rulers with their reign periods and religious affiliations. Explore the complex relationship between monarchy and religion in British history.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 18,
        instructions: "Match rulers with their reign periods and religious affiliations.",
        estimated_time: 20,
        tags: JSON.stringify(["Monarchy", "Religion", "Historical Rulers", "Triple Match", "Complex Relationships"]),
        game_data: JSON.stringify({
          columns: ["Rulers", "Reign Periods", "Religious Affiliations"]
        })
      },
      {
        title: "British Prime Ministers Triple Match Challenge",
        description: "Match Prime Ministers with their terms and historical periods. Learn about political leadership throughout British democratic history.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 19,
        instructions: "Match Prime Ministers with their terms and historical periods.",
        estimated_time: 18,
        tags: JSON.stringify(["Prime Ministers", "Political History", "Democratic Leadership", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Prime Ministers", "Terms", "Historical Periods"]
        })
      },
      {
        title: "UK Places of Interest Triple Match Challenge",
        description: "Match places with their regions and descriptions. Discover iconic locations across England, Scotland, Wales, and Northern Ireland.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 20,
        instructions: "Match places with their regions and descriptions.",
        estimated_time: 20,
        tags: JSON.stringify(["Geography", "Places of Interest", "UK Regions", "Landmarks", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Places", "Regions", "Descriptions"],
          regions: ["England", "Scotland", "Wales", "Northern Ireland"]
        })
      },
      {
        title: "Traditional Foods Triple Match Challenge",
        description: "Match dishes with their regions and ingredients. Explore British culinary heritage across all four countries of the UK.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 21,
        instructions: "Match dishes with their regions and ingredients.",
        estimated_time: 18,
        tags: JSON.stringify(["Food", "Culinary Heritage", "Regional Dishes", "Ingredients", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Dishes", "Regions", "Ingredients"]
        })
      },
      {
        title: "UK Constituent Countries Triple Match Challenge",
        description: "Match countries with their capitals and symbols. Test your knowledge of UK geography, culture, and national identity including patron saints, symbols, flags, and major cities.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 22,
        instructions: "Match countries with their capitals and symbols.",
        estimated_time: 20,
        tags: JSON.stringify(["UK Geography", "Constituent Countries", "Capitals", "National Symbols", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Countries", "Capitals", "Symbols"],
          countries: ["England", "Scotland", "Wales", "Northern Ireland"]
        })
      },
      {
        title: "UK Parliament & Devolution Triple Match Challenge",
        description: "Match regions with their parliaments and powers. Learn about UK government structure, devolution, and democratic institutions including Westminster, Holyrood, Senedd, and Stormont.",
        category: "matching",
        game_type: "matching-cards",
        difficulty: "advanced",
        is_active: true,
        order_index: 23,
        instructions: "Match regions with their parliaments and powers.",
        estimated_time: 22,
        tags: JSON.stringify(["Parliament", "Devolution", "Government Structure", "Democratic Institutions", "Triple Match"]),
        game_data: JSON.stringify({
          columns: ["Regions", "Parliaments", "Powers"],
          parliaments: ["Westminster", "Holyrood", "Senedd", "Stormont"]
        })
      }
    ];
    
    // Insert games
    console.log('Inserting games data...');
    for (const gameData of gamesData) {
      const query = `
        INSERT INTO games (title, description, category, game_type, difficulty, is_active, order_index, instructions, estimated_time, tags, game_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      const values = [
        gameData.title,
        gameData.description,
        gameData.category,
        gameData.game_type,
        gameData.difficulty,
        gameData.is_active,
        gameData.order_index,
        gameData.instructions,
        gameData.estimated_time,
        gameData.tags,
        gameData.game_data
      ];
      
      await client.query(query, values);
      console.log(`✓ Inserted: ${gameData.title}`);
    }
    
    console.log(`\n🎉 Successfully populated ${gamesData.length} games into the database!`);
    
    // Verify the data
    const result = await client.query('SELECT COUNT(*) FROM games');
    console.log(`📊 Database now contains ${result.rows[0].count} games`);
    
    // Show summary by category
    const categoryResult = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM games 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('\n📈 Games by category:');
    categoryResult.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} games`);
    });
    
    console.log('\n✅ Games table created and populated successfully!');
    console.log('🚀 You can now access the admin games management at /admin/games');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createTableAndPopulate()
  .then(() => {
    console.log('\n🎯 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
