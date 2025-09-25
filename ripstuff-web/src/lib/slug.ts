import { customAlphabet } from "nanoid";

const slugAlphabet = "abcdefghijkmnopqrstuvwxyz23456789";
const makeSlugId = customAlphabet(slugAlphabet, 6);

export function generateSlug(title: string) {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const unique = makeSlugId();
  const base = sanitized || "grave";
  return `${base}-${unique}`;
}
