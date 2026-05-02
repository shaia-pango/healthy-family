# המשפחה הבריאה 🌱

אפליקציית PWA משפחתית שעוזרת להוריד צריכת סוכר ולעודד תזונה בריאה דרך משחק
חיית-מחמד וירטואלית ולוח שבועי משפחתי.

- 4 פרופילים: רויטל / שי / אחינועם / אביתר (אפשר לערוך ב-Supabase)
- ניקוד פר ארוחה: ירוק +10, כתום +2, אדום 0, בונוס +15 על ארוחה מאוזנת
- חיית מחמד אישית שגדלה בשלבים: ביצה → תינוק → ילד → נער → בוגר
- לוח שבועי משפחתי בזמן אמת — כשמישהו מתעד, כל המשפחה רואה
- תמונות ארוחות נשמרות מקומית במכשיר; שאר הנתונים מסונכרנים דרך Supabase
- כניסה לפי קוד משפחתי — בלי הרשמה, בלי סיסמאות

## איך זה עובד

האפליקציה רצה כ-Web/PWA ב-Vercel. כל בן משפחה פותח את הכתובת בטלפון,
מזין פעם אחת את הקוד המשפחתי, ובוחר "הוסף למסך הבית" כדי שתהיה כמו
אפליקציה רגילה. הנתונים מסונכרנים דרך Supabase ב-Realtime.

## פריסה ראשונית — מה לעשות פעם אחת

### 1. Supabase (הדאטהבייס)

1. נכנסים ל-[supabase.com](https://supabase.com) → New project
2. בוחרים שם (`healthy-family`), סיסמה ל-DB, אזור (`eu-central-1` הכי קרוב)
3. לאחר ~2 דקות הפרויקט מוכן. פותחים **SQL Editor** → New query
4. מעתיקים את כל התוכן של [`SETUP.sql`](./SETUP.sql) → **Run**
5. **Project Settings → API** — מעתיקים שני ערכים:
   - `Project URL` (משהו כמו `https://abcdef.supabase.co`)
   - `anon public` key (טקסט ארוך)

### 2. GitHub

1. יוצרים ריפו חדש ריק (פרטי) ב-[github.com](https://github.com/new)
2. בתוך תיקיית `healthy-family` מריצים:
   ```bash
   git init
   git add .
   git commit -m "אפליקציית המשפחה הבריאה"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/healthy-family.git
   git push -u origin main
   ```

### 3. Vercel (האחסון/Hosting)

1. נכנסים ל-[vercel.com](https://vercel.com) → **Add New → Project**
2. בוחרים את הריפו `healthy-family`
3. **Environment Variables** — מוסיפים שני משתנים מ-Supabase:
   - `VITE_SUPABASE_URL` = ה-URL שהעתקתם
   - `VITE_SUPABASE_ANON_KEY` = ה-key שהעתקתם
4. לוחצים **Deploy** — לוקח כדקה
5. מקבלים כתובת כמו `https://healthy-family.vercel.app`

### 4. שיתוף עם המשפחה

- שולחים לכולם את הכתובת
- כל אחד פותח, מזין קוד משפחתי משותף (למשל `AVIRAM`) — אם זה הראשון, נוצרת משפחה
- האחרים מזינים את אותו קוד ומיד רואים את כולם
- בספארי/כרום: שיתוף ← "הוסף למסך הבית" ← אפליקציה!

## פיתוח לוקלי

```bash
cp .env.example .env.local
# מלאו את הערכים מ-Supabase
npm install
npm run dev
```

## מה שווה לדעת

- **קוד משפחתי הוא ה"סיסמה"** — מי שיודע את הקוד יכול לראות ולערוך נתונים
- **תמונות לא מסונכרנות** — נשמרות מקומית בכל מכשיר. כדי לראות תמונה שמישהו אחר צילם, צריך להיות באותו מכשיר. (אפשר לשדרג בעתיד ל-Supabase Storage)
- **חינם** — Supabase free tier (500MB DB, 2GB Bandwidth) ו-Vercel hobby tier מספיקים בקלות למשפחה של 4
- **בלי auth אמיתי** — מתאים לאפליקציה משפחתית פנימית. לא להפיץ בציבור הרחב

## מבנה הפרויקט

```
src/
  data/         # קטלוג אוכל, פרופילי משפחה, חיות מחמד
  db/           # IndexedDB (תמונות + קוד משפחתי)
  lib/          # Supabase client, scoring, speech, family API
  store/        # Zustand store מרכזי
  pages/        # Onboarding, Home, LogMeal, Pet, Leaderboard, Settings
  components/   # BottomNav, MemberCard, FoodIcon, PetCanvas, WeeklyChart
SETUP.sql       # להריץ פעם אחת ב-Supabase
.env.example    # תבנית למשתני סביבה
```
