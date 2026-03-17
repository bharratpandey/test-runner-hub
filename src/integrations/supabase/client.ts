// src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

console.log("Vite Mode:", import.meta.env.MODE);
console.log("URL from Env:", import.meta.env.VITE_SUPABASE_URL);
console.log("Keys available:", Object.keys(import.meta.env));
// Make sure these match your .env file names EXACTLY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);