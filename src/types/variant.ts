// src\types\variant.ts

// Core document stored in DB and returned by listVariants()
export type Variant = {
  _id: string;
  name: string;

  heroTitle: string;
  heroSub?: string | null;

  ctaText: string;
  ctaHref: string;

  // controls/state stored on the doc
  showCap: number;      // how many times to show
  active: boolean;
  pinned: boolean;

  // simple counter stored on the doc
  impressions: number;  // total shown count
};

// Payload when creating a new variant from the form
// (we *do* send showCap; server will default active/pinned/impressions)
export type CreateVariantInput = {
  name: string;
  heroTitle: string;
  heroSub?: string | null;
  ctaText: string;
  ctaHref: string;
  showCap: number;
};

// What the overview analytics endpoint returns per variant
export type VariantOverviewRow = {
  variantId: string;
  name: string;

  // echoed/control fields
  active: boolean;
  pinned: boolean;
  showCap: number;
  impressions: number;

  // analytics
  sessions: number;
  users: number;
  clicks: number;
  ctr: number;          // 0..1
  avgHero: number;
  avgServices: number;
  avgContact: number;
};
export type LandingVariant = {
  _id: string;
  name: string;
  heroTitle: string;
  heroSub?: string | null;
  ctaText: string;
  ctaHref: string;
};