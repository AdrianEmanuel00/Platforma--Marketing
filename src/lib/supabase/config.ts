export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Login-ul e oprit până îl pornim explicit (AUTH_ENABLED=true) și avem cheile Supabase.
 * Până atunci aplicația se deschide direct, iar datele stau în browser.
 */
export const authEnabled = process.env.AUTH_ENABLED === "true" && !!supabaseUrl && !!supabaseAnonKey;
