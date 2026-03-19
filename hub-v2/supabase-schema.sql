-- ============================================================
-- PM Hub — Schéma Supabase
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- Table unique clé/valeur (miroir du localStorage)
CREATE TABLE IF NOT EXISTS pmhub_data (
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key        TEXT        NOT NULL,
  value      JSONB       NOT NULL DEFAULT 'null',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

-- Activer Row Level Security
ALTER TABLE pmhub_data ENABLE ROW LEVEL SECURITY;

-- Politique : chaque utilisateur accède uniquement à ses données
CREATE POLICY "pmhub_user_own_data"
  ON pmhub_data
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index pour accélérer les requêtes par user_id
CREATE INDEX IF NOT EXISTS idx_pmhub_data_user ON pmhub_data (user_id);

-- ============================================================
-- Vérification : SELECT * FROM pmhub_data LIMIT 10;
-- ============================================================
