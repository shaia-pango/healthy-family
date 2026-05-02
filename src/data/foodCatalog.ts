export type FoodCategory = 'green' | 'orange' | 'red';

export type FoodCombo = {
  id: string;       // FK ל-FoodItem אחר שיתווסף לארוחה כשבוחרים את הקומבו
  label: string;    // מה כתוב על הכפתור בפיקר (למשל "עם לחמנייה")
};

export type FoodItem = {
  id: string;
  nameHe: string;
  emoji: string;
  category: FoodCategory;
  group: FoodGroup;
  combos?: FoodCombo[];   // אופציונלי — למשל המבורגר עם לחמנייה
};

// קטגוריות תצוגה בפיקר (מסכמות יחד group+category לכלים נוחים יותר)
export type DisplayCategory = 'produce' | 'carbs' | 'protein' | 'naughty';

export const DISPLAY_CATEGORIES: DisplayCategory[] = ['produce', 'carbs', 'protein', 'naughty'];

export const DISPLAY_CATEGORY_LABELS: Record<DisplayCategory, string> = {
  produce: 'ירקות ופירות',
  carbs: 'דגנים ופחמימות',
  protein: 'חלבונים',
  naughty: 'שובבים',
};

export const DISPLAY_CATEGORY_EMOJI: Record<DisplayCategory, string> = {
  produce: '🥗',
  carbs: '🍞',
  protein: '🍗',
  naughty: '🍭',
};

export function displayCategoryOf(food: FoodItem): DisplayCategory {
  if (food.group === 'fruit' || food.group === 'vegetable') return 'produce';
  if (food.group === 'grain') return 'carbs';
  if (food.group === 'protein' || food.group === 'dairy') return 'protein';
  if (food.group === 'snack' || food.group === 'sweet') return 'naughty';
  // drinks: מים → produce, מיץ/קולה → naughty
  if (food.group === 'drink') {
    return food.category === 'green' ? 'produce' : 'naughty';
  }
  return 'naughty';
}

export type FoodGroup =
  | 'fruit'
  | 'vegetable'
  | 'protein'
  | 'dairy'
  | 'grain'
  | 'drink'
  | 'snack'
  | 'sweet';

export const FOOD_CATALOG: FoodItem[] = [
  // ירוק — פירות
  { id: 'apple', nameHe: 'תפוח', emoji: '🍎', category: 'green', group: 'fruit' },
  { id: 'banana', nameHe: 'בננה', emoji: '🍌', category: 'green', group: 'fruit' },
  { id: 'grapes', nameHe: 'ענבים', emoji: '🍇', category: 'green', group: 'fruit' },
  { id: 'strawberry', nameHe: 'תות', emoji: '🍓', category: 'green', group: 'fruit' },
  { id: 'watermelon', nameHe: 'אבטיח', emoji: '🍉', category: 'green', group: 'fruit' },
  { id: 'orange', nameHe: 'תפוז', emoji: '🍊', category: 'green', group: 'fruit' },
  { id: 'pear', nameHe: 'אגס', emoji: '🍐', category: 'green', group: 'fruit' },
  { id: 'kiwi', nameHe: 'קיווי', emoji: '🥝', category: 'green', group: 'fruit' },
  { id: 'peach', nameHe: 'אפרסק', emoji: '🍑', category: 'green', group: 'fruit' },
  { id: 'mango', nameHe: 'מנגו', emoji: '🥭', category: 'green', group: 'fruit' },

  // ירוק — ירקות
  { id: 'cucumber', nameHe: 'מלפפון', emoji: '🥒', category: 'green', group: 'vegetable' },
  { id: 'tomato', nameHe: 'עגבנייה', emoji: '🍅', category: 'green', group: 'vegetable' },
  { id: 'carrot', nameHe: 'גזר', emoji: '🥕', category: 'green', group: 'vegetable' },
  { id: 'pepper', nameHe: 'פלפל', emoji: '🫑', category: 'green', group: 'vegetable' },
  { id: 'salad', nameHe: 'סלט ירקות', emoji: '🥗', category: 'green', group: 'vegetable' },
  { id: 'broccoli', nameHe: 'ברוקולי', emoji: '🥦', category: 'green', group: 'vegetable' },
  { id: 'corn', nameHe: 'תירס', emoji: '🌽', category: 'green', group: 'vegetable' },
  { id: 'avocado', nameHe: 'אבוקדו', emoji: '🥑', category: 'green', group: 'vegetable' },
  { id: 'eggplant', nameHe: 'חציל', emoji: '🍆', category: 'green', group: 'vegetable' },

  // ירוק — חלבון
  { id: 'egg', nameHe: 'ביצה קשה', emoji: '🥚', category: 'green', group: 'protein' },
  { id: 'omelette', nameHe: 'חביתה', emoji: '🍳', category: 'green', group: 'protein' },
  { id: 'sunny-egg', nameHe: 'ביצת עין', emoji: '🍳', category: 'green', group: 'protein' },
  { id: 'chicken', nameHe: 'חזה עוף', emoji: '🍗', category: 'green', group: 'protein' },
  { id: 'fish', nameHe: 'דג', emoji: '🐟', category: 'green', group: 'protein' },
  { id: 'tuna', nameHe: 'טונה', emoji: '🥫', category: 'green', group: 'protein' },
  { id: 'tofu', nameHe: 'טופו', emoji: '🍱', category: 'green', group: 'protein' },
  { id: 'lentils', nameHe: 'עדשים', emoji: '🫘', category: 'green', group: 'protein' },
  { id: 'chickpeas', nameHe: 'חומוס גרגירים', emoji: '🫛', category: 'green', group: 'protein' },

  // ירוק — חלב
  { id: 'milk', nameHe: 'חלב', emoji: '🥛', category: 'green', group: 'dairy' },
  { id: 'yogurt-plain', nameHe: 'יוגורט טבעי', emoji: '🍦', category: 'green', group: 'dairy' },
  { id: 'cottage', nameHe: 'קוטג׳', emoji: '🧀', category: 'green', group: 'dairy' },
  { id: 'white-cheese', nameHe: 'גבינה לבנה', emoji: '🧀', category: 'green', group: 'dairy' },

  // ירוק — דגנים מלאים
  { id: 'whole-bread', nameHe: 'לחם מלא', emoji: '🍞', category: 'green', group: 'grain' },
  { id: 'spelt-bread', nameHe: 'לחם כוסמין', emoji: '🌾', category: 'green', group: 'grain' },
  { id: 'spelt-bun', nameHe: 'לחמנית כוסמין', emoji: '🥯', category: 'green', group: 'grain' },
  { id: 'oatmeal', nameHe: 'דייסת שיבולת שועל', emoji: '🥣', category: 'green', group: 'grain' },
  { id: 'brown-rice', nameHe: 'אורז מלא', emoji: '🍚', category: 'green', group: 'grain' },

  // ירוק — שתייה
  { id: 'water', nameHe: 'מים', emoji: '💧', category: 'green', group: 'drink' },

  // כתום — דגנים
  { id: 'white-bread', nameHe: 'לחם לבן', emoji: '🍞', category: 'orange', group: 'grain' },
  { id: 'bun', nameHe: 'לחמנייה', emoji: '🥖', category: 'orange', group: 'grain' },
  { id: 'pita', nameHe: 'פיתה', emoji: '🫓', category: 'orange', group: 'grain' },
  { id: 'pasta', nameHe: 'פסטה', emoji: '🍝', category: 'orange', group: 'grain' },
  { id: 'noodles', nameHe: 'נודלס', emoji: '🍜', category: 'orange', group: 'grain' },
  { id: 'rice', nameHe: 'אורז לבן', emoji: '🍚', category: 'orange', group: 'grain' },
  { id: 'cornflakes', nameHe: 'קורנפלקס', emoji: '🥣', category: 'orange', group: 'grain' },
  { id: 'cracker', nameHe: 'קרקרים', emoji: '🍘', category: 'orange', group: 'grain' },

  // כתום — חלבון
  { id: 'schnitzel', nameHe: 'שניצל', emoji: '🍗', category: 'orange', group: 'protein' },
  { id: 'sausage', nameHe: 'נקניקייה', emoji: '🌭', category: 'orange', group: 'protein',
    combos: [{ id: 'bun', label: 'עם לחמנייה' }] },
  { id: 'meatballs', nameHe: 'קציצות', emoji: '🍡', category: 'orange', group: 'protein' },
  { id: 'hamburger', nameHe: 'המבורגר', emoji: '🍔', category: 'orange', group: 'protein',
    combos: [{ id: 'bun', label: 'עם לחמנייה' }] },
  { id: 'shawarma', nameHe: 'שווארמה', emoji: '🌯', category: 'orange', group: 'protein' },

  // כתום — חלב
  { id: 'yellow-cheese', nameHe: 'גבינה צהובה', emoji: '🧀', category: 'orange', group: 'dairy' },
  { id: 'fruit-yogurt', nameHe: 'יוגורט פרי', emoji: '🍨', category: 'orange', group: 'dairy' },

  // כתום — שתייה
  { id: 'juice', nameHe: 'מיץ פירות', emoji: '🧃', category: 'orange', group: 'drink' },

  // כתום — מאפים/פיצה
  { id: 'pizza', nameHe: 'פיצה', emoji: '🍕', category: 'orange', group: 'grain' },
  { id: 'borekas', nameHe: 'בורקס', emoji: '🥟', category: 'orange', group: 'grain' },
  { id: 'falafel', nameHe: 'פלאפל', emoji: '🧆', category: 'orange', group: 'protein' },
  { id: 'humus', nameHe: 'חומוס', emoji: '🥣', category: 'orange', group: 'protein' },

  // אדום — חטיפים
  { id: 'bamba', nameHe: 'במבה', emoji: '🥜', category: 'red', group: 'snack' },
  { id: 'bisli', nameHe: 'ביסלי', emoji: '🥨', category: 'red', group: 'snack' },
  { id: 'chips', nameHe: 'צ׳יפס שקית', emoji: '🍟', category: 'red', group: 'snack' },
  { id: 'pretzels', nameHe: 'בייגלה', emoji: '🥨', category: 'red', group: 'snack' },
  { id: 'popcorn', nameHe: 'פופקורן', emoji: '🍿', category: 'red', group: 'snack' },

  // אדום — מתוקים
  { id: 'chocolate', nameHe: 'שוקולד', emoji: '🍫', category: 'red', group: 'sweet' },
  { id: 'candy', nameHe: 'סוכריה', emoji: '🍬', category: 'red', group: 'sweet' },
  { id: 'lollipop', nameHe: 'סוכריה על מקל', emoji: '🍭', category: 'red', group: 'sweet' },
  { id: 'cookie', nameHe: 'עוגייה', emoji: '🍪', category: 'red', group: 'sweet' },
  { id: 'cake', nameHe: 'עוגה', emoji: '🍰', category: 'red', group: 'sweet' },
  { id: 'donut', nameHe: 'דונאט', emoji: '🍩', category: 'red', group: 'sweet' },
  { id: 'icecream', nameHe: 'גלידה', emoji: '🍦', category: 'red', group: 'sweet' },
  { id: 'wafer', nameHe: 'וופל', emoji: '🍫', category: 'red', group: 'sweet' },
  { id: 'gummy', nameHe: 'סוכריות גומי', emoji: '🍬', category: 'red', group: 'sweet' },

  // אדום — שתייה
  { id: 'soda', nameHe: 'קולה', emoji: '🥤', category: 'red', group: 'drink' },
  { id: 'energy', nameHe: 'משקה אנרגיה', emoji: '🥤', category: 'red', group: 'drink' },
  { id: 'choco', nameHe: 'שוקו', emoji: '🍫', category: 'red', group: 'drink' },
];

export const FOOD_BY_ID: Record<string, FoodItem> = Object.fromEntries(
  FOOD_CATALOG.map((f) => [f.id, f]),
);

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  green: 'בריא',
  orange: 'לפעמים',
  red: 'פינוק',
};

export const CATEGORY_EMOJI: Record<FoodCategory, string> = {
  green: '💚',
  orange: '🧡',
  red: '❤️',
};
