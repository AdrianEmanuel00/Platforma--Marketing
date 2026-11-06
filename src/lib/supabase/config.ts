export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Fără chei Supabase aplicația rulează în modul demo, pe datele din src/lib/demo-data.ts. */
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;
