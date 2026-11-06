"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./config";

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Lipsesc NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
