import {
  FRAMED_GROUPS,
  FRAME_GROUP_EMOJI,
  FRAME_GROUP_LABELS,
  type DailyFrame,
} from '../data/frames';

type Props = {
  frame: DailyFrame;
  counts: Record<string, number>;
  compact?: boolean;
};

export function DailyProgressBars({ frame, counts, compact }: Props) {
  return (
    <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-1 gap-2'}`}>
      {FRAMED_GROUPS.map((g) => {
        const target = frame[g];
        const current = counts[g] ?? 0;
        const pct = Math.min(100, (current / target) * 100);
        const completed = current >= target;
        return (
          <div
            key={g}
            className={`bg-white rounded-2xl p-3 shadow-sm ${completed ? 'ring-2 ring-emerald-400' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{FRAME_GROUP_EMOJI[g]}</span>
                <span className="font-bold text-sm">{FRAME_GROUP_LABELS[g]}</span>
              </div>
              <div className={`text-sm font-black ${completed ? 'text-emerald-600' : 'text-gray-700'}`}>
                {current}/{target}
                {completed && <span className="ms-1">✓</span>}
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  completed ? 'bg-emerald-500' : 'bg-brand-400'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
