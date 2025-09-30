import { Suspense } from "react";
import { BuryPageClient } from "./BuryPageClient";
import type { Metadata } from "next";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const title = searchParams.title as string;
  const category = searchParams.category as string;
  const cause = searchParams.cause as string;
  
  if (title) {
    const metaTitle = `Create Memorial for ${title} | RipStuff`;
    const description = cause 
      ? `Honor ${title} - Cause: ${cause}. Create a beautiful memorial with AI-generated eulogy.`
      : `Create a memorial for ${title}. Generate AI eulogies and share with the community.`;
      
    return {
      title: metaTitle,
      description,
      openGraph: {
        title: metaTitle,
        description,
        siteName: "RipStuff",
        type: "website",
        url: "https://ripstuff.net/bury",
        images: [{
          url: `/api/generate/twitter-card?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category || 'MISC')}&cause=${encodeURIComponent(cause || 'Unknown cause')}&cta=true&style=dark`,
          width: 1200,
          height: 675,
          alt: `Memorial card for ${title}`,
        }],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description,
        images: [`/api/generate/twitter-card?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category || 'MISC')}&cause=${encodeURIComponent(cause || 'Unknown cause')}&cta=true&style=dark`],
      },
    };
  }

  return {
    title: "Create Memorial | RipStuff",
    description: "Honor your departed items with AI-generated eulogies and beautiful memorials.",
    openGraph: {
      title: "Create Memorial | RipStuff", 
      description: "Honor your departed items with AI-generated eulogies and beautiful memorials.",
      siteName: "RipStuff",
      type: "website",
      images: [{
        url: "/api/generate/twitter-card?title=Create+Memorial&cause=Honor+your+departed+items&cta=true",
        width: 1200,
        height: 675,
        alt: "Create Memorial on RipStuff",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Create Memorial | RipStuff",
      description: "Honor your departed items with AI-generated eulogies and beautiful memorials.",
      images: ["/api/generate/twitter-card?title=Create+Memorial&cause=Honor+your+departed+items&cta=true"],
    },
  };
}

export default function BuryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuryPageClient />
    </Suspense>
  );
}






