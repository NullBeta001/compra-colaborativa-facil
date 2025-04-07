
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oljanxpqstxvcgkywsyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9samFueHBxc3R4dmNna3l3c3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjE3NzMsImV4cCI6MjA1OTYzNzc3M30.C-IzGLwurGTb7op0oRHKWz4-v4KcLLPIJRZPqjvsTxQ";

// Criar cliente do Supabase com configurações adequadas para autenticação
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
