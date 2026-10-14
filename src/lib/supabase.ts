import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const CACHE_SECONDS = 86_400;
let client: SupabaseClient | undefined;

const cachedFetch: typeof fetch = (input, init) =>
	fetch(input, {
		...init,
		cache: "force-cache",
		next: { ...init?.next, revalidate: CACHE_SECONDS },
	});

export function getSupabaseClient(): SupabaseClient | null {
	const supabaseUrl =
		process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey =
		process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		return null;
	}

	client ??= createClient(supabaseUrl, supabaseAnonKey, {
		global: { fetch: cachedFetch },
	});

	return client;
}