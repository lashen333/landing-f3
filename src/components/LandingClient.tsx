// src\components\LandingClient.tsx
"use client";

import { useCallback, useState } from "react";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import FeatureCard from "@/components/FeatureCard";
import StickyHeader from "@/components/StickyHeader";
import ContactForm from "@/components/ContactForm";
import UTMInit from "@/components/UTMInit";
import BehaviorTracker from "@/components/BehaviorTracker";
import VariantLoader from "@/components/VariantLoader";
import type { LandingVariant } from "@/types/variant";
import GeoInit from "@/components/GeoInit";

type Props = { initialVariant: LandingVariant | null };

export default function LandingClient({ initialVariant }: Props) {
  const [variant, setVariant] = useState<LandingVariant | null>(initialVariant);

  // ✅ stable function; also no-op if nothing actually changes
  const handleLoaded = useCallback((v: LandingVariant | null) => {
    setVariant((prev) => (prev?._id === v?._id ? prev : v));
  }, []);

  return (
    <>
      <VariantLoader onLoaded={handleLoaded} disabled={!!initialVariant} />
      <UTMInit />
      <GeoInit />
      <BehaviorTracker />
      <StickyHeader />

      <Hero
        id="hero"
        eyebrow={variant ? `Variant: ${variant.name}` : "Your Sound. Your Stage."}
        title={variant?.heroTitle ?? "Turn Listeners into Fans"}
        subheading={
          variant?.heroSub ??
          "Smart landing pages for musicians, producers & studios — showcase tracks, capture leads, and book gigs."
        }
        ctaText={variant?.ctaText ?? "Book a Free Demo"}
        ctaHref={variant?.ctaHref ?? "#contact"}
        ctaDataAttr="hero-cta"
      />

      <Section id="services" title="Built for Music Careers" subtitle="Everything you need to promote your releases, tours, and services with style.">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard title="EP / Single Launch" desc="Embed players, pre-save links, and socials. Convert hype to streams." />
          <FeatureCard title="Booking & EPK" desc="Clean press kit with highlights, rider, and instant contact." />
          <FeatureCard title="Merch & Fan Club" desc="Link to your store, collect emails, and nurture superfans." />
        </div>
      </Section>

      <Section id="contact" title="Let’s Amplify Your Brand" subtitle="Tell us your genre and goals — we’ll craft a page that fits your vibe.">
        <ContactForm />
      </Section>

      <footer className="py-10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Your Studio • Made with 🎵
      </footer>
    </>
  );
}
