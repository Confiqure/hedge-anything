import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// Self-hosted Plausible (analytics.dylanwheeler.net). Both env vars are injected by
// AWS Amplify (Terraform: monorepo workspace/infrastructure/amplify/apps.tf); the
// script only renders when the domain is set, so local dev never emits events.
const plausibleHost = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://analytics.dylanwheeler.net";
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";

export const metadata: Metadata = {
  title: "Hedge Anything - Expense Hedging Companion",
  description: "Calculate Polymarket hedging positions for everyday expense volatility. Advanced Monte Carlo simulations and risk-optimized hedge ratios for sophisticated risk management.",
  keywords: ["hedging", "polymarket", "expense management", "risk management", "prediction markets", "monte carlo", "financial tools"],
  authors: [{ name: "Hedge Anything" }],
  openGraph: {
    title: "Hedge Anything - Expense Hedging Companion",
    description: "Turn unpredictable costs into manageable risks with sophisticated hedging calculations and Monte Carlo simulations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hedge Anything - Expense Hedging Companion",
    description: "Turn unpredictable costs into manageable risks with sophisticated hedging calculations and Monte Carlo simulations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src={`${plausibleHost}/js/script.file-downloads.hash.outbound-links.pageview-props.tagged-events.js`}
          />
        )}
        {children}
        <footer className="border-t border-gray-200 dark:border-gray-700 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Made with{" "}
          <span role="img" aria-label="love">
            ❤️
          </span>{" "}
          by{" "}
          <a
            href="https://dylanwheeler.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-gray-300 dark:decoration-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Dylan
          </a>
          {" · "}
          <a
            href="https://github.com/Confiqure/hedge-anything"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-gray-300 dark:decoration-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Source
          </a>
        </footer>
      </body>
    </html>
  );
}
