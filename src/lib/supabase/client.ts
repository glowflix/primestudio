'use client';

import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase n'est pas configuré. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local (local) ou dans Vercel (Production/Preview selon le cas). Important: ces variables sont intégrées au build Next.js, donc après les avoir ajoutées dans Vercel il faut redeployer (nouveau build), sinon l'app continuera à voir 'undefined'."
    );
  }

  supabaseInstance = createBrowserClient(
    url,
    anonKey,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );

  return supabaseInstance;
}
