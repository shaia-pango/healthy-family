import { Volume2 } from 'lucide-react';
import type { FoodItem } from '../data/foodCatalog';
import { speakHebrew } from '../lib/speech';

type Props = {
  item: FoodItem;
  selected?: boolean;
  count?: number;
  onClick?: () => void;
};

const categoryStyles = {
  green: 'bg-emerald-50 border-emerald-300 ring-emerald-400',
  orange: 'bg-orange-50 border-orange-300 ring-orange-400',
  red: 'bg-rose-50 border-rose-300 ring-rose-400',
} as const;

export function FoodIcon({ item, selected, count, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-2xl border-2 grid place-items-center no-tap-highlight transition active:scale-90 ${
        categoryStyles[item.category]
      } ${selected ? 'ring-4 scale-105' : ''}`}
    >
      <span className="text-4xl sm:text-5xl">{item.emoji}</span>
      <span className="absolute bottom-1 inset-x-1 text-[11px] font-bold text-gray-700 truncate">
        {item.nameHe}
      </span>
      {count && count > 0 ? (
        <span className="absolute -top-2 -start-2 bg-brand-500 text-white rounded-full w-7 h-7 grid place-items-center font-black text-sm shadow">
          {count}
        </span>
      ) : null}
      <span
        role="button"
        aria-label={`הקרא ${item.nameHe}`}
        onClick={(e) => {
          e.stopPropagation();
          speakHebrew(item.nameHe);
        }}
        className="absolute top-1 end-1 w-6 h-6 grid place-items-center bg-white/80 rounded-full text-gray-600"
      >
        <Volume2 size={14} />
      </span>
    </button>
  );
}
