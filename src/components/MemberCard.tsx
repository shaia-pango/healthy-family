import { Link } from 'react-router-dom';
import type { FamilyMember } from '../data/family';
import { PET_EMOJIS, stageForPoints, STAGE_LABELS } from '../data/pets';
import { useFamilyStore } from '../store/familyStore';

type Props = {
  member: FamilyMember;
};

export function MemberCard({ member }: Props) {
  const totalPoints = useFamilyStore((s) => s.totalPointsFor(member.id));
  const weeklyPoints = useFamilyStore((s) => s.weeklyPointsFor(member.id));
  const stage = stageForPoints(totalPoints);
  const petEmoji = PET_EMOJIS[member.petType][stage];

  return (
    <Link
      to={`/pet/${member.id}`}
      className="block bg-white rounded-3xl p-4 shadow-md no-tap-highlight active:scale-95 transition border-4"
      style={{ borderColor: member.color }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full grid place-items-center text-3xl"
          style={{ backgroundColor: `${member.color}22` }}
        >
          {member.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-lg truncate">{member.name}</div>
          <div className="text-sm text-gray-500">
            {STAGE_LABELS[stage]} {member.petName}
          </div>
        </div>
        <div className="text-4xl">{petEmoji}</div>
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <div className="bg-brand-50 text-brand-700 rounded-full px-3 py-1 font-bold">
          🏆 {weeklyPoints} השבוע
        </div>
        <div className="text-gray-500 font-medium">סה״כ {totalPoints}</div>
      </div>
    </Link>
  );
}
