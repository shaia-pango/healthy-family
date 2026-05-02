import { create } from 'zustand';
import {
  fetchMembers,
  fetchLogs,
  insertLog,
  clearLogsForFamily,
  familyExists,
  createFamily,
  type AppFoodLog,
} from '../lib/familyApi';
import { localDb } from '../db/schema';
import { supabase } from '../lib/supabase';
import { getFamilyCode, setFamilyCode, clearFamilyCode } from '../db/schema';
import type { FamilyMember } from '../data/family';
import type { MealType } from '../data/meals';
import { scoreItems, isInCurrentWeek } from '../lib/scoring';

type State = {
  familyCode: string | null;
  members: FamilyMember[];
  logs: AppFoodLog[];
  loading: boolean;
  error: string | null;
};

type Actions = {
  init: () => Promise<void>;
  enterFamily: (code: string) => Promise<{ created: boolean }>;
  signOut: () => void;
  reload: () => Promise<void>;
  addLog: (input: {
    memberId: string;
    mealType: MealType;
    itemIds: string[];
    photoBlob?: Blob;
    notes?: string;
  }) => Promise<{ pointsEarned: number; logId: number }>;
  clearAllLogs: () => Promise<void>;
  totalPointsFor: (memberId: string) => number;
  weeklyPointsFor: (memberId: string) => number;
  todayLogsFor: (memberId: string) => AppFoodLog[];
};

let realtimeChan: ReturnType<typeof supabase.channel> | null = null;

export const useFamilyStore = create<State & Actions>((set, get) => ({
  familyCode: null,
  members: [],
  logs: [],
  loading: true,
  error: null,

  init: async () => {
    const code = getFamilyCode();
    if (!code) {
      set({ loading: false });
      return;
    }
    set({ familyCode: code });
    await get().reload();
    subscribeRealtime(code, () => get().reload());
  },

  enterFamily: async (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    set({ loading: true, error: null });
    try {
      const exists = await familyExists(code);
      if (!exists) {
        await createFamily(code);
      }
      setFamilyCode(code);
      set({ familyCode: code });
      await get().reload();
      subscribeRealtime(code, () => get().reload());
      return { created: !exists };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'שגיאה לא ידועה';
      set({ error: msg, loading: false });
      throw e;
    }
  },

  signOut: () => {
    clearFamilyCode();
    if (realtimeChan) {
      supabase.removeChannel(realtimeChan);
      realtimeChan = null;
    }
    set({ familyCode: null, members: [], logs: [] });
  },

  reload: async () => {
    const code = get().familyCode;
    if (!code) return;
    set({ loading: true, error: null });
    try {
      const [members, logs] = await Promise.all([fetchMembers(code), fetchLogs(code)]);
      set({ members, logs, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'שגיאה בטעינה';
      set({ error: msg, loading: false });
    }
  },

  addLog: async ({ memberId, mealType, itemIds, photoBlob, notes }) => {
    const code = get().familyCode;
    if (!code) throw new Error('לא מחובר למשפחה');
    const score = scoreItems(itemIds);
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const log = await insertLog({
      familyCode: code,
      memberId,
      date: dateKey,
      ts: now.getTime(),
      mealType,
      itemIds,
      pointsEarned: score.total,
      hasPhoto: !!photoBlob,
      notes,
    });
    if (photoBlob) {
      await localDb.photos.put({ logId: log.id, blob: photoBlob, createdAt: now.getTime() });
    }
    set({ logs: [log, ...get().logs] });
    return { pointsEarned: score.total, logId: log.id };
  },

  clearAllLogs: async () => {
    const code = get().familyCode;
    if (!code) return;
    await clearLogsForFamily(code);
    await localDb.photos.clear();
    set({ logs: [] });
  },

  totalPointsFor: (memberId) =>
    get()
      .logs.filter((l) => l.memberId === memberId)
      .reduce((sum, l) => sum + l.pointsEarned, 0),

  weeklyPointsFor: (memberId) =>
    get()
      .logs.filter((l) => l.memberId === memberId && isInCurrentWeek(l.timestamp))
      .reduce((sum, l) => sum + l.pointsEarned, 0),

  todayLogsFor: (memberId) => {
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return get().logs.filter((l) => l.memberId === memberId && l.date === key);
  },
}));

function subscribeRealtime(code: string, onChange: () => void) {
  if (realtimeChan) {
    supabase.removeChannel(realtimeChan);
  }
  realtimeChan = supabase
    .channel(`family-${code}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'food_logs', filter: `family_code=eq.${code}` },
      onChange,
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'members', filter: `family_code=eq.${code}` },
      onChange,
    )
    .subscribe();
}
