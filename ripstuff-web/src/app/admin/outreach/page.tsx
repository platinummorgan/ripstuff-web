import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MarketingCommandCenter } from "@/components/moderation/MarketingCommandCenter";

export default async function OutreachPage() {
  const user = await getCurrentUser();
  
  if (!user?.isModerator) {
    redirect("/");
  }

  return (
    <>
      <style jsx global>{`
        .marketing-template-text,
        .marketing-template-text * {
          color: #ffffff !important;
          background-color: #1f2937 !important;
        }
      `}</style>
      <div className="fixed inset-0 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto">
        <div className="min-h-screen">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">📢 Marketing Command Center</h1>
              <p className="text-[var(--muted)]">
                Generate personalized outreach messages, prefilled links, and instant memorial assets for marketing prospects.
              </p>
            </div>
            
            <MarketingCommandCenter />
          </div>
        </div>
      </div>
    </>
  );
}