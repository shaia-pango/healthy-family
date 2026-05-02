import { supabase, type DbMember, type DbFoodLog } from './supabase';
import type { FamilyMember } from '../data/family';
import { INITIAL_FAMILY } from '../data/family';
import type { MealType } from '../data/meals';
import type { DailyFrame } from '../data/frames';
import { defaultFrameForAge } from '../data/frames';
import { DEFAULT_BONUS_TEMPLATES, type BonusTemplate } from '../data/bonusTemplates';

export type LogKind = 'meal' | 'bonus';

export type AppFoodLog = {
  id: number;
  memberId: string;
  date: string;
  timestamp: number;
  mealType: MealType | 'בונוס';
  itemIds: string[];
  pointsEarned: number;
  hasPhoto: boolean;
  notes: string | null;
  kind: LogKind;
  bonusLabel: string | null;
  bonusEmoji: string | null;
};

export async function familyExists(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('families')
    .select('code')
    .eq('code', code)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function createFamily(code: string, name = 'משפחה'): Promise<void> {
  const { error: famErr } = await supabase
    .from('families')
    .insert({ code, name });
  if (famErr) throw famErr;

  const seed = INITIAL_FAMILY.map((m) => ({
    id: m.id,
    family_code: code,
    name: m.name,
    age: m.age,
    avatar: m.avatar,
    pet_type: m.petType,
    pet_name: m.petName,
    color: m.color,
    frame: defaultFrameForAge(m.age),
  }));
  const { error: memErr } = await supabase.from('members').insert(seed);
  if (memErr) throw memErr;

  const tplSeed = DEFAULT_BONUS_TEMPLATES.map((t) => ({
    family_code: code,
    emoji: t.emoji,
    label: t.label,
    points: t.points,
    is_default: true,
  }));
  const { error: tplErr } = await supabase.from('bonus_templates').insert(tplSeed);
  if (tplErr) throw tplErr;
}

export async function fetchMembers(code: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('family_code', code)
    .order('name');
  if (error) throw error;
  return (data as DbMember[]).map(dbMemberToApp);
}

export async function updateMemberFrame(
  code: string,
  memberId: string,
  frame: DailyFrame,
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ frame })
    .eq('family_code', code)
    .eq('id', memberId);
  if (error) throw error;
}

export async function fetchLogs(code: string): Promise<AppFoodLog[]> {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('family_code', code)
    .order('ts', { ascending: false });
  if (error) throw error;
  return (data as DbFoodLog[]).map(dbLogToApp);
}

export async function insertMealLog(input: {
  familyCode: string;
  memberId: string;
  date: string;
  ts: number;
  mealType: MealType;
  itemIds: string[];
  pointsEarned: number;
  hasPhoto: boolean;
  notes?: string;
}): Promise<AppFoodLog> {
  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      family_code: input.familyCode,
      member_id: input.memberId,
      date: input.date,
      ts: input.ts,
      meal_type: input.mealType,
      item_ids: input.itemIds,
      points_earned: input.pointsEarned,
      has_photo: input.hasPhoto,
      notes: input.notes ?? null,
      kind: 'meal',
    })
    .select('*')
    .single();
  if (error) throw error;
  return dbLogToApp(data as DbFoodLog);
}

export async function insertBonusLog(input: {
  familyCode: string;
  memberId: string;
  emoji: string;
  label: string;
  points: number;
}): Promise<AppFoodLog> {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      family_code: input.familyCode,
      member_id: input.memberId,
      date,
      ts: now.getTime(),
      meal_type: 'בונוס',
      item_ids: [],
      points_earned: input.points,
      has_photo: false,
      kind: 'bonus',
      bonus_emoji: input.emoji,
      bonus_label: input.label,
    })
    .select('*')
    .single();
  if (error) throw error;
  return dbLogToApp(data as DbFoodLog);
}

export async function deleteLog(code: string, logId: number): Promise<void> {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('family_code', code)
    .eq('id', logId);
  if (error) throw error;
}

export async function clearLogsForFamily(code: string): Promise<void> {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('family_code', code);
  if (error) throw error;
}

export async function fetchBonusTemplates(code: string): Promise<BonusTemplate[]> {
  const { data, error } = await supabase
    .from('bonus_templates')
    .select('*')
    .eq('family_code', code)
    .order('id');
  if (error) throw error;
  return (data as Array<{ id: number; emoji: string; label: string; points: number }>).map((t) => ({
    id: t.id,
    emoji: t.emoji,
    label: t.label,
    points: t.points,
  }));
}

export async function addBonusTemplate(
  code: string,
  template: BonusTemplate,
): Promise<BonusTemplate> {
  const { data, error } = await supabase
    .from('bonus_templates')
    .insert({
      family_code: code,
      emoji: template.emoji,
      label: template.label,
      points: template.points,
      is_default: false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    emoji: data.emoji,
    label: data.label,
    points: data.points,
  };
}

export async function deleteBonusTemplate(code: string, templateId: number): Promise<void> {
  const { error } = await supabase
    .from('bonus_templates')
    .delete()
    .eq('family_code', code)
    .eq('id', templateId);
  if (error) throw error;
}

function dbMemberToApp(m: DbMember & { frame?: DailyFrame | null }): FamilyMember {
  return {
    id: m.id,
    name: m.name,
    age: m.age,
    avatar: m.avatar,
    petType: m.pet_type as FamilyMember['petType'],
    petName: m.pet_name,
    color: m.color,
    frame: m.frame ?? undefined,
  };
}

function dbLogToApp(l: DbFoodLog & { kind?: string; bonus_label?: string | null; bonus_emoji?: string | null }): AppFoodLog {
  return {
    id: l.id,
    memberId: l.member_id,
    date: l.date,
    timestamp: l.ts,
    mealType: l.meal_type as MealType | 'בונוס',
    itemIds: l.item_ids,
    pointsEarned: l.points_earned,
    hasPhoto: l.has_photo,
    notes: l.notes,
    kind: (l.kind as LogKind) ?? 'meal',
    bonusLabel: l.bonus_label ?? null,
    bonusEmoji: l.bonus_emoji ?? null,
  };
}
