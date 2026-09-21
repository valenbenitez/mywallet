/** Portrait design tokens (DESIGN.md) — JS mirror for tests and typed access. */
export const colorTokens = {
  "portrait-ink": "#08304c",
  "nautical-teal": "#084e72",
  "charcoal-outline": "#353535",
  "graphite-body": "#2c2c2c",
  "slate-helper": "#797979",
  "iron-quiet": "#585858",
  "ash-divider": "#dedede",
  "fog-edge": "#c7c7c7",
  "mist-hairline": "#eeeeee",
  "white-canvas": "#ffffff",
  "mint-wash": "#d7ffe2",
  "sky-wash": "#e8f1ff",
  "peach-wash": "#ffebd6",
} as const;

export const gradientRainbowSpectrum =
  "linear-gradient(90deg, #26c0ff, #e600c2 20%, #ff4940 40%, #ffa130 60%, #ffc837 80%, #00cc3d)";

export const spacingTokens = {
  4: "4px",
  8: "8px",
  12: "12px",
  16: "16px",
  20: "20px",
  24: "24px",
  28: "28px",
  32: "32px",
  40: "40px",
  48: "48px",
  56: "56px",
  64: "64px",
  80: "80px",
  128: "128px",
  144: "144px",
  160: "160px",
} as const;

export const radiusTokens = {
  nav: "28px",
  buttons: "28px",
  cards: "24px",
  images: "24px",
  inputs: "16px",
  tags: "9999px",
} as const;

export const typographyScale = {
  caption: "10px",
  body: "16px",
  "body-lg": "18px",
  subheading: "20px",
  "heading-sm": "31px",
  heading: "44px",
  "heading-lg": "49px",
  display: "76px",
} as const;

export const layoutTokens = {
  pageMaxWidth: "1200px",
  sectionGap: "80px",
  cardPadding: "16px",
  elementGap: "16px",
} as const;

export const shadowTokens = {
  md: "rgba(0, 0, 0, 0.03) 0px 16px 16px -8px, rgba(0, 0, 0, 0.03) 0px 10px 10px -5px, rgba(0, 0, 0, 0.03) 0px 5px 5px -2.5px, rgba(0, 0, 0, 0.03) 0px 3px 3px -1.5px, rgba(0, 0, 0, 0.03) 0px 2px 2px -1px, rgba(0, 0, 0, 0.03) 0px 1px 1px -0.5px",
  subtle:
    "oklab(0 0 0 / 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.03) 0px 16px 16px -8px, rgba(0, 0, 0, 0.03) 0px 10px 10px -5px, rgba(0, 0, 0, 0.03) 0px 5px 5px -2.5px, rgba(0, 0, 0, 0.03) 0px 3px 3px -1.5px, rgba(0, 0, 0, 0.03) 0px 2px 2px -1px, rgba(0, 0, 0, 0.03) 0px 1px 1px -0.5px",
} as const;
