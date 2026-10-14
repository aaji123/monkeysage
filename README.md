# 🐒 Monkey Sage

> *One monkey. One quote. One day.*

**Monkey Sage** is a minimalist, daily wisdom web application. It delivers a single, thoughtful philosophical quote every day, translated into the simple, slightly absurd "Monkey English" of an ancient, banana-obsessed sage. 

Built for simplicity, privacy, and zero maintenance, it requires no user accounts, tracks no data, and costs nothing to run.

🔗 **Live App:** [monkeysage.vercel.app](https://monkeysage.vercel.app) *(replace with your actual Vercel URL)*

---

## ✨ How It Works

- **The Daily Drop:** Every 24 hours, the app serves a new quote drawn from a curated, pre-seeded pool of 300+ philosophical insights (Zen, Taoism, Confucianism).
- **Smart Shuffle (No Repeats):** A deterministic algorithm ensures that every quote is shown exactly once before the cycle restarts. You will never see the same quote twice in a single cycle.
- **Local Personalization:** Each visitor receives a unique daily quote tailored to them. This is achieved using a locally generated, anonymous browser UUID. The quote remains stable all day (even if you refresh), but requires no login, database tracking, or cookies.
- **Progressive Web App (PWA):** The site is fully optimized for mobile. Users can "Add to Home Screen" on iOS or Android, giving it a native app feel with a custom icon and no browser UI clutter.
- **Privacy-First:** Zero analytics, zero user tracking, and zero third-party scripts. All personalization happens entirely within the user's browser.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **PWA:** `@ducanh2912/next-pwa`
- **Hosting:** Vercel

---

## 🧠 Project Philosophy

Monkey Sage was built with a strict set of constraints to prove that powerful, engaging applications don't need to be complex:
1. **Build Once, Maintain Never:** The app is designed to run indefinitely on free tiers without ongoing financial or technical maintenance.
2. **Frictionless Experience:** No sign-ups, no paywalls, no loading screens. Just open the link and receive the wisdom.
3. **Respect the User:** If an app doesn't need your data to function, it shouldn't ask for it.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---
