import { cn } from "@/lib/utils";

export interface Badge {
  id: string;
  type: 'viral' | 'trending' | 'popular' | 'milestone' | 'special';
  label: string;
  description: string;
  icon: string;
  color: string;
  requirement?: string;
}

interface MemorialBadgesProps {
  badges: Badge[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MemorialBadges({ badges, className, size = 'md' }: MemorialBadgesProps) {
  if (!badges.length) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={cn(
            'inline-flex items-center rounded-full font-medium transition-colors',
            sizeClasses[size],
            badge.color
          )}
          title={`${badge.label}: ${badge.description}`}
        >
          <span className="text-base leading-none">{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}

// Badge definitions and logic
export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'id'>> = {
  viral_100: {
    type: 'viral',
    label: 'Viral',
    description: '100+ shares across all platforms',
    icon: '🔥',
    color: 'bg-red-500/20 text-red-300 border border-red-500/30',
    requirement: '100 shares',
  },
  trending_24h: {
    type: 'trending',
    label: 'Trending',
    description: 'Most shared in the last 24 hours',
    icon: '📈',
    color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    requirement: 'Top 10 in 24h',
  },
  popular_500: {
    type: 'popular',
    label: 'Popular',
    description: '500+ views from the community',
    icon: '⭐',
    color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    requirement: '500 views',
  },
  milestone_1k: {
    type: 'milestone',
    label: '1K Club',
    description: '1,000+ views - legendary status',
    icon: '👑',
    color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    requirement: '1,000 views',
  },
  wholesome: {
    type: 'special',
    label: 'Wholesome',
    description: 'High sympathy-to-view ratio',
    icon: '💝',
    color: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    requirement: '50%+ engagement',
  },
  controversial: {
    type: 'special',
    label: 'Controversial',
    description: 'Lots of discussion and debate',
    icon: '⚡',
    color: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    requirement: 'High comment ratio',
  },
  hall_of_fame: {
    type: 'special',
    label: 'Hall of Fame',
    description: 'All-time top performer',
    icon: '🏆',
    color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    requirement: 'Top 1% all-time',
  },
};

// Function to calculate badges based on grave statistics
export function calculateBadges(stats: {
  views: number;
  shares: number;
  sympathies: number;
  reactions: number;
  createdAt: string;
  isTopPerformer?: boolean;
  isTrending?: boolean;
}): Badge[] {
  const badges: Badge[] = [];

  // Viral badges
  if (stats.shares >= 100) {
    badges.push({ id: 'viral_100', ...BADGE_DEFINITIONS.viral_100 });
  }

  // Popular badges
  if (stats.views >= 1000) {
    badges.push({ id: 'milestone_1k', ...BADGE_DEFINITIONS.milestone_1k });
  } else if (stats.views >= 500) {
    badges.push({ id: 'popular_500', ...BADGE_DEFINITIONS.popular_500 });
  }

  // Trending badge
  if (stats.isTrending) {
    badges.push({ id: 'trending_24h', ...BADGE_DEFINITIONS.trending_24h });
  }

  // Engagement-based badges
  const engagementRate = stats.views > 0 ? (stats.sympathies + stats.reactions) / stats.views : 0;
  if (engagementRate > 0.5) {
    badges.push({ id: 'wholesome', ...BADGE_DEFINITIONS.wholesome });
  }

  // Comment controversy (high comment-to-view ratio)
  const commentRate = stats.views > 0 ? stats.sympathies / stats.views : 0;
  if (commentRate > 0.3 && stats.views > 100) {
    badges.push({ id: 'controversial', ...BADGE_DEFINITIONS.controversial });
  }

  // Hall of Fame
  if (stats.isTopPerformer) {
    badges.push({ id: 'hall_of_fame', ...BADGE_DEFINITIONS.hall_of_fame });
  }

  return badges;
}