import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { FamilyMember } from '../data/family';
import { useFamilyStore } from '../store/familyStore';

type Props = {
  members: FamilyMember[];
};

export function WeeklyChart({ members }: Props) {
  const data = members.map((m) => ({
    name: m.name,
    points: useFamilyStore.getState().weeklyPointsFor(m.id),
    color: m.color,
  }));

  return (
    <div className="bg-white rounded-3xl p-4 shadow">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontFamily: 'Heebo', fontWeight: 700, fontSize: 14 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Bar dataKey="points" radius={[12, 12, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
