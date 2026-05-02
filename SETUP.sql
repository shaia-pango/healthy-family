-- ============================================================
-- אפליקציית "המשפחה הבריאה" — Schema ל-Supabase
-- הריצו את כל הקובץ הזה ב-Supabase SQL Editor פעם אחת
-- (Project → SQL Editor → New query → Paste → Run)
--
-- אם הסכמה הישנה כבר קיימת, הקובץ הזה יוסיף עמודות וטבלאות חדשות
-- מבלי למחוק נתונים קיימים. ALTER TABLE ... IF NOT EXISTS חוסך התנגשויות.
-- ============================================================

-- 1. טבלת משפחות (כל משפחה = קוד אחד)
CREATE TABLE IF NOT EXISTS families (
  code        TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT 'משפחה',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. בני משפחה
CREATE TABLE IF NOT EXISTS members (
  id            TEXT NOT NULL,
  family_code   TEXT NOT NULL REFERENCES families(code) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  age           INT  NOT NULL,
  avatar        TEXT NOT NULL,
  pet_type      TEXT NOT NULL,
  pet_name      TEXT NOT NULL,
  color         TEXT NOT NULL,
  frame         JSONB,                            -- מסגרת יומית (יעד מנות לכל קבוצה)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (family_code, id)
);

-- אם הטבלה קיימת מסכמה ישנה — מוסיפים עמודה
ALTER TABLE members ADD COLUMN IF NOT EXISTS frame JSONB;

CREATE INDEX IF NOT EXISTS members_family_idx ON members(family_code);

-- 3. תיעודי ארוחות (וגם בונוסים — באמצעות kind)
CREATE TABLE IF NOT EXISTS food_logs (
  id              BIGSERIAL PRIMARY KEY,
  family_code     TEXT NOT NULL REFERENCES families(code) ON DELETE CASCADE,
  member_id       TEXT NOT NULL,
  date            TEXT NOT NULL,            -- YYYY-MM-DD
  ts              BIGINT NOT NULL,          -- ms epoch
  meal_type       TEXT NOT NULL,            -- בוקר/צהריים/ערב/נשנוש/בונוס
  item_ids        TEXT[] NOT NULL,
  points_earned   INT  NOT NULL,
  has_photo       BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  kind            TEXT NOT NULL DEFAULT 'meal', -- meal | bonus
  bonus_label     TEXT,                          -- תיאור הבונוס (אם kind=bonus)
  bonus_emoji     TEXT,                          -- אימוג'י (אם kind=bonus)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS kind         TEXT NOT NULL DEFAULT 'meal';
ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS bonus_label  TEXT;
ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS bonus_emoji  TEXT;

CREATE INDEX IF NOT EXISTS food_logs_family_ts_idx ON food_logs(family_code, ts DESC);
CREATE INDEX IF NOT EXISTS food_logs_member_idx ON food_logs(family_code, member_id, ts DESC);

-- 4. תבניות בונוס (כל משפחה יכולה להוסיף משלה)
CREATE TABLE IF NOT EXISTS bonus_templates (
  id            BIGSERIAL PRIMARY KEY,
  family_code   TEXT NOT NULL REFERENCES families(code) ON DELETE CASCADE,
  emoji         TEXT NOT NULL,
  label         TEXT NOT NULL,
  points        INT  NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT FALSE,   -- ברירת מחדל שזרענו עבור המשפחה
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bonus_templates_family_idx ON bonus_templates(family_code);

-- 5. RLS — מאפשרים גישה מלאה למי שמחזיק קוד משפחתי תקף
ALTER TABLE families         ENABLE ROW LEVEL SECURITY;
ALTER TABLE members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_templates  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_families" ON families;
CREATE POLICY "open_families"          ON families         FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_members" ON members;
CREATE POLICY "open_members"           ON members          FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_logs" ON food_logs;
CREATE POLICY "open_logs"              ON food_logs        FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_bonus_templates" ON bonus_templates;
CREATE POLICY "open_bonus_templates"   ON bonus_templates  FOR ALL USING (true) WITH CHECK (true);

-- 6. Realtime — עדכון חי בין מכשירי המשפחה
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE food_logs;       EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE members;         EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE bonus_templates; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;
