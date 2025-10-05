// src\components\variants\api.ts
"use client";

import type {
  Variant,
  CreateVariantInput,
  VariantOverviewRow,
} from "@/types/variant";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type UpdateVariantPatch = Partial<
  Pick<Variant, "name" | "heroTitle" | "heroSub" | "ctaText" | "ctaHref" | "showCap" | "active" | "pinned">
>;

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function listVariants(): Promise<{ ok: true; variants: Variant[] }> {
  const r = await fetch(`${API}/api/variants`, { cache: "no-store" });
  return asJson<{ ok: true; variants: Variant[] }>(r);
}

export async function createVariant(body: CreateVariantInput): Promise<Variant> {
  const r = await fetch(`${API}/api/variants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return asJson<Variant>(r);
}

export async function updateVariant(id: string, body: UpdateVariantPatch): Promise<Variant> {
  const r = await fetch(`${API}/api/variants/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return asJson<Variant>(r);
}

export async function deleteVariant(id: string): Promise<{ ok: true }> {
  const r = await fetch(`${API}/api/variants/${encodeURIComponent(id)}`, { method: "DELETE" });
  return asJson<{ ok: true }>(r);
}

export async function variantsOverview(): Promise<{ ok: true; variants: VariantOverviewRow[] }> {
  const r = await fetch(`${API}/api/variants/analytics/overview`, { cache: "no-store" });
  return asJson<{ ok: true; variants: VariantOverviewRow[] }>(r);
}

// re-export types for convenient import
export type { CreateVariantInput, VariantOverviewRow };
