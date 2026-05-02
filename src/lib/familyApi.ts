import { supabase, type DbMember, type DbFoodLog } from './supabase';
import type { FamilyMember } from '../data/family';
import { INITIAL_FAMILY } from '../data/family';
import type { MealType } from '../data/meals';

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
  }));
  const { error: memErr } = await supabase.from('members').insert(seed);
  if (memErr) throw memErr;
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

export async function fetchLogs(code: string): Promise<AppFoodLog[]> {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('family_code', code)
    .order('ts', { ascending: false });
  if (error) throw error;
  return (data as DbFoodLog[]).map(dbLogToApp);
}

export async function insertLog(input: {
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
    })
    .select('*')
    .single();
  if (error) throw error;
  return dbLogToApp(data as DbFoodLog);
}

export async function clearLogsForFamily(code: string): Promise<void> {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('family_code', code);
  if (error) throw error;
}

export type AppFoodLog = {
  id: number;
  memberId: string;
  date: string;
  timestamp: number;
  mealType: MealType;
  itemIds: string[];
  pointsEarned: number;
  hasPhoto: boolean;
  notes: string | null;
};

function dbMemberToApp(m: DbMember): FamilyMember {
  return {
    id: m.id,
    name: m.name,
    age: m.age,
    avatar: m.avatar,
    petType: m.pet_type as FamilyMember['petType'],
    petName: m.pet_name,
    color: m.color,
  };
}

function dbLogToApp(l: DbFoodLog): AppFoodLog {
  return {
    id: l.id,
    memberId: l.member_id,
    date: l.date,
    timestamp: l.ts,
    mealType: l.meal_type as MealType,
    itemIds: l.item_ids,
    pointsEarned: l.points_earned,
    hasPhoto: l.has_photo,
    notes: l.notes,
  };
}
