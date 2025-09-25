interface ReactionsSummaryProps {
  reactions: {
    heart: number;
    candle: number;
    rose: number;
    lol: number;
  };
}

export function ReactionsSummary({ reactions }: ReactionsSummaryProps) {
  const items: Array<{ emoji: string; label: string; count: number }> = [
    { emoji: "❤️", label: "Hearts", count: reactions.heart },
    { emoji: "🕯️", label: "Candles", count: reactions.candle },
    { emoji: "🌹", label: "Roses", count: reactions.rose },
    { emoji: "😂", label: "Laughs", count: reactions.lol },
  ];

  return (
    <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.05)] px-4 py-2">
          <span>{item.emoji}</span>
          <span className="text-white">{item.count}</span>
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
