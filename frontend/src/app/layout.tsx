import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { BRAND_NAME, BRAND_TAGLINE } from "@/shared/config/brand";
import "./globals.css";

/**
 * Font substitutes (documented in shared/config/fonts.ts):
 * Switzer → Manrope; Basier Circle → Plus Jakarta Sans.
 */
const switzerSubstitute = Manrope({
  variable: "--font-switzer-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const basierCircleSubstitute = Plus_Jakarta_Sans({
  variable: "--font-basier-circle-face",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: BRAND_TAGLINE,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${switzerSubstitute.variable} ${basierCircleSubstitute.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white-canvas font-switzer text-portrait-ink">
        {children}
      </body>
    </html>
  );
}
