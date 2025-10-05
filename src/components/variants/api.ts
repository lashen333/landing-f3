// src\components\variants\api.ts
"use client";

const API = process.env.NEXT_PUBLIC_API_URL;

export async function listVariants() {
  const r = await fetch(`${API}/api/variants`, { cache: "no-store" });
  if (!r.ok) throw new Error("list failed");
  return r.json() as Promise<{ ok: true; variants: any[] }>;
}

export async function createVariant(body: any) {
  const r = await fetch(`${API}/api/variants`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateVariant(id: string, body: any) {
  const r = await fetch(`${API}/api/variants/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteVariant(id: string) {
  const r = await fetch(`${API}/api/variants/${id}`, { method:"DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function variantsOverview() {
  const r = await fetch(`${API}/api/variants/analytics/overview`, { cache:"no-store" });
  if (!r.ok) throw new Error("overview failed");
  return r.json() as Promise<{ ok:true; variants: any[] }>;
}
