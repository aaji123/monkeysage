"use client";

import { useEffect, useState } from "react";
import type { DailyQuote } from "@/lib/quotes";
import { ShareButton } from "@/components/share-button";

const USER_ID_KEY = "monkey_sage_user_id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getOrCreateUserId(): string | null {
  try {
    const storedUserId = window.localStorage.getItem(USER_ID_KEY);

    if (storedUserId && UUID_PATTERN.test(storedUserId)) {
      return storedUserId.toLowerCase();
    }

    const userId = window.crypto.randomUUID();
    window.localStorage.setItem(USER_ID_KEY, userId);
    return userId;
  } catch {
    return null;
  }
}

async function fetchUserQuote(userId: string): Promise<DailyQuote | null> {
  const response = await fetch("/api/daily-quote", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    return null;
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("quoteText" in result) ||
    typeof result.quoteText !== "string" ||
    !("category" in result) ||
    typeof result.category !== "string"
  ) {
    return null;
  }

  return { quoteText: result.quoteText, category: result.category };
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DailyQuoteClient({ initialQuote }: { initialQuote: DailyQuote }) {
  const [quote, setQuote] = useState(initialQuote);

  useEffect(() => {
    let active = true;
    let currentDate = utcDateKey(new Date());
    let midnightTimer = 0;

    const refreshForCurrentDate = async () => {
      const userId = getOrCreateUserId();

      if (!userId) {
        return;
      }

      try {
        const userQuote = await fetchUserQuote(userId);

        if (active && userQuote) {
          setQuote(userQuote);
        }
      } catch {
        // Keep the server-rendered global quote if storage or networking fails.
      }
    };

    const scheduleMidnightRefresh = () => {
      window.clearTimeout(midnightTimer);
      const now = new Date();
      const nextMidnight = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
      );

      midnightTimer = window.setTimeout(() => {
        currentDate = utcDateKey(new Date());
        void refreshForCurrentDate();
        scheduleMidnightRefresh();
      }, Math.max(1_000, nextMidnight - now.getTime() + 100));
    };

    const handleVisibilityChange = () => {
      const today = utcDateKey(new Date());

      if (document.visibilityState === "visible" && today !== currentDate) {
        currentDate = today;
        void refreshForCurrentDate();
        scheduleMidnightRefresh();
      }
    };

    void refreshForCurrentDate();
    scheduleMidnightRefresh();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <figure className="wisdom-scroll">
        <blockquote className="wisdom-quote">&ldquo;{quote.quoteText}&rdquo;</blockquote>
        <figcaption className="wisdom-category">{quote.category}</figcaption>
      </figure>
      <ShareButton quoteText={quote.quoteText} />
    </>
  );
}
