import { FOOD_BY_ID, type FoodItem } from '../data/foodCatalog';

export const POINTS_BY_CATEGORY = {
  green: 10,
  orange: 2,
  red: 0,
} as const;

export const BALANCED_MEAL_BONUS = 15;
export const FIVE_A_DAY_BONUS = 25;

export function scoreItems(itemIds: string[]): {
  total: number;
  perItem: number;
  bonus: number;
  greens: number;
} {
  const items = itemIds.map((id) => FOOD_BY_ID[id]).filter(Boolean) as FoodItem[];
  let perItem = 0;
  let greens = 0;
  for (const item of items) {
    perItem += POINTS_BY_CATEGORY[item.category];
    if (item.category === 'green') greens += 1;
  }
  const bonus = greens >= 3 ? BALANCED_MEAL_BONUS : 0;
  return { perItem, bonus, total: perItem + bonus, greens };
}

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function isInCurrentWeek(timestamp: number): boolean {
  const start = startOfWeek().getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return timestamp >= start && timestamp < end;
}
