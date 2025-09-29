interface UserMemorialStatsProps {
  stats: {
    totalMemorials: number;
    totalReactions: number;
    totalSympathies: number;
    joinedAt: string;
    popularCategories: Array<{ category: string; count: number }>;
  };
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  color = "blue" 
}: { 
  icon: string; 
  label: string; 
  value: string | number; 
  subtext?: string;
  color?: "blue" | "green" | "purple" | "red" | "yellow";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    green: "bg-green-500/10 border-green-500/20 text-green-300",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-300",
    red: "bg-red-500/10 border-red-500/20 text-red-300",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm opacity-90">{label}</div>
          {subtext && (
            <div className="text-xs opacity-70 mt-1">{subtext}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserMemorialStats({ stats }: UserMemorialStatsProps) {
  // Calculate some derived stats
  const avgReactionsPerMemorial = stats.totalMemorials > 0 
    ? Math.round(stats.totalReactions / stats.totalMemorials) 
    : 0;

  const joinedDate = new Date(stats.joinedAt);
  const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
  const memorialsPerWeek = daysSinceJoined > 7 
    ? ((stats.totalMemorials / daysSinceJoined) * 7).toFixed(1)
    : stats.totalMemorials.toString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon="💀"
        label="Memorials Created"
        value={stats.totalMemorials}
        subtext={daysSinceJoined > 7 ? `~${memorialsPerWeek}/week avg` : undefined}
        color="blue"
      />

      <StatCard
        icon="❤️"
        label="Total Reactions"
        value={stats.totalReactions}
        subtext={stats.totalMemorials > 0 ? `~${avgReactionsPerMemorial} per memorial` : undefined}
        color="red"
      />

      <StatCard
        icon="💝"
        label="Sympathy Messages"
        value={stats.totalSympathies}
        subtext={stats.totalSympathies > 0 ? "from the community" : "none yet"}
        color="purple"
      />

      <StatCard
        icon="📅"
        label="Days Active"
        value={daysSinceJoined}
        subtext={daysSinceJoined === 0 ? "joined today!" : daysSinceJoined === 1 ? "joined yesterday" : `${Math.floor(daysSinceJoined / 7)} weeks`}
        color="green"
      />
    </div>
  );
}