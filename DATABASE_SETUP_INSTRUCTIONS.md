# Database Setup Instructions for Games Management

## Step 1: Create the Games Table

First, you need to create the games table in your database. Run this SQL:

```sql
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
);
```

## Step 2: Populate with Existing Games Data

Run the SQL script `insert-games.sql` to populate the database with all the existing games from the games page.

You can do this by:

1. **Using psql command line:**
   ```bash
   psql -d your_database_name -f insert-games.sql
   ```

2. **Using pgAdmin or another PostgreSQL client:**
   - Open the `insert-games.sql` file
   - Copy and paste the contents
   - Execute the SQL

3. **Using your application's database connection:**
   - The SQL file contains all the INSERT statements needed

## Step 3: Verify the Data

After running the SQL, you should have 23 games in your database:

- 1 AI Generated game
- 1 True/False game  
- 1 Flip Cards game
- 20 Matching games (2-column and 3-column)

## Step 4: Test the Admin Interface

1. Navigate to `/admin/games` in your application
2. You should see all the games listed
3. You can create, edit, and delete games
4. The games are now managed through the database instead of hardcoded components

## Games Categories:

- **ai-generated**: AI-powered exercise generator
- **true-false**: True/False challenge games
- **flip-cards**: Interactive flip card games
- **matching**: Various matching games (2-column and 3-column)

## Game Types:

- **ai-exercises**: AI-generated personalized exercises
- **true-false**: True/False statement games
- **flip-cards**: Card flipping games
- **matching-cards**: Matching games with different complexities

## Difficulty Levels:

- **beginner**: Easy games for new learners
- **intermediate**: Moderate difficulty games
- **advanced**: Complex games requiring deeper knowledge

The admin interface now provides full CRUD operations for managing all these games through the database!
