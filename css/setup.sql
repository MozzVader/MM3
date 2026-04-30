-- 1. Tabla profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para auto-crear profile cuando se registra un user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$ BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
    RETURN NEW;
END;
 $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabla game_scores
CREATE TABLE game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    game_slug TEXT NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla memotest_configs
CREATE TABLE memotest_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    card_urls TEXT[] NOT NULL,
    grid_size TEXT NOT NULL DEFAULT '4x4',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_game_scores_game_slug ON game_scores(game_slug);
CREATE INDEX idx_game_scores_score_desc ON game_scores(score DESC);
CREATE INDEX idx_game_scores_user_game ON game_scores(user_id, game_slug);
CREATE INDEX idx_memotest_configs_user ON memotest_configs(user_id);
CREATE INDEX idx_memotest_configs_public ON memotest_configs(is_public) WHERE is_public = true;

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE memotest_configs ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: game_scores
CREATE POLICY "Anyone can view scores"
    ON game_scores FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert own scores"
    ON game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
    ON game_scores FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores"
    ON game_scores FOR DELETE USING (auth.uid() = user_id);

-- Policies: memotest_configs
CREATE POLICY "Anyone can view public configs"
    ON memotest_configs FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own configs"
    ON memotest_configs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs"
    ON memotest_configs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs"
    ON memotest_configs FOR DELETE USING (auth.uid() = user_id);
