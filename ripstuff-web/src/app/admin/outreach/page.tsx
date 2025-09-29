import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MarketingCommandCenter } from "@/components/moderation/MarketingCommandCenter";

export default async function OutreachPage() {
  const user = await getCurrentUser();
  
  if (!user?.isModerator) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Marketing Command Center</h1>
        <p className="text-[var(--muted)]">
          Generate personalized outreach messages, prefilled links, and instant memorial assets for marketing prospects.
        </p>
      </div>
      
      <MarketingCommandCenter />
    </div>
  );
}