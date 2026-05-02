import { create } from 'zustand';
import {
  fetchMembers,
  fetchLogs,
  insertMealLog,
  insertBonusLog,
  clearLogsForFamily,
  familyExists,
  createFamily,
  updateMemberFrame,
  fetchBonusTemplates,
  addBonusTemplate,
  deleteBonusTemplate,
  type AppFoodLog,
} from '../lib/familyApi';
import { localDb } from '../db/schema';
import { supabase } from '../lib/supabase';
import { getFamilyCode, setFamilyCode, clearFamilyCode } from '../db/schema';
import type { FamilyMember } from '../data/family';
import type { MealType } from '../data/meals';
import type { DailyFrame } from '../data/frames';
import { defaultFrameForAge } from '../data/frames';
import type { BonusTemplate } from '../data/bonusTemplates';
import { isInCurrentWeek, scoreMeal, summarizeDay, todayKey } from '../lib/scoring';

type State = {
  familyCode: string | null;
  members: FamilyMember[];
  logs: AppFoodLog[];
  bonusTemplates: BonusTemplate[];
  loading: boolean;
  error: string | null;
};

type Actions = {
  init: () => Promise<void>;
  enterFamily: (code: string) => Promise<{ created: boolean }>;
  signOut: () => void;
  reload: () => Promise<void>;

  addMealLog: (input: {
    memberId: string;
    mealType: MealType;
    itemIds: string[];
    photoBlob?: Blob;
    notes?: string;
  }) => Promise<{ pointsEarned: number; logId: number; categoryBonuses: number; fullDayBonus: number }>;

  addBonus: (input: {
    memberId: string;
    emoji: string;
    label: string;
    points: number;
  }) => Promise<{ pointsEarned: number; logId: number }>;

  saveMemberFrame: (memberId: string, frame: DailyFrame) => Promise<void>;
  frameFor: (memberId: string) => DailyFrame;

  addTemplate: (template: BonusTemplate) => Promise<void>;
  removeTemplate: (templateId: number) => Promise<void>;

  clearAllLogs: () => Promise<void>;

  totalPointsFor: (memberId: string) => number;
  weeklyPointsFor: (memberId: string) => number;
  todayLogsFor: (memberId: string) => AppFoodLog[];
  todayMealItemsFor: (memberId: string) => string[];
  todayGroupCountsFor: (memberId: string) => Record<string, number>;
};

let realtimeChan: ReturnType<typeof supabase.channel> | null = null;

export const useFamilyStore = create<State & Actions>((set, get) => ({
  familyCode: null,
  members: [],
  logs: [],
  bonusTemplates: [],
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
    set({ familyCode: null, members: [], logs: [], bonusTemplates: [] });
  },

  reload: async () => {
    const code = get().familyCode;
    if (!code) return;
    set({ loading: true, error: null });
    try {
      const [members, logs] = await Promise.all([fetchMembers(code), fetchLogs(code)]);
      set({ members, logs, loading: false });
      // bonus templates are optional — if the table hasn't been migrated yet, just skip
      try {
        const templates = await fetchBonusTemplates(code);
        set({ bonusTemplates: templates });
      } catch (tplErr) {
        console.warn('Bonus templates not available (run SETUP.sql to enable):', tplErr);
        set({ bonusTemplates: [] });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'שגיאה בטעינה';
      set({ error: msg, loading: false });
    }
  },

  addMealLog: async ({ memberId, mealType, itemIds, photoBlob, notes }) => {
    const code = get().familyCode;
    if (!code) throw new Error('לא מחובר למשפחה');
    const frame = get().frameFor(memberId);
    const todayItems = get().todayMealItemsFor(memberId);
    const dayCounts = summarizeDay(todayItems);
    const fullDayAlreadyAwarded = isFullDay(dayCounts, frame);
    const score = scoreMeal(itemIds, frame, {
      groupCounts: dayCounts,
      fullDayAlreadyAwarded,
    });

    const now = new Date();
    const dateKey = todayKey(now);
    const log = await insertMealLog({
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
    return {
      pointsEarned: score.total,
      logId: log.id,
      categoryBonuses: score.categoryBonuses,
      fullDayBonus: score.fullDayBonus,
    };
  },

  addBonus: async ({ memberId, emoji, label, points }) => {
    const code = get().familyCode;
    if (!code) throw new Error('לא מחובר למשפחה');
    const log = await insertBonusLog({ familyCode: code, memberId, emoji, label, points });
    set({ logs: [log, ...get().logs] });
    return { pointsEarned: points, logId: log.id };
  },

  saveMemberFrame: async (memberId, frame) => {
    const code = get().familyCode;
    if (!code) return;
    await updateMemberFrame(code, memberId, frame);
    set({
      members: get().members.map((m) =>
        m.id === memberId ? { ...m, frame } : m,
      ),
    });
  },

  frameFor: (memberId) => {
    const m = get().members.find((mm) => mm.id === memberId);
    if (!m) return defaultFrameForAge(8);
    return m.frame ?? defaultFrameForAge(m.age);
  },

  addTemplate: async (template) => {
    const code = get().familyCode;
    if (!code) return;
    const created = await addBonusTemplate(code, template);
    set({ bonusTemplates: [...get().bonusTemplates, created] });
  },

  removeTemplate: async (templateId) => {
    const code = get().familyCode;
    if (!code) return;
    await deleteBonusTemplate(code, templateId);
    set({ bonusTemplates: get().bonusTemplates.filter((t) => t.id !== templateId) });
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
    const key = todayKey();
    return get().logs.filter((l) => l.memberId === memberId && l.date === key);
  },

  todayMealItemsFor: (memberId) => {
    const key = todayKey();
    return get()
      .logs.filter((l) => l.memberId === memberId && l.date === key && l.kind === 'meal')
      .flatMap((l) => l.itemIds);
  },

  todayGroupCountsFor: (memberId) => {
    return summarizeDay(get().todayMealItemsFor(memberId));
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
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bonus_templates', filter: `family_code=eq.${code}` },
      onChange,
    )
    .subscribe();
}

function isFullDay(counts: Record<string, number>, frame: DailyFrame): boolean {
  return Object.entries(frame).every(([g, t]) => (counts[g] ?? 0) >= t);
}
