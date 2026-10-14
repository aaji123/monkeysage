import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

const BATCH_SIZE = 500;

type SeedQuote = {
  quote_text: string;
  category: string;
};

function parseQuoteFile(contents: string): SeedQuote[] {
  const quotes: SeedQuote[] = [];
  const seen = new Set<string>();

  for (const [index, line] of contents.split(/\r?\n/).entries()) {
    if (!line.trim()) {
      continue;
    }

    const separator = line.indexOf("|||");
    const quoteText = line.slice(0, separator).trim();
    const category = line.slice(separator + 3).trim();

    if (separator < 1 || !quoteText || !category || line.indexOf("|||", separator + 3) !== -1) {
      throw new Error(`Invalid quote format on line ${index + 1}. Expected quote_text|||category.`);
    }

    if (seen.has(quoteText)) {
      throw new Error(`Duplicate quote text on line ${index + 1}.`);
    }

    seen.add(quoteText);
    quotes.push({ quote_text: quoteText, category });
  }

  if (quotes.length === 0) {
    throw new Error("quotes.txt contains no quotes to seed.");
  }

  return quotes;
}

async function seedQuotes() {
  const projectRoot = process.cwd();
  loadEnvConfig(projectRoot);

  const quoteFile = await readFile(resolve(projectRoot, "quotes.txt"), "utf8");
  const quotes = parseQuoteFile(quoteFile);
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before seeding.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  for (let offset = 0; offset < quotes.length; offset += BATCH_SIZE) {
    const batch = quotes.slice(offset, offset + BATCH_SIZE);
    const { error } = await supabase
      .from("quotes")
      .upsert(batch, { onConflict: "quote_text" });

    if (error) {
      throw new Error(`Supabase upsert failed: ${error.message}`);
    }
  }

  console.log(`Upserted ${quotes.length} quotes into public.quotes.`);
}

seedQuotes().catch((error: unknown) => {
  console.error(
    "Quote seeding failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
});
