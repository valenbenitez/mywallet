/**
 * Portrait type system (DESIGN.md):
 * - Switzer → body/UI (`--font-switzer`)
 * - Basier Circle → headlines (`--font-basier-circle`)
 *
 * Licensed fonts are not bundled. Google Fonts substitutes are wired via next/font:
 * - Switzer → Manrope
 * - Basier Circle → Plus Jakarta Sans
 */
export const FONT_SUBSTITUTES = {
  switzer: {
    intended: "Switzer",
    substitute: "Manrope",
    nextFontVar: "--font-switzer-face",
    themeToken: "--font-switzer",
  },
  basierCircle: {
    intended: "Basier Circle",
    substitute: "Plus Jakarta Sans",
    nextFontVar: "--font-basier-circle-face",
    themeToken: "--font-basier-circle",
  },
} as const;
