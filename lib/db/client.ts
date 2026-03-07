// ============================================================
// lib/db/client.ts
// Supabase client initialization
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const db = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: (url, options = {}) => {
            // Abort any request that takes longer than 10 seconds
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10_000);
            return fetch(url, {
                ...options,
                signal: controller.signal,
            }).finally(() => clearTimeout(timeout));
        },
    },
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
    },
});
