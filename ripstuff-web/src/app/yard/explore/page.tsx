import Image from "next/image";
import Link from "next/link";

interface YardSummary {
  yardId: string;
  latestAt: string;
  samplePhotoUrl: string | null;
  count: number;
}

async function fetchExplore(): Promise<{ items: YardSummary[]; nextCursor: string | null }> {
  try {
    const res = await fetch(`/api/yard/explore`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load");
    return res.json();
  } catch (error) {
    // Fallback to empty data if API fails
    console.warn("Failed to fetch explore data, using fallback:", error);
    return { items: [], nextCursor: null };
  }
}

export default async function ExploreYardsPage() {
  const { items } = await fetchExplore();
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white">Cemeteries</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Browse public yards and zoom into a keeper’s graves</p>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(80,120,80,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient( to bottom, rgba(40,60,50,0.20), rgba(40,60,50,0.20) 16px, rgba(20,30,30,0.12) 16px, rgba(20,30,30,0.12) 64px)]" />
        {items.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted)]">No public yards yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {items.map((y) => (
              <Link key={y.yardId} href={`/yard/${y.yardId}`} className="group block rounded-lg border border-[var(--border)] bg-[rgba(10,14,25,0.6)] p-3 hover:border-[var(--accent)]">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 overflow-hidden rounded bg-black/30">
                    {y.samplePhotoUrl ? (
                      <Image src={y.samplePhotoUrl} alt={y.yardId.slice(0, 8)} width={160} height={96} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[var(--muted)]">No media</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{y.yardId.slice(0, 12)}</p>
                    <p className="text-xs text-[var(--muted)]">{y.count} graves</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
