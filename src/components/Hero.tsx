// src\components\Hero.tsx
"use client";

import {motion} from "framer-motion";
import Image from "next/image";

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

      <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 items-center gap-6 md:gap-10">

        {/* LEFT CONTENT */}
        <div className="pt-18 md:pt-16 pb-10 md:pb-10">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
              <span className="audio-bars" aria-hidden="true">
                <span></span><span></span><span></span>
              </span>
              <span>{eyebrow}</span>
            </div>
          )}

          <h1 className="mt-4 md:mt-6 section-title-hero">
            {title}
          </h1>

          {subheading && (
            <p className="mt-3 md:mt-4 section-sub-hero">
              {subheading}
            </p>
          )}

          <div className="mt-6 md:mt-8 flex flex-nowrap items-center gap-2 md:gap-3">
            <a
              href={ctaHref}
              data-cta={ctaDataAttr}
              className="rounded-xl px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold bg-white text-black hover:bg-white/90 transition"
            >
              {ctaText}
            </a>
            <a
              href="#services"
              className="rounded-xl px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition whitespace-nowrap"
            >
              Explore Services
            </a>
          </div>
        </div>

        {/*RIGHT IMAGE WITH ANIMATION */}
        <motion.div
           initial={{ opacity: 0,y: 40}}
           animate={{ opacity: 1,y: [0, -15, 0]}}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut"}}
           className="flex justify-center"
           >
            <Image
              src="/hero-music.svg"
              alt="Music studio illustration"
              width={400}
              height={400}
              className="w-56 sm:w-64 md:w-[90%] md:max-w-md"
              />
           </motion.div>
      </div>

      {/* Subtle stage lights” */}
      <div className="pointer-events-none absolute -top-20 right-10 h-60 w-60 rounded-full blur-3xl bg-rose-400/10" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full blur-3xl bg-indigo-400/10" />
    </section>
  );
}
