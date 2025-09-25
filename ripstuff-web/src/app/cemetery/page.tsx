import { HeadstoneCard } from "@/components/HeadstoneCard";
import prisma from "@/lib/prisma";
import type { FeedItem } from "@/lib/validation";

export const dynamic = 'force-dynamic';

function shortKeeper(id?: string | null) {
  if (!id) return "Unknown";
  return `Keeper ${id.slice(0, 8)}`;
}

export default async function CemeteryPage() {
  const graves = await (prisma as any).grave.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      slug: true,
      title: true,
      eulogyText: true,
      category: true,
      photoUrl: true,
      heartCount: true,
      candleCount: true,
      roseCount: true,
      lolCount: true,
      createdAt: true,
      featured: true,
      creatorDeviceHash: true,
    },
  });

  const items: (FeedItem & { keeper: string })[] = graves.map((g: any) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    category: g.category,
    eulogyPreview: String(g.eulogyText ?? "").slice(0, 160),
    photoUrl: g.photoUrl ?? null,
    reactions: {
      heart: g.heartCount,
      candle: g.candleCount,
      rose: g.roseCount,
      lol: g.lolCount,
    },
    createdAt: new Date(g.createdAt).toISOString(),
    featured: Boolean(g.featured),
    keeper: shortKeeper(g.creatorDeviceHash ?? undefined),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-center mx-auto">
          <h1 className="text-2xl font-semibold text-white">Cemetery</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Recent memorials from all keepers</p>
        </div>
        <div className="flex gap-4">
          <a href="/overworld" className="text-sm text-[var(--accent)] hover:underline">Overworld</a>
          <a href="/yard/explore" className="text-sm text-[var(--accent)] hover:underline">View cemeteries</a>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(80,120,80,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient( to bottom, rgba(40,60,50,0.20), rgba(40,60,50,0.20) 16px, rgba(20,30,30,0.12) 16px, rgba(20,30,30,0.12) 64px)]" />
        {items.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted)]">No graves yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
            {items.map((g, i) => (
              <div key={g.id} style={{ transform: `rotate(${((i % 7) - 3) * 0.5}deg)` }} className="scale-[1.08]">
                <HeadstoneCard grave={g} />
                <p className="mt-1 text-center text-[10px] text-[var(--muted)]">{g.keeper}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
