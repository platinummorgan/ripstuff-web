import { headers } from "next/headers";
import { HeadstoneCard } from "@/components/HeadstoneCard";
import type { FeedItem } from "@/lib/validation";
import { CemeteryCanvas } from "@/components/cemetery/CemeteryCanvas";

async function fetchYard(yardId: string): Promise<{ items: FeedItem[]; nextCursor: string | null }> {
  const hdrs = headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`.replace(/\/$/, "");
  const url = new URL(`/api/yard/${yardId}`, origin).toString();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load yard");
  return res.json();
}

export default async function YardPage({ params }: { params: { yardId: string } }) {
  const { items } = await fetchYard(params.yardId);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-center mx-auto">
          <h1 className="text-2xl font-semibold text-white">Graveyard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">A public view of this keeper’s memorials</p>
        </div>
        <div className="flex gap-4">
          <a href="/overworld" className="text-sm text-[var(--accent)] hover:underline">Overworld</a>
          <a href="/yard/explore" className="text-sm text-[var(--accent)] hover:underline">Zoom out</a>
        </div>
      </div>
      <CemeteryCanvas>
        {items.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted)]">No approved graves yet.</p>
        ) : (
          <div className="relative grid grid-cols-6 gap-6 p-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14">
            {items.map((g) => (
              <HeadstoneCard key={g.id} grave={g} />
            ))}
          </div>
        )}
      </CemeteryCanvas>
    </div>
  );
}
