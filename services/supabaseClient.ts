
import { createClient } from '@supabase/supabase-js';

// Usando variáveis de ambiente para maior segurança em produção
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("AVISO: Credenciais do Supabase não encontradas. Algumas funcionalidades podem não funcionar.");
}

// Initialize with placeholders if missing to avoid crash at module load
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  SUPABASE_KEY || 'placeholder'
);
