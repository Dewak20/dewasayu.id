import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client service_role — RAHASIA, hanya boleh dipakai di server (API routes /
// server components). "server-only" akan menggagalkan build bila file ini
// sampai ter-import ke bundle browser.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function supabaseAdmin() {
  if (!url || !serviceKey) throw new Error("Supabase env belum diset (SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
