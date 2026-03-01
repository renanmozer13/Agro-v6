import { createClient } from '@supabase/supabase-js';

// Usando variáveis de ambiente para segurança total
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO: Credenciais do Supabase não encontradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
