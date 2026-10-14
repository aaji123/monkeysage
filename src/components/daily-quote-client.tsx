"use client";

import { useEffect, useState } from "react";
import type { DailyQuote } from "@/lib/quotes";
import { ShareButton } from "@/components/share-button";

const USER_ID_KEY = "monkey_sage_user_id";
const USER_ID_COOKIE = "monkey_sage_user_id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function syncUserIdCookie(userId: string): void {
  document.cookie = `${USER_ID_COOKIE}=${encodeURIComponent(userId)}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

function getOrCreateUserId(): string | null {
  try {
    const storedUserId = window.localStorage.getItem(USER_ID_KEY);

    if (storedUserId && UUID_PATTERN.test(storedUserId)) {
      const userId = storedUserId.toLowerCase();
      syncUserIdCookie(userId);
      return userId;
    }

    const userId = window.crypto.randomUUID();
    window.localStorage.setItem(USER_ID_KEY, userId);
    syncUserIdCookie(userId);
    return userId;
  } catch {
    return null;
  }
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function DailyQuoteClient({
  initialQuote,
  initialDate,
}: {
  initialQuote: DailyQuote;
  initialDate: string;
}) {
  const [quote, setQuote] = useState(initialQuote);
  const [date, setDate] = useState(initialDate);

  useEffect(() => {
    let active = true;
    let currentDate = utcDateKey(new Date());
    let midnightTimer = 0;

    const refreshForCurrentDate = async () => {
      const userId = getOrCreateUserId();
      if (!userId) return;

      const requestedDate = utcDateKey(new Date());

      try {
        const response = await fetch("/api/daily-quote", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) return;

        const result: unknown = await response.json();
        if (
          active &&
          typeof result === "object" &&
          result !== null &&
          "date" in result &&
          result.date === requestedDate &&
          "quoteText" in result &&
          typeof result.quoteText === "string" &&
          "category" in result &&
          typeof result.category === "string"
        ) {
          setQuote({ quoteText: result.quoteText, category: result.category });
          setDate(result.date);
        }
      } catch {
        // Keep the server-rendered quote if storage or networking fails.
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
        <div className="scroll-roller scroll-roller-top" aria-hidden="true" />
        <div className="scroll-paper">
          <blockquote className="wisdom-quote" id="daily-quote-text">
            &ldquo;{quote.quoteText}&rdquo;
          </blockquote>
          <figcaption className="wisdom-category" id="daily-quote-category">
            {quote.category}
          </figcaption>
          <time className="wisdom-date" dateTime={date}>
            {formatDate(date)}
          </time>
        </div>
        <div className="scroll-roller scroll-roller-bottom" aria-hidden="true" />
      </figure>
      <ShareButton quoteText={quote.quoteText} />
    </>
  );
}
