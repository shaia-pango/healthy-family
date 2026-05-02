import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyStore } from '../store/familyStore';
import {
  FOOD_CATALOG,
  DISPLAY_CATEGORIES,
  DISPLAY_CATEGORY_LABELS,
  DISPLAY_CATEGORY_EMOJI,
  displayCategoryOf,
  type DisplayCategory,
  type FoodItem,
} from '../data/foodCatalog';
import { FoodIcon } from '../components/FoodIcon';
import { QuantityPicker } from '../components/QuantityPicker';
import { scoreMeal, summarizeDay } from '../lib/scoring';
import { PET_EMOJIS, stageForPoints } from '../data/pets';
import { MEALS, MEAL_EMOJI, type MealType } from '../data/meals';
import { defaultFrameForAge } from '../data/frames';

type Step = 'who' | 'meal' | 'pick' | 'done';

export function LogMeal() {
  const nav = useNavigate();
  const { members, addMealLog, todayMealItemsFor, frameFor } = useFamilyStore();
  const [step, setStep] = useState<Step>('who');
  const [memberId, setMemberId] = useState<string>('');
  const [meal, setMeal] = useState<MealType>('בוקר');
  const [category, setCategory] = useState<DisplayCategory>('produce');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [points, setPoints] = useState(0);
  const [pickerItem, setPickerItem] = useState<FoodItem | null>(null);

  const member = members.find((m) => m.id === memberId);

  const filteredFoods = useMemo(
    () => FOOD_CATALOG.filter((f) => displayCategoryOf(f) === category),
    [category],
  );

  const pickedIds = useMemo(
    () => Object.entries(counts).flatMap(([id, n]) => Array(n).fill(id)),
    [counts],
  );

  const livePreview = useMemo(() => {
    if (!member) return { perItem: 0, categoryBonuses: 0, fullDayBonus: 0, total: 0, newlyCompletedGroups: [], fullDayCompleted: false };
    const frame = member.frame ?? defaultFrameForAge(member.age);
    const dayItems = todayMealItemsFor(member.id);
    const dayCounts = summarizeDay(dayItems);
    const fullDayAlreadyAwarded = Object.entries(frame).every(([g, t]) => (dayCounts[g] ?? 0) >= t);
    return scoreMeal(pickedIds, frame, { groupCounts: dayCounts, fullDayAlreadyAwarded });
  }, [pickedIds, member, todayMealItemsFor]);

  const handleFoodTap = (item: FoodItem) => {
    if (counts[item.id]) {
      // already selected — remove entirely
      setCounts((c) => {
        const next = { ...c };
        delete next[item.id];
        return next;
      });
    } else {
      // open quantity picker
      setPickerItem(item);
    }
  };

  const confirmQuantity = (qty: number, comboIds: string[]) => {
    if (!pickerItem) return;
    setCounts((c) => {
      const next = { ...c, [pickerItem.id]: qty };
      // קומבו (לדוגמה: לחמנייה למבורגר) — מוסיפים את אותה כמות מהפריט המשני
      for (const cid of comboIds) {
        next[cid] = (next[cid] ?? 0) + qty;
      }
      return next;
    });
    setPickerItem(null);
  };

  const removeItem = (id: string) => {
    setCounts((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  };

  const finish = async () => {
    if (!memberId || pickedIds.length === 0) return;
    const result = await addMealLog({ memberId, mealType: meal, itemIds: pickedIds });
    setPoints(result.pointsEarned);
    setStep('done');
  };

  // suppress unused warning — frameFor is exposed for parity but recomputed inline
  void frameFor;

  if (step === 'who') {
    return (
      <div className="px-4 pt-6 pb-32 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-6">מי אכל? 🤔</h2>
        <div className="grid grid-cols-2 gap-4">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMemberId(m.id);
                setStep('meal');
              }}
              className="bg-white rounded-3xl p-6 shadow-md active:scale-95 transition border-4 no-tap-highlight"
              style={{ borderColor: m.color }}
            >
              <div className="text-6xl">{m.avatar}</div>
              <div className="mt-2 font-black text-xl">{m.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'meal') {
    return (
      <div className="px-4 pt-6 pb-32 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-6">איזו ארוחה? 🍴</h2>
        <div className="grid grid-cols-2 gap-4">
          {MEALS.map((m) => (
            <button
              key={m}
              onClick={() => {
                setMeal(m);
                setStep('pick');
              }}
              className="bg-white rounded-3xl p-6 shadow-md active:scale-95 transition no-tap-highlight"
            >
              <div className="text-6xl">{MEAL_EMOJI[m]}</div>
              <div className="mt-2 font-black text-xl">{m}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'pick') {
    return (
      <div className="px-4 pt-4 pb-40 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-2 mb-4 sticky top-0 bg-[#fef3e7] z-10 py-2">
          {DISPLAY_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`py-3 rounded-2xl font-black text-sm transition no-tap-highlight flex items-center justify-center gap-1 ${
                category === c
                  ? 'bg-brand-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700'
              }`}
            >
              <span className="text-xl">{DISPLAY_CATEGORY_EMOJI[c]}</span>
              <span>{DISPLAY_CATEGORY_LABELS[c]}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filteredFoods.map((item) => (
            <FoodIcon
              key={item.id}
              item={item}
              count={counts[item.id]}
              selected={!!counts[item.id]}
              onClick={() => handleFoodTap(item)}
            />
          ))}
        </div>

        <QuantityPicker
          item={pickerItem}
          onConfirm={confirmQuantity}
          onCancel={() => setPickerItem(null)}
        />

        <div
          className="fixed inset-x-0 max-w-2xl mx-auto px-4 z-20"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)' }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-3 flex items-center gap-3 border-2 border-brand-200">
            <div className="flex-1">
              <div className="text-xs text-gray-500">סך נקודות</div>
              <div className={`font-black text-2xl ${livePreview.total >= 0 ? 'text-brand-600' : 'text-rose-600'}`}>
                {livePreview.total >= 0 ? '+' : ''}{livePreview.total}
              </div>
              {livePreview.categoryBonuses > 0 && (
                <div className="text-xs text-emerald-600 font-bold">🎯 השלמת קטגוריה +{livePreview.categoryBonuses}</div>
              )}
              {livePreview.fullDayBonus > 0 && (
                <div className="text-xs text-amber-600 font-bold">🏆 יום מאוזן +{livePreview.fullDayBonus}!</div>
              )}
            </div>
            <div className="flex gap-1 max-w-[40%] overflow-x-auto">
              {Object.entries(counts).slice(0, 6).map(([id, n]) => {
                const food = FOOD_CATALOG.find((f) => f.id === id);
                return (
                  <button
                    key={id}
                    onClick={() => removeItem(id)}
                    className="text-2xl shrink-0 relative"
                    title="הסר"
                  >
                    {food?.emoji}
                    {n > 1 && (
                      <span className="absolute -top-1 -end-1 text-[10px] bg-brand-500 text-white rounded-full w-4 h-4 grid place-items-center font-bold">
                        {n}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={finish}
              disabled={pickedIds.length === 0}
              className="bg-brand-500 text-white font-black px-5 py-3 rounded-2xl disabled:opacity-40 active:scale-95 transition no-tap-highlight"
            >
              סיימתי ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // done
  const stage = member ? stageForPoints(useFamilyStore.getState().totalPointsFor(member.id)) : 'baby';
  return (
    <div className="px-4 pt-12 pb-32 max-w-2xl mx-auto text-center">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-9xl mb-4"
        >
          {member ? PET_EMOJIS[member.petType][stage] : '🎉'}
        </motion.div>
      </AnimatePresence>
      <div className={`text-3xl font-black ${points >= 0 ? 'text-brand-700' : 'text-rose-600'}`}>
        {points >= 0 ? '+' : ''}{points} נקודות
      </div>
      <div className="text-lg text-gray-600 mt-2">
        {member?.petName} שמח/ה ❤️
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => nav(`/pet/${memberId}`)}
          className="bg-brand-500 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg active:scale-95"
        >
          לראות את החיה 🐲
        </button>
        <button
          onClick={() => nav('/')}
          className="bg-white text-gray-700 font-bold px-8 py-4 rounded-2xl border-2"
        >
          חזרה לבית
        </button>
      </div>
    </div>
  );
}
