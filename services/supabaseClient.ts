import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Só inicializa se a URL for válida. Evita tela branca.
export const supabase = (url && url.startsWith('http')) 
  ? createClient(url, key) 
  : null as any;

if (!supabase) {
  console.warn("Aviso: Supabase não inicializado. Verifique VITE_SUPABASE_URL na Vercel.");
}
