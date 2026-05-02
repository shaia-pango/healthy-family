import type { PetType } from './pets';
import type { DailyFrame } from './frames';

export type FamilyMember = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  petType: PetType;
  petName: string;
  color: string;
  frame?: DailyFrame;   // אם לא מוגדר, משתמשים בברירת מחדל לפי גיל
};

export const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: 'revital',
    name: 'רויטל',
    age: 40,
    avatar: '👩',
    petType: 'unicorn',
    petName: 'נסיכה',
    color: '#a855f7',
  },
  {
    id: 'shai',
    name: 'שי',
    age: 42,
    avatar: '👨',
    petType: 'robot',
    petName: 'בולט',
    color: '#0ea5e9',
  },
  {
    id: 'achinoam',
    name: 'אחינועם',
    age: 9,
    avatar: '👧',
    petType: 'panda',
    petName: 'פנדי',
    color: '#ec4899',
  },
  {
    id: 'evyatar',
    name: 'אביתר',
    age: 6,
    avatar: '👦',
    petType: 'dragon',
    petName: 'דרקי',
    color: '#22c55e',
  },
];
