import { useParams, Link } from 'react-router-dom';
import { useFamilyStore } from '../store/familyStore';
import { PetCanvas } from '../components/PetCanvas';
import { FOOD_BY_ID } from '../data/foodCatalog';

export function Pet() {
  const { memberId } = useParams<{ memberId: string }>();
  const member = useFamilyStore((s) => s.members.find((m) => m.id === memberId));
  const todayLogs = useFamilyStore((s) => (memberId ? s.todayLogsFor(memberId) : []));
  const totalPoints = useFamilyStore((s) => (memberId ? s.totalPointsFor(memberId) : 0));
  const weeklyPoints = useFamilyStore((s) => (memberId ? s.weeklyPointsFor(memberId) : 0));

  if (!member) {
    return <div className="p-8 text-center">לא נמצא</div>;
  }

  return (
    <div className="px-4 pt-4 pb-32 max-w-2xl mx-auto">
      <Link to="/" className="text-brand-600 font-bold mb-3 inline-block">
        ← חזרה
      </Link>
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

      <h3 className="font-black text-lg mt-6 mb-2">מה אכלתי היום?</h3>
      {todayLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
          עדיין כלום היום 🤷
        </div>
      ) : (
        <div className="space-y-2">
          {todayLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
              <div className="font-bold text-sm bg-brand-100 text-brand-700 rounded-full px-3 py-1">
                {log.mealType}
              </div>
              <div className="flex-1 flex flex-wrap gap-1 text-2xl">
                {log.itemIds.map((id, i) => (
                  <span key={i}>{FOOD_BY_ID[id]?.emoji}</span>
                ))}
              </div>
              <div className="font-black text-emerald-600">+{log.pointsEarned}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
