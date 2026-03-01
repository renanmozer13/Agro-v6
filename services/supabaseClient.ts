import { createClient } from '@supabase/supabase-js';

// Buscamos as chaves com segurança
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Criamos o cliente apenas se as chaves existirem, para evitar a TELA BRANCA
export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null as any;

if (!supabase) {
  console.warn("Aviso: Supabase não inicializado. Verifique as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.");
}
