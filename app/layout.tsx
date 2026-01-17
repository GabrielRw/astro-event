import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Astral Chart | Western Natal Chart Calculator",
  description: "Calculate your Western Natal Chart with precise planetary positions, house cusps, and aspects. Modern astrology app powered by FreeAstroAPI.",
  keywords: ["natal chart", "astrology", "horoscope", "birth chart", "zodiac", "planetary positions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased gradient-bg`}>
        {children}
      </body>
    </html>
  );
}
