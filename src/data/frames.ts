import type { FoodGroup } from './foodCatalog';

// קבוצות שיש להן יעד יומי (snack/sweet לא נחשבים — אין יעד "ממתקים ביום")
export type FramedGroup = Extract<FoodGroup, 'fruit' | 'vegetable' | 'protein' | 'dairy' | 'grain' | 'drink'>;

export const FRAMED_GROUPS: FramedGroup[] = ['fruit', 'vegetable', 'protein', 'dairy', 'grain', 'drink'];

export type DailyFrame = Record<FramedGroup, number>;

export const FRAME_GROUP_LABELS: Record<FramedGroup, string> = {
  fruit: 'פירות',
  vegetable: 'ירקות',
  protein: 'חלבון',
  dairy: 'חלב',
  grain: 'דגנים מלאים',
  drink: 'מים',
};

export const FRAME_GROUP_EMOJI: Record<FramedGroup, string> = {
  fruit: '🍎',
  vegetable: '🥕',
  protein: '🍳',
  dairy: '🥛',
  grain: '🍞',
  drink: '💧',
};

// ברירות מחדל לפי משרד הבריאות (פירמידת המזון הישראלית)
export const FRAME_AGE_4_8: DailyFrame = {
  fruit: 2,
  vegetable: 3,
  protein: 2,
  dairy: 2,
  grain: 4,
  drink: 5,
};

export const FRAME_AGE_9_13: DailyFrame = {
  fruit: 2,
  vegetable: 4,
  protein: 3,
  dairy: 2,
  grain: 5,
  drink: 6,
};

export const FRAME_ADULT: DailyFrame = {
  fruit: 2,
  vegetable: 5,
  protein: 3,
  dairy: 2,
  grain: 4,
  drink: 8,
};

export function defaultFrameForAge(age: number): DailyFrame {
  if (age <= 8) return { ...FRAME_AGE_4_8 };
  if (age <= 13) return { ...FRAME_AGE_9_13 };
  return { ...FRAME_ADULT };
}
