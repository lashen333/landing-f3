// src\app\page.tsx
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import FeatureCard from "@/components/FeatureCard";
import StickyHeader from "@/components/StickyHeader";
import ContactForm from "@/components/ContactForm";
import UTMInit from "@/components/UTMInit";
import BehaviorTracker from "@/components/BehaviorTracker";

export default function Page() {
  return (
    <>
      <UTMInit />
      <BehaviorTracker />
      <StickyHeader />
      <Hero
        eyebrow="Your Sound.Your Stage."
        title="Turn Listeners into Fans"
        subheading="Smart landing pages for musicians,producers & studios — showcase tracks, capture leads, and book gigs."
        ctaText="Book a Free Demo"
        ctaHref="#contact"
      />
      <Section

        id="services"
        title="Built for Music Careers"
        subtitle="Everything you need to promote your releases,tours,and services with style."
      >
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="EP/Single Launch"
            desc="Embed players,pre-save links,and socials.Convert hype to streams."
          />
          <FeatureCard
            title="Booking & EPK"
            desc="Clean press kit with highlights,rider,and instant contact."
          />
          <FeatureCard
            title="Merch & Fan Club"
            desc="Link to your store,collect emails,and nurture superfans."
          />
        </div>
      </Section>
      <Section
        id="contact"
        title="Let's Amplify Your Brand"
        subtitle="Tell us your genre and goals-we'll craft a page that fits your vibe."
      >
        <ContactForm />
      </Section>

      <footer className="py-10 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Your Studio • Made with 🎵
      </footer>



    </>
  )
}