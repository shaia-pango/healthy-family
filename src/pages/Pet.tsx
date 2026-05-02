import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFamilyStore } from '../store/familyStore';
import { PetCanvas } from '../components/PetCanvas';
import { DailyProgressBars } from '../components/DailyProgressBars';
import { FOOD_BY_ID } from '../data/foodCatalog';
import { isInCurrentWeek, summarizeDay, todayKey } from '../lib/scoring';
import { defaultFrameForAge } from '../data/frames';

export function Pet() {
  const { memberId } = useParams<{ memberId: string }>();
  const members = useFamilyStore((s) => s.members);
  const logs = useFamilyStore((s) => s.logs);

  const member = useMemo(
    () => members.find((m) => m.id === memberId),
    [members, memberId],
  );

  const memberLogs = useMemo(
    () => (memberId ? logs.filter((l) => l.memberId === memberId) : []),
    [logs, memberId],
  );

  const totalPoints = useMemo(
    () => memberLogs.reduce((sum, l) => sum + l.pointsEarned, 0),
    [memberLogs],
  );

  const weeklyPoints = useMemo(
    () =>
      memberLogs
        .filter((l) => isInCurrentWeek(l.timestamp))
        .reduce((sum, l) => sum + l.pointsEarned, 0),
    [memberLogs],
  );

  const todayLogs = useMemo(() => {
    const key = todayKey();
    return memberLogs.filter((l) => l.date === key);
  }, [memberLogs]);

  const todayCounts = useMemo(() => {
    const ids = todayLogs.filter((l) => l.kind === 'meal').flatMap((l) => l.itemIds);
    return summarizeDay(ids);
  }, [todayLogs]);

  if (!member) {
    return <div className="p-8 text-center">לא נמצא</div>;
  }

  const frame = member.frame ?? defaultFrameForAge(member.age);

  return (
    <div className="px-4 pt-4 pb-32 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <Link to="/" className="text-brand-600 font-bold">
          ← חזרה
        </Link>
        <Link
          to={`/frame/${member.id}`}
          className="text-sm bg-white px-3 py-1.5 rounded-full font-bold border"
        >
          🎯 ערוך מסגרת
        </Link>
      </div>
      <h2 className="text-2xl font-black mb-1">
        {member.avatar} {member.name}
      </h2>
      <PetCanvas member={member} totalPoints={totalPoints} />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center shadow">
          <div className="text-xs text-gray-500">השבוע</div>
          <div className="text-2xl font-black text-brand-600">{weeklyPoints}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow">
          <div className="text-xs text-gray-500">סה״כ נקודות</div>
          <div className="text-2xl font-black">{totalPoints}</div>
        </div>
      </div>

      <h3 className="font-black text-lg mt-6 mb-2">היום ☀️</h3>
      <DailyProgressBars frame={frame} counts={todayCounts} compact />

      <h3 className="font-black text-lg mt-6 mb-2">מה אכלתי היום?</h3>
      {todayLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
          עדיין כלום היום 🤷
        </div>
      ) : (
        <div className="space-y-2">
          {todayLogs.map((log) => (
            <div
              key={log.id}
              className={`rounded-2xl p-3 flex items-center gap-3 shadow-sm ${
                log.kind === 'bonus' ? 'bg-amber-50 border-2 border-amber-200' : 'bg-white'
              }`}
            >
              <div className={`font-bold text-sm rounded-full px-3 py-1 ${
                log.kind === 'bonus' ? 'bg-amber-200 text-amber-800' : 'bg-brand-100 text-brand-700'
              }`}>
                {log.mealType}
              </div>
              <div className="flex-1 flex flex-wrap gap-1 text-2xl">
                {log.kind === 'bonus' ? (
                  <span>{log.bonusEmoji} {log.bonusLabel && <span className="text-sm font-bold">{log.bonusLabel}</span>}</span>
                ) : (
                  log.itemIds.map((id, i) => <span key={i}>{FOOD_BY_ID[id]?.emoji}</span>)
                )}
              </div>
              <div className={`font-black ${
                log.pointsEarned >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {log.pointsEarned >= 0 ? '+' : ''}{log.pointsEarned}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
