export type BonusTemplate = {
  id?: number;
  emoji: string;
  label: string;
  points: number;
};

export const DEFAULT_BONUS_TEMPLATES: BonusTemplate[] = [
  { emoji: '🌟', label: 'טעמתי משהו חדש', points: 20 },
  { emoji: '💪', label: 'התגברתי על פיתוי', points: 25 },
  { emoji: '💧', label: 'שתיתי 8 כוסות מים', points: 20 },
  { emoji: '🥗', label: 'בחרתי בריא במסעדה', points: 15 },
  { emoji: '🚶', label: 'פעילות גופנית 30 דק׳', points: 15 },
  { emoji: '🥦', label: 'אכלתי משהו שלא אהבתי', points: 25 },
  { emoji: '🧘', label: 'אכלתי לאט ובהנאה', points: 10 },
];
