import { describe, expect, it } from "vitest";
import { FONT_SUBSTITUTES } from "./fonts";

describe("FONT_SUBSTITUTES", () => {
  it("documents Switzer and Basier Circle substitutes", () => {
    expect(FONT_SUBSTITUTES.switzer.intended).toBe("Switzer");
    expect(FONT_SUBSTITUTES.switzer.substitute).toBe("Manrope");
    expect(FONT_SUBSTITUTES.basierCircle.intended).toBe("Basier Circle");
    expect(FONT_SUBSTITUTES.basierCircle.substitute).toBe("Plus Jakarta Sans");
  });
});
