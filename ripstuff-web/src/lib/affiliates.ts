export type AffiliateSuggestion = {
  title: string;
  url: string;
  provider: string;
  reason: string;
};

type Rule = {
  provider: "amazon" | "ebay" | "custom";
  pattern: RegExp;
  title: string;
  urlTemplate: string; // includes {query}
  query?: string; // static query if not from match
};

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG;
const EBAY_CAMPAIGN_ID = process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID;
const AFFILIATES_ENABLED = process.env.NEXT_PUBLIC_AFFILIATES_ENABLED === "true";

const RULES: Rule[] = [
  {
    provider: "amazon",
    pattern: /(phone|smartphone|screen|iphone|android)/i,
    title: "Replacement phone screen protector",
    urlTemplate: "https://www.amazon.com/s?k={query}" + (AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ""),
    query: "phone+screen+protector",
  },
  {
    provider: "amazon",
    pattern: /(toaster|kitchen|appliance)/i,
    title: "Quality stainless toaster",
    urlTemplate: "https://www.amazon.com/s?k={query}`" + (AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ""),
    query: "stainless+toaster",
  },
  {
    provider: "ebay",
    pattern: /(tire|tires|wheel|rim)/i,
    title: "Affordable tires and wheels",
    urlTemplate: "https://www.ebay.com/sch/i.html?_nkw={query}" + (EBAY_CAMPAIGN_ID ? `&campid=${EBAY_CAMPAIGN_ID}` : ""),
    query: "car+tires",
  },
];

export function suggestAffiliateLinks(text: string, max = 3): AffiliateSuggestion[] {
  if (!AFFILIATES_ENABLED) return [];
  const suggestions: AffiliateSuggestion[] = [];
  for (const rule of RULES) {
    if (suggestions.length >= max) break;
    const m = text.match(rule.pattern);
    if (!m) continue;
    const query = encodeURIComponent(rule.query ?? m[0]);
    const url = rule.urlTemplate.replace("{query}", query);
    suggestions.push({
      title: rule.title,
      url,
      provider: rule.provider,
      reason: `Mentioned: "${m[0]}"`,
    });
  }
  return suggestions;
}

export function affiliateDisclosure(): string {
  return "Some links may be affiliate links that help support this site at no extra cost to you.";
}
