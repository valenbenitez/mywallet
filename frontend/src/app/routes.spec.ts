import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/shared/config/routes";

const appDir = resolve(__dirname);

function routeFileFor(path: string): string {
  if (path === "/") {
    return resolve(appDir, "page.tsx");
  }
  return resolve(appDir, path.slice(1), "page.tsx");
}

describe("App Router stubs", () => {
  it.each(APP_ROUTES.map((r) => r.path))("has a page stub for %s", (path) => {
    expect(existsSync(routeFileFor(path))).toBe(true);
  });
});
