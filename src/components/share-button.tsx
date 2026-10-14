"use client";

import { useState } from "react";

type ShareButtonProps = {
  quoteText: string;
};

export function ShareButton({ quoteText }: ShareButtonProps) {
  const [feedback, setFeedback] = useState("");

  async function shareQuote() {
    const rootUrl = new URL("/", window.location.href).toString();
    const shareText = `Today's wisdom from the Monkey Sage: ${quoteText} - monkeysage.com`;
    const shareData = {
      title: "Monkey Sage - Daily Wisdom",
      text: shareText,
      url: rootUrl,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        setFeedback("Wisdom shared.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(`${shareText}\n${rootUrl}`);
      setFeedback("Wisdom copied to clipboard.");
    } catch {
      setFeedback("Sharing is unavailable in this browser.");
    }
  }

  return (
    <div className="share-control">
      <button className="share-action" onClick={shareQuote} type="button">
        Share today&apos;s wisdom
      </button>
      <p className="share-feedback" aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}
