import { BRAND_TAGLINE } from "@/shared/config/brand";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";
import { RainbowOutlineCta } from "@/shared/ui/rainbow-outline-cta";

const RAINBOW_WORD = "forever";

/** Centered hero: display headline with one rainbow-italic word + register CTA. */
export function LandingHero() {
  return (
    <section
      aria-labelledby="landing-hero-heading"
      className="mx-auto flex w-full max-w-[900px] flex-col items-center px-[var(--spacing-20)] pt-[var(--spacing-64)] text-center sm:pt-[var(--spacing-80)]"
    >
      <h1
        id="landing-hero-heading"
        className="font-basier-circle text-[length:var(--text-heading)] font-semibold leading-[var(--leading-heading)] tracking-[var(--tracking-heading)] text-portrait-ink sm:text-[length:var(--text-heading-lg)] sm:leading-[var(--leading-heading-lg)] sm:tracking-[var(--tracking-heading-lg)] lg:text-[length:var(--text-display)] lg:leading-[var(--leading-display)] lg:tracking-[var(--tracking-display)]"
      >
        A wallet without the keys{" "}
        <em className="rainbow-text-fill inline-block ps-[0.06em] pe-[0.18em] italic">
          {RAINBOW_WORD}
        </em>
      </h1>
      <p className="mt-[var(--spacing-24)] max-w-[520px] font-switzer text-[length:var(--text-body-lg)] font-normal leading-[var(--leading-body-lg)] text-graphite-body sm:mt-[var(--spacing-32)]">
        {BRAND_TAGLINE}
      </p>
      <div className="mt-[var(--spacing-32)] flex flex-col items-center gap-[var(--spacing-16)] sm:mt-[var(--spacing-40)]">
        <RainbowOutlineCta href="/register">Get started</RainbowOutlineCta>
        <GhostTextLink
          href="/login"
          className="text-[length:var(--text-body)] text-slate-helper"
        >
          Already have an account? Login
        </GhostTextLink>
      </div>
    </section>
  );
}

export { RAINBOW_WORD };
