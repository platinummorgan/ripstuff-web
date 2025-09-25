export function containsBannedTerms(input: string, bannedList: string[]): string | null {
  const normalized = input.toLowerCase();
  const hit = bannedList.find((term) => normalized.includes(term.toLowerCase()));
  return hit ?? null;
}

export function enforceGuidelines({
  title,
  backstory,
}: {
  title: string;
  backstory?: string | null;
}) {
  const banned = process.env.BANNED_TERMS?.split(",").map((term) => term.trim()).filter(Boolean) ?? [];
  const checkFields = [title, backstory ?? ""];
  for (const field of checkFields) {
    const hit = containsBannedTerms(field, banned);
    if (hit) {
      throw new Error(`BANNED_TERM:${hit}`);
    }
  }
}
