import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import {
  FRAMED_GROUPS,
  FRAME_GROUP_EMOJI,
  FRAME_GROUP_LABELS,
  defaultFrameForAge,
  type DailyFrame,
} from '../data/frames';

export function FrameSettings() {
  const { memberId } = useParams<{ memberId: string }>();
  const nav = useNavigate();
  const member = useFamilyStore((s) => s.members.find((m) => m.id === memberId));
  const saveMemberFrame = useFamilyStore((s) => s.saveMemberFrame);
  const initialFrame = member?.frame ?? (member ? defaultFrameForAge(member.age) : defaultFrameForAge(8));
  const [frame, setFrame] = useState<DailyFrame>(initialFrame);
  const [busy, setBusy] = useState(false);

  if (!member) return <div className="p-8 text-center">לא נמצא</div>;

  const adjust = (group: keyof DailyFrame, delta: number) => {
    setFrame((f) => ({ ...f, [group]: Math.max(0, Math.min(20, f[group] + delta)) }));
  };

  const save = async () => {
    setBusy(true);
    await saveMemberFrame(member.id, frame);
    setBusy(false);
    nav(`/pet/${member.id}`);
  };

  const restoreDefault = () => setFrame(defaultFrameForAge(member.age));

  return (
    <div className="px-4 pt-4 pb-32 max-w-2xl mx-auto">
      <Link to={`/pet/${member.id}`} className="text-brand-600 font-bold mb-3 inline-block">
        ← חזרה
      </Link>
      <h2 className="text-2xl font-black mb-1">
        🎯 המסגרת של {member.avatar} {member.name}
      </h2>
      <p className="text-gray-600 mb-5">
        כמה מנות ביום אנחנו מצפים בכל קבוצה? הניקוד מתחזק כל זמן שבתוך היעד, ויורד אם אוכלים הרבה יותר מדי מאותה קבוצה.
      </p>

      <div className="space-y-3">
        {FRAMED_GROUPS.map((g) => (
          <div key={g} className="bg-white rounded-2xl p-4 shadow flex items-center gap-3">
            <div className="text-3xl">{FRAME_GROUP_EMOJI[g]}</div>
            <div className="flex-1 font-bold text-lg">{FRAME_GROUP_LABELS[g]}</div>
            <button
              onClick={() => adjust(g, -1)}
              disabled={frame[g] <= 0}
              className="w-12 h-12 rounded-full bg-gray-100 grid place-items-center disabled:opacity-30 active:scale-90"
              aria-label="הפחת"
            >
              <Minus size={24} strokeWidth={3} />
            </button>
            <div className="font-black text-2xl text-brand-600 min-w-[40px] text-center tabular-nums">
              {frame[g]}
            </div>
            <button
              onClick={() => adjust(g, 1)}
              className="w-12 h-12 rounded-full bg-brand-500 text-white grid place-items-center shadow active:scale-90"
              aria-label="הוסף"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={restoreDefault}
        className="mt-4 w-full bg-white text-gray-700 font-bold py-3 rounded-2xl border-2"
      >
        🔄 חזור לברירות מחדל לפי גיל ({member.age})
      </button>

      <button
        onClick={save}
        disabled={busy}
        className="mt-3 w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 disabled:opacity-50"
      >
        {busy ? 'שומר...' : 'שמור ✓'}
      </button>
    </div>
  );
}
