'use client';

import { useState, useEffect } from 'react';
import FollowButton from '../FollowButton';
import FollowList from '../FollowList';

interface UserProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    picture: string | null;
    email: string;
    createdAt: Date;
    isModerator: boolean;
  };
  stats: {
    totalMemorials: number;
    totalReactions: number;
    totalSympathies: number;
    joinedAt: string;
    popularCategories: Array<{ category: string; count: number }>;
  };
  isOwnProfile?: boolean;
}

interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  TECH_GADGETS: { label: "Tech & Gadgets", icon: "📱" },
  KITCHEN_FOOD: { label: "Kitchen & Food", icon: "🍽️" },
  CLOTHING_LAUNDRY: { label: "Clothing", icon: "👕" },
  TOYS_GAMES: { label: "Toys & Games", icon: "🎮" },
  CAR_TOOLS: { label: "Car & Tools", icon: "🔧" },
  PETS_CHEWABLES: { label: "Pet Items", icon: "🐕" },
  OUTDOORS_ACCIDENTS: { label: "Outdoor Items", icon: "🏕️" },
  MISC: { label: "Miscellaneous", icon: "📦" },
};

function formatJoinDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export default function UserProfileHeader({ user, stats, isOwnProfile = false }: UserProfileHeaderProps) {
  const [followStats, setFollowStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    fetchFollowStats();
  }, [user.id]);

  const fetchFollowStats = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/follow-info`);
      if (response.ok) {
        const data = await response.json();
        setFollowStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch follow stats:', error);
    }
  };

  const handleFollowChange = (isFollowing: boolean) => {
    setFollowStats(prev => ({
      ...prev,
      isFollowing,
      followersCount: prev.followersCount + (isFollowing ? 1 : -1),
    }));
  };
  const displayName = user.name || "Anonymous User";

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="flex items-start gap-4">
          {user.picture ? (
            <img
              src={user.picture}
              alt={displayName}
              className="w-20 h-20 rounded-full border-2 border-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white truncate">{displayName}</h1>
              {user.isModerator && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300 border border-purple-500/30">
                  ⭐ Moderator
                </span>
              )}
              {!isOwnProfile && (
                <FollowButton 
                  userId={user.id}
                  initialFollowState={followStats.isFollowing}
                  onFollowChange={handleFollowChange}
                />
              )}
            </div>

            <div className="space-y-1 text-sm text-[var(--muted)]">
              <p>👤 Joined {formatJoinDate(stats.joinedAt)}</p>
              <p>💀 {stats.totalMemorials} memorial{stats.totalMemorials !== 1 ? 's' : ''} created</p>
              <p>❤️ {stats.totalReactions} total reactions received</p>
              {stats.totalSympathies > 0 && (
                <p>💝 {stats.totalSympathies} sympathy message{stats.totalSympathies !== 1 ? 's' : ''} received</p>
              )}
              <div className="flex gap-4 pt-1">
                <button
                  onClick={() => setShowFollowers(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  👥 {followStats.followersCount} follower{followStats.followersCount !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => setShowFollowing(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  🔗 {followStats.followingCount} following
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        {stats.popularCategories.length > 0 && (
          <div className="md:min-w-[200px]">
            <h3 className="text-sm font-medium text-white mb-3">Favorite Categories</h3>
            <div className="space-y-2">
              {stats.popularCategories.map((cat, index) => {
                const categoryInfo = CATEGORY_LABELS[cat.category] || { label: cat.category, icon: "📦" };
                return (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{categoryInfo.icon}</span>
                      <span className="text-[var(--muted)]">{categoryInfo.label}</span>
                    </div>
                    <span className="text-xs bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded-full text-white">
                      {cat.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Badges */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          {/* Memorial Count Badges */}
          {stats.totalMemorials >= 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300 border border-blue-500/30">
              🪦 First Memorial
            </span>
          )}
          {stats.totalMemorials >= 5 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300 border border-green-500/30">
              🏆 5+ Memorials
            </span>
          )}
          {stats.totalMemorials >= 10 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300 border border-purple-500/30">
              ⭐ Memorial Curator
            </span>
          )}

          {/* Reaction Badges */}
          {stats.totalReactions >= 10 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300 border border-red-500/30">
              ❤️ Beloved Creator
            </span>
          )}
          {stats.totalReactions >= 50 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300 border border-orange-500/30">
              🔥 Viral Memorialist
            </span>
          )}

          {/* Special Badges */}
          {stats.totalSympathies >= 5 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-300 border border-pink-500/30">
              💝 Compassionate Community
            </span>
          )}

          {/* Show placeholder if no badges */}
          {stats.totalMemorials === 0 && (
            <span className="text-xs text-[var(--muted)]">
              🌱 New to the graveyard
            </span>
          )}
        </div>
      </div>
      
      {/* Follow Lists Modals */}
      <FollowList 
        userId={user.id}
        type="followers"
        isVisible={showFollowers}
        onClose={() => setShowFollowers(false)}
      />
      <FollowList 
        userId={user.id}
        type="following"
        isVisible={showFollowing}
        onClose={() => setShowFollowing(false)}
      />
    </div>
  );
}