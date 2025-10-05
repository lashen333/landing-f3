// src\app\page.tsx
import LandingClient from "@/components/LandingClient";
import { cookies } from "next/headers";
import type { LandingVariant } from "@/types/variant";

// No caching for SSR variant assignment:
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SP = Promise<Record<string, string | string[] | undefined>>;

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function Page({ searchParams }: { searchParams: SP }) {
  // ✅ Next 15: await dynamic APIs
  const sp = await searchParams;
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;

  let initialVariant: LandingVariant | null = null;

  if (sid) {
    const forceName =
      typeof sp?.variant === "string" ? sp.variant : undefined;

    try {
      const res = await fetch(`${API}/api/variants/assign`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, forceName }),
      });
      if (res.ok) {
        const json = await res.json();
        initialVariant = json?.variant ?? null; // {_id,name,heroTitle,heroSub,ctaText,ctaHref}
      }
    } catch {
      // ignore; fall back to default copy if backend is down
    }
  }

  return <LandingClient initialVariant={initialVariant} />;
}
