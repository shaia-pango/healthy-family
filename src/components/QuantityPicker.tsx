import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FoodItem } from '../data/foodCatalog';

type Props = {
  item: FoodItem | null;
  onConfirm: (qty: number) => void;
  onCancel: () => void;
};

const OPTIONS = [1, 2, 3, 4, 5, 6];

export function QuantityPicker({ item, onConfirm, onCancel }: Props) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item) setQty(1);
  }, [item]);

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-[70] bg-white rounded-t-[2.5rem] shadow-2xl safe-bottom"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3" />
            <div className="px-6 pt-4 pb-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-7xl mb-2">{item.emoji}</div>
                <div className="font-black text-2xl mb-1">{item.nameHe}</div>
                <div className="text-gray-500 mb-5">כמה אכלת?</div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setQty(n)}
                    className={`aspect-square rounded-2xl font-black text-3xl transition active:scale-90 no-tap-highlight ${
                      qty === n
                        ? 'bg-brand-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl"
                >
                  ביטול
                </button>
                <button
                  onClick={() => onConfirm(qty)}
                  className="flex-1 bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95"
                >
                  אישור ✓
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
