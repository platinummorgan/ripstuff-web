interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-2 ${alignment}`}>
      {eyebrow && (
        <p className="text-[var(--muted)] text-xs uppercase tracking-[0.4em]">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      {description && (
        <p className="text-sm text-[var(--muted)] leading-6 max-w-xl">{description}</p>
      )}
    </div>
  );
}
