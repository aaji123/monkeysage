import { Suspense } from "react";
import { io } from "next/cache";
import { ShareButton } from "@/components/share-button";
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

        <figure className="wisdom-scroll">
          <blockquote className="wisdom-quote">
            &ldquo;{result.quote.quoteText}&rdquo;
          </blockquote>
          <figcaption className="wisdom-category">
            {result.quote.category}
          </figcaption>
        </figure>
        <ShareButton quoteText={result.quote.quoteText} />

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