import { createClient } from "@supabase/supabase-js";

// Vite looks for environment variables inside import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Check your Vercel Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
