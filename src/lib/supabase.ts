import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// כדי שהאפליקציה תעלה גם בלי env vars (למשל לצילומי מסך מקומיים),
// אנחנו יוצרים client עם placeholder. כל קריאה אמיתית תיכשל ברורה.
export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  { auth: { persistSession: false } },
);

export type DbMember = {
  id: string;
  family_code: string;
  name: string;
  age: number;
  avatar: string;
  pet_type: string;
  pet_name: string;
  color: string;
};

export type DbFoodLog = {
  id: number;
  family_code: string;
  member_id: string;
  date: string;
  ts: number;
  meal_type: string;
  item_ids: string[];
  points_earned: number;
  has_photo: boolean;
  notes: string | null;
};
