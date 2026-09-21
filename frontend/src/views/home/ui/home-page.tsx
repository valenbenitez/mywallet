import { PointerSpotlight } from "@/shared/ui/pointer-spotlight";
import { FloatingPillNav } from "@/widgets/floating-pill-nav/ui/floating-pill-nav";
import { LandingHero } from "@/widgets/landing-hero/ui/landing-hero";

/** Public landing at `/` — Portrait composition adapted to My Wallet (UI-only). */
export function HomePage() {
  return (
    <PointerSpotlight className="flex min-h-full flex-1 flex-col text-portrait-ink">
      <FloatingPillNav />
      <main className="mx-auto flex w-full max-w-[var(--page-max-width)] flex-1 flex-col pb-[var(--spacing-128)]">
        <LandingHero />
      </main>
    </PointerSpotlight>
  );
}
