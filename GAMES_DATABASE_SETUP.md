# 🎮 Games Database Setup Guide

This guide explains how to set up and manage the comprehensive games database system for the Life Skills Prep platform.

## 📋 Overview

The games database system supports all game types from your games page:
- **AI Exercises**: Dynamic content generation with topics and difficulty
- **True/False Games**: Question management with statements, answers, explanations
- **2-Column Matching**: Left/right pair management
- **3-Column Matching**: Triple relationship management (for advanced games)
- **Flip Cards**: Front/back content management
- **AI Topics**: Topic configuration for AI exercises

## 🗄️ Database Schema

### Games Table Structure

```sql
CREATE TABLE games (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'ai-generated', 'true-false', 'matching', 'flip-cards'
  game_type TEXT NOT NULL, -- Specific game type from components
  difficulty TEXT NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  instructions TEXT,
  estimated_time INTEGER,
  tags JSONB,
  -- Game-specific data structures
  true_false_questions JSONB, -- Array of true/false questions
  matching_pairs JSONB, -- Array of 2-column matching pairs
  triple_matches JSONB, -- Array of 3-column matching data
  flip_cards JSONB, -- Array of flip card data
  ai_topics JSONB, -- Array of AI exercise topics
  game_data JSONB, -- Additional game-specific configuration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Data Structures

#### True/False Questions
```json
{
  "id": "1",
  "statement": "The UK has been a member of the European Union since 1973.",
  "isTrue": false,
  "explanation": "The UK joined the European Economic Community (EEC) in 1973, which later became the EU. However, the UK left the EU in 2020 following Brexit.",
  "category": "Politics"
}
```

#### Matching Pairs (2-Column)
```json
{
  "id": "1",
  "left": "1066",
  "right": "Norman Conquest",
  "category": "History"
}
```

#### Triple Matches (3-Column)
```json
{
  "id": "1",
  "column1": "Robert Walpole",
  "column2": "1721-1742",
  "column3": "First Prime Minister",
  "category": "Georgian"
}
```

#### Flip Cards
```json
{
  "id": "1",
  "front": "What is the capital of Scotland?",
  "back": "Edinburgh",
  "category": "Geography"
}
```

#### AI Topics
```json
{
  "value": "British Government",
  "icon": "🏛️",
  "description": "Parliament, Prime Ministers, political system"
}
```

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
# Run the migration to add new columns
psql -d lifeskills -f migrations/0002_update_games_schema.sql
```

### 2. Populate Games Database

```bash
# Run the comprehensive setup script
node setup-games-database.js
```

This will:
- ✅ Run database migration
- ✅ Populate games with sample data
- ✅ Verify database structure
- ✅ Show statistics

### 3. Verify Setup

```bash
# Check database structure
node -e "
const { verifyDatabaseStructure } = require('./populate-comprehensive-games');
verifyDatabaseStructure().then(() => process.exit(0));
"
```

## 🎯 Game Types Supported

### AI Generated Games
- **ai-exercises**: AI-powered exercise generator with topics and difficulty levels

### True/False Games
- **true-false**: Quick decision-based learning with immediate feedback

### 2-Column Matching Games
- **general-matching**: General concept matching
- **holidays-matching**: UK holiday dates
- **holiday-meanings-matching**: Holiday meanings and significance
- **sports-achievements-matching**: Sports champions and accomplishments
- **british-artists-matching**: British artists and art forms
- **uk-ages-matching**: UK age requirements
- **british-leaders-matching**: British leaders and achievements
- **uk-cultural-awards-matching**: Cultural awards and categories

### 3-Column Matching Games (Advanced)
- **acts-treaties-bills-matching**: Acts, treaties, and bills with years and purposes
- **battles-wars-matching**: Battles with years and participants
- **justice-system-matching**: Courts with jurisdictions and regions
- **prime-ministers-matching**: Prime Ministers with terms and periods
- **religion-demographics-matching**: Religions with percentages and demographics
- **rulers-religions-matching**: Rulers with reign periods and religions
- **sports-heroes-matching**: Sports heroes with sports and achievements
- **traditional-foods-matching**: Dishes with regions and ingredients
- **uk-memberships-matching**: International organizations with UK roles
- **uk-constituent-countries-matching**: Countries with capitals and symbols
- **uk-parliament-devolution-matching**: Regions with parliaments and powers
- **uk-places-matching**: Places with regions and descriptions

### Flip Cards
- **flip-cards**: Front/back flashcard-style learning

## 🔧 Admin Interface Features

### Game Management
- ✅ Create, edit, delete games
- ✅ Manage game data (questions, pairs, cards, topics)
- ✅ Bulk import/export functionality
- ✅ Game status management (active/inactive)
- ✅ Order management

### Data Management
- ✅ **True/False Questions**: Add, edit, delete statements with explanations
- ✅ **Matching Pairs**: Manage left/right column relationships
- ✅ **Triple Matches**: Manage 3-column complex relationships
- ✅ **Flip Cards**: Manage front/back content
- ✅ **AI Topics**: Configure topics for AI exercises

### Access Admin Interface
1. Navigate to `/admin/games`
2. Use the database icon (🗄️) to manage game data
3. Select data type (True/False, Matching, Triple, Flip, AI)
4. Add, edit, or delete data items
5. Save changes to update the database

## 📊 Database Statistics

After setup, you can view:
- Total games by category
- Games with specific data types
- Content counts (questions, pairs, cards, topics)
- Game difficulty distribution
- Active/inactive status

## 🔄 Maintenance

### Adding New Games
1. Use the admin interface to create new games
2. Select appropriate game type and category
3. Add game-specific data using the data management interface
4. Set difficulty, instructions, and estimated time

### Updating Game Data
1. Access the admin interface
2. Click the database icon next to any game
3. Select the appropriate data type
4. Add, edit, or delete data items
5. Save changes

### Bulk Operations
- **Import**: Use the "Import Games" button for bulk data
- **Export**: Use the "Export Games" button to backup data
- **Reordering**: Drag and drop games to reorder them

## 🐛 Troubleshooting

### Common Issues

1. **Migration Fails**
   ```bash
   # Check if columns already exist
   psql -d lifeskills -c "\\d games"
   ```

2. **Data Not Loading**
   ```bash
   # Verify database connection
   node -e "console.log(process.env.DATABASE_URL)"
   ```

3. **Admin Interface Not Working**
   - Check if user has admin role
   - Verify API endpoints are accessible
   - Check browser console for errors

### Verification Commands

```bash
# Check database structure
psql -d lifeskills -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'games';"

# Check game data
psql -d lifeskills -c "SELECT title, game_type, category FROM games ORDER BY order_index;"

# Check data counts
psql -d lifeskills -c "SELECT category, COUNT(*) as total, COUNT(CASE WHEN true_false_questions IS NOT NULL THEN 1 END) as with_tf FROM games GROUP BY category;"
```

## 📈 Performance Optimization

### Database Indexes
The system automatically creates indexes for:
- Game type filtering
- Category filtering
- Difficulty filtering
- Active status filtering
- JSONB columns for fast queries

### Query Optimization
- Use specific game types for faster filtering
- Leverage JSONB indexes for content searches
- Use order_index for consistent sorting

## 🎉 Success Indicators

After successful setup, you should see:
- ✅ All game types available in admin interface
- ✅ Sample data populated for each game type
- ✅ Data management interface working
- ✅ Games page displaying all games
- ✅ Admin can create, edit, and manage games

## 📞 Support

If you encounter issues:
1. Check the database connection
2. Verify all migrations have run
3. Check the server logs for errors
4. Ensure proper admin authentication
5. Verify the games routes are properly configured

The games database system is now ready to power your interactive learning platform! 🚀
