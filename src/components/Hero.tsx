// src\components\Hero.tsx
"use client";

type Props = {
  id?:string;
  eyebrow?: string;
  title: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?:string;
  ctaDataAttr?:string;
};

export default function Hero({
  id="hero",
  eyebrow,
  title,
  subheading,
  ctaText = "Get Started",
  ctaHref = "#contact",
  ctaDataAttr = "hero-cta",
}: Props) {
  return (
    <section id={id} className="relative section gradient-hero overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_120%_10%,rgba(59,130,246,.18),transparent_55%)]" />

      <div className="mx-auto max-w-6xl px-4">
        <div className="pt-28 md:pt-36 pb-10">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
              <span className="audio-bars" aria-hidden="true">
                <span></span><span></span><span></span>
              </span>
              <span>{eyebrow}</span>
            </div>
          )}

          <h1 className="mt-6 section-title-hero">
            {title}
          </h1>

          {subheading && (
            <p className="mt-4 section-sub-hero">
              {subheading}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={ctaHref}
              data-cta={ctaDataAttr}
              className="rounded-xl px-6 py-3 font-semibold bg-white text-black hover:bg-white/90 transition"
            >
              {ctaText}
            </a>
            <a
              href="#services"
              className="rounded-xl px-6 py-3 font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition"
            >
              Explore Services
            </a>
          </div>
        </div>
      </div>

      {/* Subtle stage lights” */}
      <div className="pointer-events-none absolute -top-20 right-10 h-60 w-60 rounded-full blur-3xl bg-rose-400/10" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full blur-3xl bg-indigo-400/10" />
    </section>
  );
}
