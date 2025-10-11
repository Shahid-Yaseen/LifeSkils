-- Migration to update games table with new columns for game-specific data
-- This migration adds the new columns for storing different types of game data

-- Add new columns to games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS true_false_questions JSONB,
ADD COLUMN IF NOT EXISTS matching_pairs JSONB,
ADD COLUMN IF NOT EXISTS triple_matches JSONB,
ADD COLUMN IF NOT EXISTS flip_cards JSONB,
ADD COLUMN IF NOT EXISTS ai_topics JSONB;

-- Create indexes for better performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_games_true_false_questions ON games USING GIN (true_false_questions);
CREATE INDEX IF NOT EXISTS idx_games_matching_pairs ON games USING GIN (matching_pairs);
CREATE INDEX IF NOT EXISTS idx_games_triple_matches ON games USING GIN (triple_matches);
CREATE INDEX IF NOT EXISTS idx_games_flip_cards ON games USING GIN (flip_cards);
CREATE INDEX IF NOT EXISTS idx_games_ai_topics ON games USING GIN (ai_topics);

-- Create index for game type for faster filtering
CREATE INDEX IF NOT EXISTS idx_games_game_type ON games (game_type);
CREATE INDEX IF NOT EXISTS idx_games_category ON games (category);
CREATE INDEX IF NOT EXISTS idx_games_difficulty ON games (difficulty);
CREATE INDEX IF NOT EXISTS idx_games_is_active ON games (is_active);

-- Add comments to document the new columns
COMMENT ON COLUMN games.true_false_questions IS 'Array of true/false questions with statements, answers, and explanations';
COMMENT ON COLUMN games.matching_pairs IS 'Array of 2-column matching pairs with left and right items';
COMMENT ON COLUMN games.triple_matches IS 'Array of 3-column matching data for advanced games';
COMMENT ON COLUMN games.flip_cards IS 'Array of flip card data with front and back content';
COMMENT ON COLUMN games.ai_topics IS 'Array of AI exercise topics with icons and descriptions';
