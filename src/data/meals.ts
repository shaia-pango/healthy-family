export type MealType = 'בוקר' | 'צהריים' | 'ערב' | 'נשנוש';

export const MEALS: MealType[] = ['בוקר', 'צהריים', 'ערב', 'נשנוש'];

export const MEAL_EMOJI: Record<MealType, string> = {
  בוקר: '🌅',
  צהריים: '☀️',
  ערב: '🌙',
  נשנוש: '🍿',
};
