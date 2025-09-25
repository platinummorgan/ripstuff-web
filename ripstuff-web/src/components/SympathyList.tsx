export type Sympathy = {
  id: string;
  body: string;
  createdAt: string;
};

export function SympathyList({ sympathies }: { sympathies: Sympathy[] }) {
  if (!sympathies.length) {
    return <p className="text-sm text-[var(--muted)]">No sympathies yet. Share the grave to invite a few.</p>;
  }

  return (
    <ul className="space-y-4">
      {sympathies.map((entry) => (
        <li key={entry.id} className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,14,25,0.8)] px-4 py-3 text-sm text-[var(--foreground)]">
          <p className="leading-6">{entry.body}</p>
          <span className="mt-2 block text-xs text-[var(--muted)]">
            {new Date(entry.createdAt).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
