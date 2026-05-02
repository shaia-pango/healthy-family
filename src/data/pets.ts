export type PetType = 'dragon' | 'unicorn' | 'panda' | 'robot' | 'alien';

export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult';

export const PET_STAGES: PetStage[] = ['egg', 'baby', 'child', 'teen', 'adult'];

export const STAGE_THRESHOLDS: Record<PetStage, number> = {
  egg: 0,
  baby: 100,
  child: 300,
  teen: 700,
  adult: 1500,
};

export const STAGE_LABELS: Record<PetStage, string> = {
  egg: 'ביצה',
  baby: 'תינוק',
  child: 'ילד',
  teen: 'נער',
  adult: 'בוגר',
};

export const PET_LABELS: Record<PetType, string> = {
  dragon: 'דרקון',
  unicorn: 'חד-קרן',
  panda: 'פנדה',
  robot: 'רובוט-חיה',
  alien: 'חייזר חמוד',
};

export const PET_EMOJIS: Record<PetType, Record<PetStage, string>> = {
  dragon: {
    egg: '🥚',
    baby: '🐲',
    child: '🦎',
    teen: '🐉',
    adult: '🐲🔥',
  },
  unicorn: {
    egg: '🥚',
    baby: '🦄',
    child: '🦄',
    teen: '🦄✨',
    adult: '🦄🌈',
  },
  panda: {
    egg: '🥚',
    baby: '🐼',
    child: '🐼',
    teen: '🐼💚',
    adult: '🐼🎋',
  },
  robot: {
    egg: '🥚',
    baby: '🤖',
    child: '🤖',
    teen: '🤖⚡',
    adult: '🤖🚀',
  },
  alien: {
    egg: '🥚',
    baby: '👽',
    child: '👽',
    teen: '👽🛸',
    adult: '👽🌌',
  },
};

export function stageForPoints(points: number): PetStage {
  if (points >= STAGE_THRESHOLDS.adult) return 'adult';
  if (points >= STAGE_THRESHOLDS.teen) return 'teen';
  if (points >= STAGE_THRESHOLDS.child) return 'child';
  if (points >= STAGE_THRESHOLDS.baby) return 'baby';
  return 'egg';
}

export function pointsToNextStage(points: number): { next: PetStage | null; remaining: number } {
  const order = PET_STAGES;
  for (const stage of order) {
    if (points < STAGE_THRESHOLDS[stage]) {
      return { next: stage, remaining: STAGE_THRESHOLDS[stage] - points };
    }
  }
  return { next: null, remaining: 0 };
}
