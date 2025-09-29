import { HeadstoneCard } from "@/components/HeadstoneCard";
import { SearchableCemetery } from "@/components/cemetery/SearchableCemetery";
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
          <p className="mt-1 text-sm text-[var(--muted)]">Search and explore memorials from all keepers</p>
        </div>
        <div className="flex gap-4">
          <a href="/overworld" className="text-sm text-[var(--accent)] hover:underline">Overworld</a>
          <a href="/yard/explore" className="text-sm text-[var(--accent)] hover:underline">View cemeteries</a>
        </div>
      </div>
      
      <SearchableCemetery initialItems={items} />
    </div>
  );
}
