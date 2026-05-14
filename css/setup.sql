-- ═══════════════════════════════════════════════════════════
-- Mini Arcade — Supabase Setup
-- ═══════════════════════════════════════════════════════════
-- Ejecutar en SQL Editor de Supabase
-- Incluye: tablas, RLS policies y grants explicitos
-- ═══════════════════════════════════════════════════════════

-- ── Perfil de usuario ──
-- Se auto-crea al registrarse via trigger de Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username    TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Scores globales por juego ──
-- game_slug: 'match3' | 'memotest' | 'sudoku' | '2048'
-- metadata: JSON con datos específicos de cada juego
CREATE TABLE IF NOT EXISTS public.game_scores (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_slug   TEXT NOT NULL,
    score       INTEGER NOT NULL DEFAULT 0,
    level       INTEGER,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Packs compartidos de Memotest ──
-- Preparado para futuro: compartir packs custom via codigo Base64
CREATE TABLE IF NOT EXISTS public.memotest_configs (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    code        TEXT UNIQUE NOT NULL,
    config      JSONB NOT NULL DEFAULT '{}'::jsonb,
    name        TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memotest_configs ENABLE ROW LEVEL SECURITY;

-- profiles: los usuarios solo pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- game_scores: los usuarios solo pueden ver y crear sus propios scores
CREATE POLICY "Users can view own scores"
    ON public.game_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
    ON public.game_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- memotest_configs: los usuarios pueden ver todos los packs y crear los suyos
CREATE POLICY "Anyone can view shared packs"
    ON public.memotest_configs FOR SELECT
    USING (true);

CREATE POLICY "Users can create packs"
    ON public.memotest_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- GRANTS EXPLICITOS
-- ═══════════════════════════════════════════════════════════
-- A partir de Oct 2025, Supabase requiere grants explicitos.
-- Sin estos, las tablas no son accesibles via Data API.

-- profiles: los usuarios leen su propio perfil
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- game_scores: los usuarios leen sus scores y guardan nuevos
GRANT SELECT ON public.game_scores TO authenticated;
GRANT INSERT ON public.game_scores TO authenticated;

-- memotest_configs: los usuarios leen packs y crean los suyos
GRANT SELECT ON public.memotest_configs TO authenticated;
GRANT INSERT ON public.memotest_configs TO authenticated;

-- ═══════════════════════════════════════════════════════════
-- INDICES (performance)
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_game_scores_user
    ON public.game_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_game_scores_slug
    ON public.game_scores(game_slug);

CREATE INDEX IF NOT EXISTS idx_game_scores_created
    ON public.game_scores(created_at DESC);
