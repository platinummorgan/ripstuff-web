import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { UserProvider } from "@/components/UserContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ripstuff.net"),
  title: "RipStuff — Bury Your Fallen Items with Honor",
  description:
    "Turn broken belongings into bittersweet laughs. Generate instant eulogies, share memorial cards, and let the internet leave flowers.",
  openGraph: {
    title: "RipStuff — Virtual Graveyard",
    description:
      "Bury your fallen stuff, get a somber-but-sly eulogy, and invite sympathies.",
    url: "https://ripstuff.net",
    siteName: "RipStuff",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "RipStuff Hero Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RipStuff — Virtual Graveyard",
    description: "Bury your fallen stuff with honor and a wink.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <UserProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8 sm:pb-24">
                {children}
              </div>
            </main>
            <SiteFooter />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
// Force rebuild 09/25/2025 15:46:21
