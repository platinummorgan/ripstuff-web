import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { DeathReportActions } from "@/components/DeathReportActions";
import { InteractiveGraveMap } from "@/components/cemetery/InteractiveGraveMap";

export const metadata: Metadata = {
  title: "Death Reports - Virtual Graveyard",
  description: "Daily death statistics, trending obituaries, and graveyard analytics that are perfect for sharing.",
};

// Mock data for the death report - in production this would come from analytics
const generateMockDeathReport = () => {
  const currentDate = new Date();
  const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Use day of year to generate "random" but consistent daily stats
  const seed = dayOfYear;
  
  return {
    date: currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    totalDeaths: 1247 + (seed * 7) % 100,
    newDeaths: 23 + seed % 15,
    topCategory: ['TECH_GADGETS', 'KITCHEN_FOOD', 'CAR_TOOLS'][seed % 3],
    viralDeath: {
      title: seed % 2 === 0 ? "My WiFi Router (Age: 3 years)" : "Leftover Pizza (RIP Day 1)",
      shares: 342 + seed % 200,
      category: seed % 2 === 0 ? "TECH_GADGETS" : "KITCHEN_FOOD",
    },
    dailyStats: {
      mostCommonCause: ["Old Age", "User Error", "Planned Obsolescence", "Act of Cat"][seed % 4],
      averageLifespan: "2.3 years",
      mostMourned: ["iPhone", "Coffee", "WiFi", "Sleep"][seed % 4],
    },
    quirkyFacts: [
      `${3 + seed % 7} people buried their WiFi routers today`,
      `${seed % 5 + 1} relationships ended in tragedy (and got memorialized)`,
      `The average eulogy today was ${180 + seed % 50} characters long`,
      `${seed % 10 + 5}% of people added custom photos to their memorials`,
    ]
  };
};

export default function DeathReportsPage() {
  const report = generateMockDeathReport();

  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow="Daily Death Reports"
        title="📊 Graveyard Analytics"
        description="Daily statistics, trending deaths, and viral memorials from our community."
        primaryCta={{ href: "/bury", label: "Add to Today's Stats" }}
        secondaryCta={{ href: "/trending", label: "View Trending" }}
      />

      {/* Header Stats Card */}
      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-gradient-to-br from-[rgba(10,14,25,0.82)] to-[rgba(20,24,35,0.82)] p-6 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Death Report: {report.date}
          </h2>
          <p className="text-[var(--muted)]">Another day, another batch of dearly departed items</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center p-6 rounded-2xl bg-[rgba(255,255,255,0.03)]">
            <div className="text-3xl font-bold text-[var(--accent)]">{report.totalDeaths.toLocaleString()}</div>
            <div className="text-sm text-[var(--muted)] mt-1">Total Memorials</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-[rgba(255,255,255,0.03)]">
            <div className="text-3xl font-bold text-green-400">+{report.newDeaths}</div>
            <div className="text-sm text-[var(--muted)] mt-1">New Today</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-[rgba(255,255,255,0.03)]">
            <div className="text-2xl font-bold text-orange-400">
              {report.topCategory.replace(/_/g, ' ')}
            </div>
            <div className="text-sm text-[var(--muted)] mt-1">Top Category Today</div>
          </div>
        </div>
      </section>

      {/* Viral Death of the Day */}
      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-10">
        <SectionHeader 
          title="🔥 Viral Death of the Day" 
          description="The memorial that's breaking the internet today" 
        />
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{report.viralDeath.title}</h3>
              <p className="text-sm text-[var(--muted)] mt-1 capitalize">
                {report.viralDeath.category.replace(/_/g, ' ')} • {report.viralDeath.shares} shares
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{report.viralDeath.shares}</div>
              <div className="text-xs text-[var(--muted)]">Shares</div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Statistics */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-8">
          <SectionHeader 
            title="📈 Daily Stats" 
            description="Today's death patterns and trends" 
          />
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Most Common Cause</span>
              <span className="font-semibold text-white">{report.dailyStats.mostCommonCause}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Average Lifespan</span>
              <span className="font-semibold text-white">{report.dailyStats.averageLifespan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Most Mourned Item</span>
              <span className="font-semibold text-white">{report.dailyStats.mostMourned}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,14,25,0.82)] p-6 sm:p-8">
          <SectionHeader 
            title="🎲 Quirky Facts" 
            description="Weird and wonderful death data" 
          />
          <div className="mt-6 space-y-3">
            {report.quirkyFacts.map((fact, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
                <span className="text-[var(--accent)] font-bold text-sm">•</span>
                <span className="text-sm text-[var(--muted)] leading-relaxed">{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shareable Death Report Card */}
      <section className="rounded-3xl border border-[rgba(255,255,255,0.05)] bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6 sm:p-10">
        <SectionHeader 
          title="📱 Share Today's Report" 
          description="Spread the (death) news on social media" 
        />
        <div className="mt-6">
          <div className="p-6 rounded-2xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]">
            <div className="text-center space-y-3">
              <h4 className="font-bold text-white">💀 Daily Death Report 💀</h4>
              <p className="text-sm text-[var(--muted)]">
                Today we lost {report.newDeaths} items to the great beyond. 
                RIP to all the {report.topCategory.replace(/_/g, ' ').toLowerCase()} that served us well. 
                The most viral death: "{report.viralDeath.title}" with {report.viralDeath.shares} shares! 
                #VirtualGraveyard #DeathReport #RIP
              </p>
            </div>
          </div>
          
          <DeathReportActions report={{
            date: report.date,
            total: report.totalDeaths,
            causes: {
              [report.dailyStats.mostCommonCause]: Math.floor(report.newDeaths * 0.4),
              "User Error": Math.floor(report.newDeaths * 0.3),
              "Old Age": Math.floor(report.newDeaths * 0.2),
              "Other": Math.floor(report.newDeaths * 0.1)
            },
            trends: {
              [report.topCategory.replace(/_/g, ' ')]: "📈 Up 15%",
              "General Items": "📉 Down 8%"
            },
            notableFacts: report.quirkyFacts
          }} />
          
          <div className="mt-4 flex justify-center">
            <a 
              href="/analytics"
              className="border border-[rgba(255,255,255,0.1)] text-white px-4 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm"
            >
              📊 View Full Analytics
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}