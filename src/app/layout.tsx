import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
