// Local IndexedDB — עכשיו רק תמונות. שאר הנתונים נמצאים ב-Supabase.
import Dexie, { type Table } from 'dexie';

export type LocalPhoto = {
  logId: number;     // FK ל-food_logs.id ב-Supabase
  blob: Blob;
  createdAt: number;
};

class HealthyFamilyLocalDB extends Dexie {
  photos!: Table<LocalPhoto, number>;

  constructor() {
    super('healthy-family-local');
    this.version(2).stores({
      photos: 'logId, createdAt',
    });
  }
}

export const localDb = new HealthyFamilyLocalDB();

export const FAMILY_CODE_KEY = 'healthy-family.code';

export function getFamilyCode(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(FAMILY_CODE_KEY);
}

export function setFamilyCode(code: string): void {
  window.localStorage.setItem(FAMILY_CODE_KEY, code);
}

export function clearFamilyCode(): void {
  window.localStorage.removeItem(FAMILY_CODE_KEY);
}
