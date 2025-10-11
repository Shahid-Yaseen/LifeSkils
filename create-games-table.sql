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
