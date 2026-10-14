import { getDailyQuote } from "@/lib/quotes";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function createQuoteResponse(now: Date, userId?: string) {
  const result = await getDailyQuote(now, userId);

  return Response.json(
    {
      date: now.toISOString().slice(0, 10),
      quoteText: result.quote.quoteText,
      category: result.quote.category,
    },
    {
      headers: {
        "Cache-Control": userId
          ? "private, no-store"
          : `public, max-age=0, s-maxage=${secondsUntilUtcMidnight(now)}, stale-while-revalidate=60`,
      },
    },
  );
}

function secondsUntilUtcMidnight(now: Date): number {
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );

  return Math.max(1, Math.floor((nextUtcMidnight - now.getTime()) / 1000));
}

export async function GET() {
  const now = new Date();
  return createQuoteResponse(now);
}

export async function POST(request: Request) {
  let userId: string | undefined;

  try {
    const body: unknown = await request.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "userId" in body &&
      typeof body.userId === "string" &&
      UUID_PATTERN.test(body.userId)
    ) {
      userId = body.userId.toLowerCase();
    }
  } catch {
    // Missing or invalid IDs fall back to the global quote.
  }

  return createQuoteResponse(new Date(), userId);
}
