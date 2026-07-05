import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
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
  title: {
    default: "ScholarGenie AI — Your AI Study Abroad Copilot",
    template: "%s | ScholarGenie AI",
  },
  description:
    "Find scholarships, universities, and professors matched to your profile. Free for international students.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://scholargenie-ai.vercel.app",
  ),
  openGraph: {
    title: "ScholarGenie AI — Your AI Study Abroad Copilot",
    description:
      "Scholarship matches, universities, professors, and a weekly action plan — free for international students.",
    siteName: "ScholarGenie AI",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
