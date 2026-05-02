import { FOOD_BY_ID, type FoodItem } from '../data/foodCatalog';
import { FRAMED_GROUPS, type DailyFrame, type FramedGroup } from '../data/frames';

// סף נקודות לפריט בודד לפי המיקום היחסי בקטגוריה
export const POINTS = {
  withinTarget: 10,    // 0% – 100% מהיעד
  bufferZone: 2,       // 100% – 150% מהיעד
  excessive: -3,       // מעל 150% מהיעד
  orange: 2,           // פריט כתום (תמיד)
  red: 0,              // פריט אדום
  categoryComplete: 15,  // השלמת קטגוריה
  fullDay: 50,           // יום מאוזן מלא
};

export const BUFFER_RATIO = 1.5;

export type ScoreBreakdown = {
  perItem: number;        // ניקוד מצטבר עבור הפריטים עצמם
  categoryBonuses: number;// בונוסים על השלמת קטגוריות
  fullDayBonus: number;   // בונוס יום מאוזן
  total: number;
  newlyCompletedGroups: FramedGroup[];
  fullDayCompleted: boolean;
};

type DayContext = {
  groupCounts: Record<string, number>;       // מנות שכבר נצברו ביום (לפני הארוחה הנוכחית)
  fullDayAlreadyAwarded: boolean;
};

/**
 * חישוב ניקוד עבור ארוחה נתונה, עם הקשר של מנות שנצברו ביום עד עכשיו.
 *
 * @param itemIds - הפריטים בארוחה הזאת (כולל כפילויות לכמויות)
 * @param frame - המסגרת היומית של הילד
 * @param dayContext - מצב היום עד לפני הארוחה
 */
export function scoreMeal(
  itemIds: string[],
  frame: DailyFrame,
  dayContext: DayContext = { groupCounts: {}, fullDayAlreadyAwarded: false },
): ScoreBreakdown {
  const items = itemIds.map((id) => FOOD_BY_ID[id]).filter(Boolean) as FoodItem[];
  // עותק שאנחנו מעדכנים כשעוברים על הפריטים
  const counts: Record<string, number> = { ...dayContext.groupCounts };

  let perItem = 0;
  const justCompleted = new Set<FramedGroup>();

  for (const item of items) {
    if (item.category === 'red') {
      perItem += POINTS.red;
      continue;
    }
    if (item.category === 'orange') {
      perItem += POINTS.orange;
      continue;
    }
    // קבוצה ירוקה
    const group = item.group;
    if (!isFramedGroup(group)) {
      perItem += POINTS.withinTarget;
      continue;
    }
    const target = frame[group];
    const before = counts[group] ?? 0;
    if (before < target) {
      perItem += POINTS.withinTarget;
      const after = before + 1;
      if (after === target) justCompleted.add(group);
    } else if (before < target * BUFFER_RATIO) {
      perItem += POINTS.bufferZone;
    } else {
      perItem += POINTS.excessive;
    }
    counts[group] = (counts[group] ?? 0) + 1;
  }

  const categoryBonuses = justCompleted.size * POINTS.categoryComplete;

  // יום מאוזן: כל הקבוצות במסגרת הגיעו ליעד
  const fullNow = FRAMED_GROUPS.every((g) => (counts[g] ?? 0) >= frame[g]);
  const fullDayCompleted = fullNow && !dayContext.fullDayAlreadyAwarded;
  const fullDayBonus = fullDayCompleted ? POINTS.fullDay : 0;

  return {
    perItem,
    categoryBonuses,
    fullDayBonus,
    total: perItem + categoryBonuses + fullDayBonus,
    newlyCompletedGroups: [...justCompleted],
    fullDayCompleted,
  };
}

/**
 * סיכום מצב היום עד עכשיו עבור בן משפחה — כמה מנות הוא צבר בכל קבוצה.
 * משמש להצגת פסי התקדמות, ולחישוב הקשר לארוחה הבאה.
 */
export function summarizeDay(
  itemIds: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of itemIds) {
    const item = FOOD_BY_ID[id];
    if (!item || item.category !== 'green') continue;
    counts[item.group] = (counts[item.group] ?? 0) + 1;
  }
  return counts;
}

export function isFramedGroup(group: string): group is FramedGroup {
  return (FRAMED_GROUPS as string[]).includes(group);
}

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function isInCurrentWeek(timestamp: number): boolean {
  const start = startOfWeek().getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return timestamp >= start && timestamp < end;
}
