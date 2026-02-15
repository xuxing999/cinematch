-- Migration: Add location, intent, gender_age_label columns to signals table
-- Branch: feature/trust-and-filters
-- Date: 2026-02-15

-- 1. 新增 location 欄位（縣市）
ALTER TABLE public.signals
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT NULL;

-- 2. 新增 intent 欄位（社交意圖：AA制 / 我請客 / 看完各走各的）
ALTER TABLE public.signals
  ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT NULL
  CONSTRAINT signals_intent_check CHECK (
    intent IS NULL OR intent IN ('aa_split', 'i_treat', 'just_watch')
  );

-- 3. 新增 gender_age_label 欄位（選填，自我描述標籤）
ALTER TABLE public.signals
  ADD COLUMN IF NOT EXISTS gender_age_label TEXT DEFAULT NULL;

-- 4. 為 location 欄位建立索引（加速篩選查詢）
CREATE INDEX IF NOT EXISTS idx_signals_location ON public.signals (location)
  WHERE location IS NOT NULL;

-- 5. 為 intent 欄位建立索引
CREATE INDEX IF NOT EXISTS idx_signals_intent ON public.signals (intent)
  WHERE intent IS NOT NULL;

-- 完成
COMMENT ON COLUMN public.signals.location IS '縣市地區，例如：台北市、新北市';
COMMENT ON COLUMN public.signals.intent IS '社交意圖：aa_split | i_treat | just_watch';
COMMENT ON COLUMN public.signals.gender_age_label IS '選填自我描述標籤，例如：男 / 20s';
