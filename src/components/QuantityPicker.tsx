import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import type { FoodItem } from '../data/foodCatalog';

type Props = {
  item: FoodItem | null;
  onConfirm: (qty: number) => void;
  onCancel: () => void;
};

const MAX_QTY = 20;

export function QuantityPicker({ item, onConfirm, onCancel }: Props) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item) setQty(1);
  }, [item]);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(MAX_QTY, q + 1));

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
                <div className="text-gray-500 mb-6">כמה אכלת?</div>
              </div>

              <div className="flex items-center justify-between mb-8 px-2">
                <button
                  onClick={dec}
                  disabled={qty <= 1}
                  aria-label="הפחת"
                  className="w-20 h-20 rounded-full bg-gray-100 grid place-items-center text-gray-700 active:scale-90 transition disabled:opacity-30 no-tap-highlight"
                >
                  <Minus size={40} strokeWidth={3} />
                </button>

                <motion.div
                  key={qty}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-black text-7xl text-brand-600 min-w-[80px] text-center tabular-nums"
                >
                  {qty}
                </motion.div>

                <button
                  onClick={inc}
                  disabled={qty >= MAX_QTY}
                  aria-label="הוסף"
                  className="w-20 h-20 rounded-full bg-brand-500 grid place-items-center text-white active:scale-90 transition disabled:opacity-30 shadow-lg no-tap-highlight"
                >
                  <Plus size={40} strokeWidth={3} />
                </button>
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
