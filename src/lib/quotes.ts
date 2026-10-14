import "server-only";
import { getQuoteIndex } from "@/lib/quote-sequence";
import { getSupabaseClient } from "@/lib/supabase";

export type DailyQuote = {
  quoteText: string;
  category: string;
};

export type DailyQuoteResult = { kind: "quote"; quote: DailyQuote };

const FALLBACK_QUOTE: DailyQuote = {
  quoteText: "One monkey, one banana, one day. Simple life good life.",
  category: "General",
};

// Keep removed quotes out of both the server-rendered quote and the client refresh
// while older database rows are still present.
const REMOVED_QUOTE_TEXT = "Many monkey chase butterfly. One monkey watch flower. Butterfly come to flower.";

const LAUNCH_DATE = "2026-10-14";
const MILLISECONDS_PER_DAY = 86_400_000;

export async function getDailyQuote(
  now: Date = new Date(),
  userId?: string,
): Promise<DailyQuoteResult> {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.warn("[quotes] Supabase server configuration is missing; using fallback.");
      return { kind: "quote", quote: FALLBACK_QUOTE };
    }

    const { count, error: countError } = await supabase
      .from("quotes")
      .select("id", { count: "exact" })
      .neq("quote_text", REMOVED_QUOTE_TEXT)
      .limit(1);

    if (countError) {
      console.warn("[quotes] Could not read the quote count; using fallback.", {
        code: countError.code,
        message: countError.message,
      });
      return { kind: "quote", quote: FALLBACK_QUOTE };
    }

    if (count === null) {
      console.warn("[quotes] Supabase returned no exact quote count; using fallback.");
      return { kind: "quote", quote: FALLBACK_QUOTE };
    }

    if (count === 0) {
      console.warn("[quotes] Quote table is empty; using fallback.");
      return { kind: "quote", quote: FALLBACK_QUOTE };
    }

    const quoteIndex = getQuoteIndex(daysSinceLaunch(now), count, userId);

    if (quoteIndex === null) {
      return { kind: "quote", quote: FALLBACK_QUOTE };
    }

    const { data, error } = await supabase
      .from("quotes")
      .select("quote_text, category")
      .neq("quote_text", REMOVED_QUOTE_TEXT)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(quoteIndex, quoteIndex)
      .maybeSingle();

    if (error || !data) {
      console.warn("[quotes] Could not read today's quote; using fallback.", error?.message);
      return { kind: "quote", quote: FALLBACK_QUOTE };
    }

    return {
      kind: "quote",
      quote: {
        quoteText: data.quote_text,
        category: data.category,
      },
    };
  } catch (error) {
    console.warn(
      "[quotes] Daily quote lookup failed; using fallback.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return { kind: "quote", quote: FALLBACK_QUOTE };
  }
}

function daysSinceLaunch(now: Date): number {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const launchDay = Date.parse(`${LAUNCH_DATE}T00:00:00.000Z`);

  return Math.max(0, Math.floor((today - launchDay) / MILLISECONDS_PER_DAY));
}
