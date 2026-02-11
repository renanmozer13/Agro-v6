import { createClient } from '@supabase/supabase-js';

// URL confirmada via print: hoepznsyzdlrzzlrlurp
const SUPABASE_URL = 'https://hoepznsyzdlrzzlrlurp.supabase.co';

// IMPORTANTE: Esta é a chave anon padrão. 
// Se o sistema carregar mas não salvar nada, você deve copiar a sua 'anon' key 
// do painel do Supabase (Settings -> API) e colar abaixo.
const SUPABASE_KEY = 'sb_publishable_Dwes-IIwixCZorkCSTAUdA_ZwWmSV8T';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
