import { useFamilyStore } from '../store/familyStore';
import { WeeklyChart } from '../components/WeeklyChart';

const MEDALS = ['🥇', '🥈', '🥉', '🎖️'];

export function Leaderboard() {
  const members = useFamilyStore((s) => s.members);
  const weeklyPointsFor = useFamilyStore((s) => s.weeklyPointsFor);

  const ranked = [...members]
    .map((m) => ({ member: m, points: weeklyPointsFor(m.id) }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="px-4 pt-6 pb-32 max-w-2xl mx-auto">
      <h2 className="text-2xl font-black text-center mb-4">🏆 לוח השבוע 🏆</h2>

      <WeeklyChart members={members} />

      <div className="mt-6 space-y-3">
        {ranked.map((row, i) => (
          <div
            key={row.member.id}
            className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow"
            style={{ borderInlineStart: `8px solid ${row.member.color}` }}
          >
            <div className="text-4xl">{MEDALS[i] ?? '🎖️'}</div>
            <div className="text-3xl">{row.member.avatar}</div>
            <div className="flex-1 font-black text-lg">{row.member.name}</div>
            <div className="text-2xl font-black text-brand-600">{row.points}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-bl from-brand-100 to-orange-50 rounded-3xl p-5 border-2 border-orange-200">
        <div className="font-black text-lg mb-1">🎯 אתגר השבוע</div>
        <p className="text-gray-700">
          כל אחד מהמשפחה אוכל לפחות פרי אחד ביום. בסוף השבוע — סיכום ופרס משפחתי!
        </p>
      </div>
    </div>
  );
}
