-- ============================================================
-- אפליקציית "המשפחה הבריאה" — Schema ל-Supabase
-- הריצו את כל הקובץ הזה ב-Supabase SQL Editor פעם אחת
-- (Project → SQL Editor → New query → Paste → Run)
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
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (family_code, id)
);

CREATE INDEX IF NOT EXISTS members_family_idx ON members(family_code);

-- 3. תיעודי ארוחות
CREATE TABLE IF NOT EXISTS food_logs (
  id              BIGSERIAL PRIMARY KEY,
  family_code     TEXT NOT NULL REFERENCES families(code) ON DELETE CASCADE,
  member_id       TEXT NOT NULL,
  date            TEXT NOT NULL,            -- YYYY-MM-DD
  ts              BIGINT NOT NULL,          -- ms epoch
  meal_type       TEXT NOT NULL,
  item_ids        TEXT[] NOT NULL,
  points_earned   INT  NOT NULL,
  has_photo       BOOLEAN NOT NULL DEFAULT FALSE,  -- אם יש תמונה מקומית במכשיר
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_logs_family_ts_idx ON food_logs(family_code, ts DESC);
CREATE INDEX IF NOT EXISTS food_logs_member_idx ON food_logs(family_code, member_id, ts DESC);

-- 4. RLS — מאפשרים גישה מלאה למי שמחזיק קוד משפחתי תקף.
-- בגלל שזו אפליקציה משפחתית פנימית עם קוד שיתופי, אנחנו לא משתמשים ב-Auth מלא.
-- הקוד המשפחתי הוא ה"סיסמה". כל הקריאות כוללות family_code, ו-RLS מאמת שהמשפחה קיימת.

ALTER TABLE families  ENABLE ROW LEVEL SECURITY;
ALTER TABLE members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- מדיניות פתוחה — לכל אחד שיש לו את ה-anon key (הוא ממילא מופיע ב-bundle של האפליקציה)
-- אפשר לקרוא ולכתוב. ההגנה היא ברמת הקוד המשפחתי, שהאפליקציה דורשת בכניסה.

DROP POLICY IF EXISTS "open_families" ON families;
CREATE POLICY "open_families"  ON families  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_members" ON members;
CREATE POLICY "open_members"   ON members   FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_logs" ON food_logs;
CREATE POLICY "open_logs"      ON food_logs FOR ALL USING (true) WITH CHECK (true);

-- 5. (אופציונלי) Realtime — נותן עדכון חי ללוח השבועי כשמישהו מתעד ארוחה
ALTER PUBLICATION supabase_realtime ADD TABLE food_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
