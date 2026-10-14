# Monkey Sage

A public daily wisdom app. Everyone sees the same quote for the same UTC day. Quotes are read from Supabase and never generated at request time.

## Setup

1. Apply `supabase/migrations/20261014000000_quotes.sql` in the Supabase SQL editor.
2. Add the Supabase URL and anon key to `.env.local`:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The app uses the anon key for public reads protected by RLS. The service-role key is only used by the local seed script; never expose it with a `NEXT_PUBLIC_` prefix.

3. Seed or update the database from `quotes.txt`:

```bash
npm run seed:quotes
```

The page reads only from `public.quotes`; it does not read `quotes.txt` at runtime. If the account-specific migration was previously applied, run `supabase/migrations/20261014000002_remove_account_features.sql` once in the SQL editor to remove its table and RPC.

## Development

```bash
npm run dev
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this repository to GitHub and import it from the Vercel dashboard.
2. Set the Vercel project root directory to `ancient-monkey-wisdom` and keep the detected Next.js build settings (`npm run build`).
3. Add these two environment variables for Production (and Preview if you use preview deployments):
	- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon/publishable key
4. Confirm the public `quotes` table is seeded and anonymous read access is enabled by the SQL migrations.
5. Deploy. Vercel supplies HTTPS automatically, which is required for service workers and PWA installation.

The Supabase service-role key is only needed locally for `npm run seed:quotes`; do not add it to Vercel. The Open Graph URL uses Vercel's `VERCEL_URL` automatically. The share fallback text names `monkeysage.com` as requested; update it if you deploy on a different permanent domain.

## Native Mobile App

The Expo iOS/Android app is in `mobile/` and reads the same quote through `/api/daily-quote`.

1. Deploy the Next.js site over HTTPS, then create `mobile/.env.local` with `EXPO_PUBLIC_API_URL=https://your-deployed-site.example.com`.
2. From `mobile/`, run `npm start` and open the project in Expo Go to preview it on a device.
3. For store builds, set the API URL in EAS, replace the placeholder bundle/package ID in `mobile/app.json` with an identifier you control, then run `npx eas-cli@latest login`, `npx eas-cli@latest init`, and `npx eas-cli@latest build --platform all --profile production`.
4. Submit the Android build with `npx eas-cli@latest submit --platform android --latest`; submit iOS with `npx eas-cli@latest submit --platform ios --latest`.

Store release requires Google Play Console and Apple Developer Program accounts, signing credentials, store listings, privacy details, and review. EAS can build iOS in the cloud from Windows; it does not publish listings or guarantee store approval.
