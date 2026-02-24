import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://alkkuxtzrhqkukynpwil.supabase.co';
const SUPABASE_KEY = 'sb_publishable_h3pO0JD6OhZ3HOHdPMDrdA_D6pGIJfp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);