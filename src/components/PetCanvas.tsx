import { motion } from 'framer-motion';
import type { FamilyMember } from '../data/family';
import { PET_EMOJIS, stageForPoints, STAGE_LABELS, pointsToNextStage } from '../data/pets';

type Props = {
  member: FamilyMember;
  totalPoints: number;
};

export function PetCanvas({ member, totalPoints }: Props) {
  const stage = stageForPoints(totalPoints);
  const emoji = PET_EMOJIS[member.petType][stage];
  const { next, remaining } = pointsToNextStage(totalPoints);

  return (
    <div className="relative">
      <div
        className="rounded-[2.5rem] p-8 grid place-items-center min-h-[280px]"
        style={{ background: `linear-gradient(160deg, ${member.color}33, ${member.color}11)` }}
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[10rem] leading-none drop-shadow-xl"
        >
          {emoji}
        </motion.div>
      </div>

      <div className="mt-4 bg-white rounded-2xl p-4 shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="font-black text-xl">{member.petName}</div>
          <div className="text-sm bg-brand-100 text-brand-700 rounded-full px-3 py-1 font-bold">
            {STAGE_LABELS[stage]}
          </div>
        </div>
        {next ? (
          <div className="text-sm text-gray-600">
            עוד <span className="font-bold text-brand-600">{remaining} נקודות</span> ל
            {STAGE_LABELS[next]}!
          </div>
        ) : (
          <div className="text-sm text-emerald-600 font-bold">🎉 הגעתם לשלב הסופי!</div>
        )}
      </div>
    </div>
  );
}
