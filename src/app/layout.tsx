import type { Metadata, Viewport } from "next";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import "./globals.css";

const appTitle = "Monkey Sage - Daily Wisdom";
const appDescription = "One monkey. One quote. One day.";
const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = vercelHost
  ? `https://${vercelHost}`
  : process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://monkeysage.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Monkey Sage",
  title: appTitle,
  description: appDescription,
  manifest: "/manifest.json",
  openGraph: {
    title: appTitle,
    description: appDescription,
    type: "website",
    siteName: "Monkey Sage",
    url: siteUrl,
    images: [{ url: "/icon-512x512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: appTitle,
    description: appDescription,
    images: ["/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Monkey Sage",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#78350f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
