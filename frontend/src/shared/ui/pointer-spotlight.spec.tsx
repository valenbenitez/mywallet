import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PointerSpotlight } from "./pointer-spotlight";

function mockMatchMedia(matches: boolean) {
  const media = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(() => media),
  });
  return media;
}

describe("PointerSpotlight", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a testable spotlight canvas with CSS spotlight variables", () => {
    render(
      <PointerSpotlight>
        <span>content</span>
      </PointerSpotlight>,
    );

    const canvas = screen.getByTestId("pointer-spotlight");
    expect(canvas).toHaveClass("pointer-spotlight");
    expect(canvas.style.getPropertyValue("--spotlight-x")).toBe("50%");
    expect(canvas.style.getPropertyValue("--spotlight-y")).toBe("32%");
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("updates spotlight CSS variables on pointer move", () => {
    render(
      <PointerSpotlight>
        <span>content</span>
      </PointerSpotlight>,
    );

    const canvas = screen.getByTestId("pointer-spotlight");
    Object.defineProperty(canvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.pointerMove(canvas, {
      clientX: 25,
      clientY: 75,
      pointerType: "mouse",
    });

    expect(canvas.style.getPropertyValue("--spotlight-x")).toBe("25.00%");
    expect(canvas.style.getPropertyValue("--spotlight-y")).toBe("75.00%");
  });

  it("keeps a static spotlight when prefers-reduced-motion is set", async () => {
    mockMatchMedia(true);

    render(
      <PointerSpotlight>
        <span>content</span>
      </PointerSpotlight>,
    );

    const canvas = screen.getByTestId("pointer-spotlight");
    await waitFor(() => {
      expect(canvas.style.getPropertyValue("--spotlight-x")).toBe("50%");
    });

    Object.defineProperty(canvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.pointerMove(canvas, {
      clientX: 10,
      clientY: 90,
      pointerType: "mouse",
    });

    expect(canvas.style.getPropertyValue("--spotlight-x")).toBe("50%");
    expect(canvas.style.getPropertyValue("--spotlight-y")).toBe("32%");
  });
});
