import { createClient } from '@supabase/supabase-js';

// URL corrigida com base no seu print: hoepznsyzdlrzzlrlurp
const SUPABASE_URL = 'https://hoepznsyzdlrzzlrlurp.supabase.co';
// IMPORTANTE: Pegue sua 'anon' key no Supabase em Settings -> API e substitua aqui se o erro de conexão persistir
const SUPABASE_KEY = 'sb_publishable_Dwes-IIwixCZorkCSTAUdA_ZwWmSV8T';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
