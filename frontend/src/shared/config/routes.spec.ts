import { describe, expect, it } from "vitest";
import { APP_ROUTES, isAppRoute } from "./routes";

describe("APP_ROUTES", () => {
  it("defines all MVP paths", () => {
    expect(APP_ROUTES.map((r) => r.path)).toEqual([
      "/",
      "/login",
      "/register",
      "/dashboard",
      "/send",
      "/receive",
      "/transactions",
    ]);
  });

  it("validates known routes", () => {
    expect(isAppRoute("/dashboard")).toBe(true);
    expect(isAppRoute("/unknown")).toBe(false);
  });
});
