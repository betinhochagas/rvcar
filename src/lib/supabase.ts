import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard/project/_/settings/api

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação de variáveis de ambiente em runtime
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('[Supabase] VITE_SUPABASE_URL não configurada. Usando modo offline.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('[Supabase] VITE_SUPABASE_ANON_KEY não configurada. Usando modo offline.');
}

// Criar cliente apenas se as credenciais estiverem configuradas
export const supabase = (supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper para verificar se Supabase está disponível
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

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
