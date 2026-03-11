
import { createClient } from '@supabase/supabase-js';

// Configurações padrão (fallback) caso as variáveis de ambiente não estejam definidas
const DEFAULT_URL = 'https://hoepznsyzdlrzzlrlurp.supabase.co';
const DEFAULT_KEY = 'sb_publishable_ne5Px1teeHCX7KS59_qKzA_J8hucLEg';

// Função para validar se uma string é uma URL válida do Supabase
const isValidUrl = (url: any): url is string => {
  return typeof url === 'string' && url.startsWith('http');
};

// Tenta obter das variáveis de ambiente do Vite ou do Process
const envUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined);
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined);

// Garante que a URL seja válida, caso contrário usa o fallback
const SUPABASE_URL = isValidUrl(envUrl) ? envUrl : DEFAULT_URL;
const SUPABASE_KEY = (envKey && envKey !== 'undefined' && envKey !== '') ? envKey : DEFAULT_KEY;

if (!isValidUrl(envUrl) || !envKey) {
    console.warn("AVISO: Credenciais do Supabase não encontradas ou inválidas no ambiente. Usando fallbacks de segurança.");
}

// Inicializa o cliente garantindo que a URL seja válida
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
