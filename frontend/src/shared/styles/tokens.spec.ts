import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  colorTokens,
  layoutTokens,
  radiusTokens,
  spacingTokens,
  typographyScale,
} from "./tokens";

describe("Portrait design tokens", () => {
  it("exposes scaffold-critical color values from DESIGN.md", () => {
    expect(colorTokens["portrait-ink"]).toBe("#08304c");
    expect(colorTokens["white-canvas"]).toBe("#ffffff");
    expect(colorTokens["nautical-teal"]).toBe("#084e72");
    expect(colorTokens["slate-helper"]).toBe("#797979");
  });

  it("exposes spacing, radii, and type scale", () => {
    expect(spacingTokens[4]).toBe("4px");
    expect(spacingTokens[80]).toBe("80px");
    expect(radiusTokens.cards).toBe("24px");
    expect(radiusTokens.buttons).toBe("28px");
    expect(typographyScale.body).toBe("16px");
    expect(typographyScale.display).toBe("76px");
    expect(layoutTokens.pageMaxWidth).toBe("1200px");
  });

  it("wires the same tokens into globals.css @theme", () => {
    const css = readFileSync(
      resolve(__dirname, "../../app/globals.css"),
      "utf8",
    );

    expect(css).toContain("--color-portrait-ink: #08304c");
    expect(css).toContain("--color-white-canvas: #ffffff");
    expect(css).toContain("--radius-cards: 24px");
    expect(css).toContain("--radius-buttons: 28px");
    expect(css).toContain("--spacing-16: 16px");
    expect(css).toContain("--font-switzer:");
    expect(css).toContain("--font-basier-circle:");
    expect(css).toContain("--shadow-md:");
  });
});
