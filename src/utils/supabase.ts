import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hcoxjdpqctwfvyxiwxmn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Ja_5xjKfgU2Ij0d1TVW8Jg_BlfhTVWJ';

export const supabase = createClient(supabaseUrl, supabaseKey);
