import { Suspense } from "react";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { DailyQuoteClient } from "@/components/daily-quote-client";
import { getDailyQuote } from "@/lib/quotes";

const USER_ID_COOKIE = "monkey_sage_user_id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function Home() {
  return (
    <Suspense fallback={<WisdomLoading />}>
      <DailyWisdom />
    </Suspense>
  );
}

async function DailyWisdom() {
  await io();
  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get(USER_ID_COOKIE)?.value;
  const userId = cookieUserId && UUID_PATTERN.test(cookieUserId)
    ? cookieUserId.toLowerCase()
    : undefined;
  const result = await getDailyQuote(undefined, userId);
  const date = new Date().toISOString().slice(0, 10);

  return (
    <main className="sage-page">
      <section className="sage-content" aria-labelledby="page-title">
        <header className="sage-header">
          <div className="monkey-emoji" role="img" aria-label="Monkey">
            🐒
          </div>
          <p className="sage-overline">A quiet moment, once a day</p>
          <h1 id="page-title">Monkey Sage</h1>
        </header>

        <DailyQuoteClient initialQuote={result.quote} initialDate={date} />

        <p className="sage-footer">Check in daily for new wisdom.</p>
      </section>
    </main>
  );
}

function WisdomLoading() {
  return (
    <main className="sage-page" aria-busy="true">
      <section className="sage-content">
        <div className="monkey-emoji" aria-hidden="true">
          🐒
        </div>
        <p className="sage-overline">Unrolling today&apos;s scroll</p>
        <div className="wisdom-scroll wisdom-scroll-loading" aria-hidden="true">
          <div className="scroll-roller scroll-roller-top" />
          <div className="scroll-paper" />
          <div className="scroll-roller scroll-roller-bottom" />
        </div>
      </section>
    </main>
  );
}
