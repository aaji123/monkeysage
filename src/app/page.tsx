import { Suspense } from "react";
import { io } from "next/cache";
import { DailyQuoteClient } from "@/components/daily-quote-client";
import { getDailyQuote } from "@/lib/quotes";

export default function Home() {
  return (
    <Suspense fallback={<WisdomLoading />}>
      <DailyWisdom />
    </Suspense>
  );
}

async function DailyWisdom() {
  await io();
  const result = await getDailyQuote();

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

        <DailyQuoteClient initialQuote={result.quote} />

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
      </section>
    </main>
  );
}