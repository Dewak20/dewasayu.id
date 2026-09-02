import { createClient } from "@supabase/supabase-js";

// Client anon (publik) — AMAN dipakai di browser.
// Hanya untuk: baca undangan yang sudah terbit & kirim RSVP (dibatasi RLS).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseAnon() {
  if (!url || !anonKey) throw new Error("Supabase env belum diset (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).");
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
