
import { createClient } from '@supabase/supabase-js';

// Novas credenciais fornecidas pelo usuário
const SUPABASE_URL = 'https://rigohljqktbabygidemt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Dwes-IIwixCZorkCSTAUdA_ZwWmSV8T';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
