import { getDailyQuote } from "@/lib/quotes";

export async function GET() {
  const now = new Date();
  const result = await getDailyQuote(now);

  if (result.kind !== "quote") {
    return Response.json(
      {
        error:
          result.kind === "empty"
            ? "The quote collection is empty."
            : "Today's wisdom is temporarily unavailable.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  const secondsUntilUtcMidnight = Math.max(
    1,
    Math.floor((nextUtcMidnight - now.getTime()) / 1000),
  );

  return Response.json(
    {
      date: now.toISOString().slice(0, 10),
      quoteText: result.quote.quoteText,
      category: result.quote.category,
    },
    {
      headers: {
        "Cache-Control": `public, max-age=0, s-maxage=${secondsUntilUtcMidnight}, stale-while-revalidate=60`,
      },
    },
  );
}
