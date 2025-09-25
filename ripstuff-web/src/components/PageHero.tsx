import Link from "next/link";

import { Button } from "@/components/Button";

interface PageHeroProps {
  title: string;
  eyebrow?: string;
  description?: string;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
  };
}

export function PageHero({
  title,
  eyebrow,
  description,
  primaryCta,
  secondaryCta,
}: PageHeroProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center text-center gap-6 pt-16 pb-10">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">{eyebrow}</p>
      )}
      <h1 className="text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
      {description && (
        <p className="max-w-2xl text-base text-[var(--muted)] sm:text-lg leading-7">
          {description}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {primaryCta && (
          <Button asChild>
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        )}
        {secondaryCta && (
          <Button variant="secondary" asChild>
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
