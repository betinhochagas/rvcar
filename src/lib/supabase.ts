import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard/project/_/settings/api

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table structure:
// CREATE TABLE vehicles (
//   id TEXT PRIMARY KEY,
//   name TEXT NOT NULL,
//   price TEXT NOT NULL,
//   image TEXT,
//   features TEXT[], -- Array of strings
//   available BOOLEAN DEFAULT true,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
