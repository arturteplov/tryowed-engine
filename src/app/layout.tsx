import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Claim Everything You're Owed | Free Money Recovery",
  description:
    "We search government databases, tax records, and public records to find unclaimed money you're owed — tax credits, unclaimed property, government benefits, and class action settlements. Free to check. 15% only if we recover.",
  openGraph: {
    title: "Americans leave $70 billion unclaimed every year. Let's find yours.",
    description:
      "Free check. No upfront fees. We file claims for you and take 15% only of what we recover.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-navy">
        {children}
      </body>
    </html>
  );
}
