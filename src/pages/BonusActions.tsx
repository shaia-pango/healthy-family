import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyStore } from '../store/familyStore';
import { DEFAULT_BONUS_TEMPLATES, type BonusTemplate } from '../data/bonusTemplates';

type Step = 'who' | 'pick' | 'done';

export function BonusActions() {
  const nav = useNavigate();
  const { members, bonusTemplates, addBonus } = useFamilyStore();
  const [step, setStep] = useState<Step>('who');
  const [memberId, setMemberId] = useState('');
  const [picked, setPicked] = useState<{ template: BonusTemplate; logId: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const member = members.find((m) => m.id === memberId);

  // אם אין תבניות מהשרת (משפחה ישנה / SETUP.sql לא הורץ), נראה את ברירות המחדל
  const templates = bonusTemplates.length > 0 ? bonusTemplates : DEFAULT_BONUS_TEMPLATES;

  const submit = async (template: BonusTemplate) => {
    try {
      setError(null);
      const result = await addBonus({
        memberId,
        emoji: template.emoji,
        label: template.label,
        points: template.points,
      });
      setPicked({ template, logId: result.logId });
      setStep('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'שגיאה';
      setError(msg);
    }
  };

  if (step === 'who') {
    return (
      <div className="px-4 pt-6 pb-32 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-center mb-1">🌟 פעולה מיוחדת</h2>
        <p className="text-center text-gray-600 mb-6">מי הצטיין?</p>
        <div className="grid grid-cols-2 gap-4">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMemberId(m.id);
                setStep('pick');
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

  if (step === 'pick') {
    return (
      <div className="px-4 pt-6 pb-32 max-w-2xl mx-auto">
        <h2 className="text-xl font-black text-center mb-1">
          {member?.avatar} {member?.name}
        </h2>
        <p className="text-center text-gray-600 mb-6">איזו פעולה?</p>
        {error && (
          <div className="mb-4 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-2xl p-3 text-sm">
            {error}
            <div className="text-xs mt-1 text-rose-600">
              ייתכן שצריך להריץ את SETUP.sql המעודכן ב-Supabase.
            </div>
          </div>
        )}
        <div className="space-y-2">
          {templates.map((t, i) => (
            <button
              key={t.id ?? i}
              onClick={() => submit(t)}
              className="w-full bg-white rounded-2xl p-4 shadow flex items-center gap-4 active:scale-95 transition no-tap-highlight"
            >
              <span className="text-4xl">{t.emoji}</span>
              <span className="flex-1 text-start font-bold text-lg">{t.label}</span>
              <span className="bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full">
                +{t.points}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep('who')}
          className="mt-4 w-full text-brand-600 font-bold py-3"
        >
          ← חזרה
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-32 max-w-2xl mx-auto text-center">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-9xl mb-4"
        >
          {picked?.template.emoji}
        </motion.div>
      </AnimatePresence>
      <div className="font-black text-xl text-gray-700 mb-1">{picked?.template.label}</div>
      <div className="text-3xl font-black text-amber-600">+{picked?.template.points} נקודות!</div>
      <div className="text-lg text-gray-600 mt-2">{member?.name} מצטיין/ת! 🎉</div>
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => nav('/')}
          className="bg-brand-500 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg active:scale-95"
        >
          חזרה לבית
        </button>
        <button
          onClick={() => {
            setPicked(null);
            setStep('who');
          }}
          className="bg-white text-gray-700 font-bold px-8 py-4 rounded-2xl border-2"
        >
          עוד פעולה מיוחדת
        </button>
      </div>
    </div>
  );
}
