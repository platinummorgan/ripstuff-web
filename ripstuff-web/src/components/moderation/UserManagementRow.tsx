'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/Button";

interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  provider: string;
  deviceHash: string | null;
  isModerator: boolean;
  isBanned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
  banExpiresAt: Date | null;
  suspendedUntil: Date | null;
  createdAt: Date;
  stats: {
    gravesCount: number;
    reportsCount: number;
    sympathiesCount: number;
  };
}

interface UserManagementRowProps {
  user: User;
  onUpdate: () => void;
}

export function UserManagementRow({ user, onUpdate }: UserManagementRowProps) {
  const [isActionPending, setIsActionPending] = useState(false);
  const [showBanForm, setShowBanForm] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'ban' | 'suspend'>('ban');
  const [banDuration, setBanDuration] = useState('');

  const isCurrentlyBanned = user.isBanned && (!user.banExpiresAt || new Date(user.banExpiresAt) > new Date());
  const isCurrentlySuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
  const isActive = !isCurrentlyBanned && !isCurrentlySuspended;

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      alert('Please provide a reason for the ban');
      return;
    }

    setIsActionPending(true);
    try {
      const body: any = {
        reason: banReason,
        type: banType,
      };

      if (banDuration && banType === 'suspend') {
        const durationMs = parseInt(banDuration) * 60 * 60 * 1000; // hours to milliseconds
        body.expiresAt = new Date(Date.now() + durationMs).toISOString();
      } else if (banDuration && banType === 'ban') {
        const durationMs = parseInt(banDuration) * 24 * 60 * 60 * 1000; // days to milliseconds
        body.expiresAt = new Date(Date.now() + durationMs).toISOString();
      }

      const response = await fetch(`/api/moderation/users/${user.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowBanForm(false);
        setBanReason('');
        setBanDuration('');
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to ${banType} user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Failed to ${banType} user: Network error`);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!confirm('Are you sure you want to unban this user?')) {
      return;
    }

    setIsActionPending(true);
    try {
      const response = await fetch(`/api/moderation/users/${user.id}/ban`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual unban by moderator' }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to unban user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to unban user: Network error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleBanDevice = async () => {
    if (!user.deviceHash) {
      alert('User has no device hash to ban');
      return;
    }

    const reason = prompt('Enter reason for device ban:');
    if (!reason) return;

    setIsActionPending(true);
    try {
      const response = await fetch('/api/moderation/devices/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceHash: user.deviceHash,
          reason,
        }),
      });

      if (response.ok) {
        alert('Device banned successfully');
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to ban device: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to ban device: Network error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE this user account?

User: ${user.name || 'Anonymous'} (${user.email})
Provider: ${user.provider.toUpperCase()}
Graves Created: ${user.stats.gravesCount}
Messages: ${user.stats.sympathiesCount}

⚠️ WARNING: This action cannot be undone!
- User account will be deleted permanently
- OAuth linked accounts will be removed
- Graves and reactions will remain but become anonymous
- User will be able to create new accounts with same OAuth provider

Type "DELETE" to confirm:`;

    const confirmation = prompt(confirmMessage);
    if (confirmation !== 'DELETE') {
      return;
    }

    setIsActionPending(true);
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`User deleted successfully!\n\nImpact:\n- Graves created: ${result.impact.gravesCreated}\n- Reactions given: ${result.impact.reactionsGiven}\n\n${result.impact.note}`);
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to delete user: Network error');
    } finally {
      setIsActionPending(false);
    }
  };

  const getStatusBadge = () => {
    if (user.isModerator) {
      return <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">MODERATOR</span>;
    }
    
    if (isCurrentlyBanned) {
      const isPermanent = !user.banExpiresAt;
      return (
        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
          {isPermanent ? 'BANNED' : 'TEMP BAN'}
        </span>
      );
    }
    
    if (isCurrentlySuspended) {
      return <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold">SUSPENDED</span>;
    }
    
    return <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">ACTIVE</span>;
  };

  return (
    <>
      <tr className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <td className="px-4 py-4">
          <div className="flex items-start gap-3">
            {user.picture && (
              <Image
                src={user.picture}
                alt={user.name || 'User'}
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="font-medium text-white truncate">
                {user.name || 'Anonymous User'}
              </div>
              <div className="text-xs text-[var(--muted)] truncate">
                {user.email}
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">
                {user.provider.toUpperCase()} • {user.deviceHash?.slice(0, 8)}...
              </div>
              {(isCurrentlyBanned || isCurrentlySuspended) && (
                <div className="text-xs text-red-300 mt-1">
                  {user.banReason || 'No reason provided'}
                  {user.banExpiresAt && (
                    <div className="text-xs text-gray-400">
                      Until: {new Date(user.banExpiresAt).toLocaleDateString()}
                    </div>
                  )}
                  {user.suspendedUntil && (
                    <div className="text-xs text-gray-400">
                      Until: {new Date(user.suspendedUntil).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-4 py-4">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-blue-300">🪦</span>
              <span>{user.stats.gravesCount} graves</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">💬</span>
              <span>{user.stats.sympathiesCount} messages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-300">🚨</span>
              <span>{user.stats.reportsCount} reports</span>
            </div>
          </div>
        </td>
        
        <td className="px-4 py-4 text-center">
          {getStatusBadge()}
        </td>
        
        <td className="px-4 py-4 text-xs text-[var(--muted)]">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        
        <td className="px-4 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isActive && !user.isModerator && (
              <>
                <Button
                  variant="ghost"
                  disabled={isActionPending}
                  onClick={() => setShowBanForm(!showBanForm)}
                  className="text-xs px-2 py-1"
                >
                  {showBanForm ? 'Cancel' : '🚫 Ban'}
                </Button>
                {user.deviceHash && (
                  <Button
                    variant="ghost"
                    disabled={isActionPending}
                    onClick={handleBanDevice}
                    className="text-xs px-2 py-1"
                  >
                    📱 Ban Device
                  </Button>
                )}
                <Button
                  variant="ghost"
                  disabled={isActionPending}
                  onClick={handleDeleteUser}
                  className="text-xs px-2 py-1 text-red-400 hover:text-red-300"
                >
                  🗑️ Delete User
                </Button>
              </>
            )}
            
            {(isCurrentlyBanned || isCurrentlySuspended) && (
              <>
                <Button
                  variant="ghost"
                  disabled={isActionPending}
                  onClick={handleUnbanUser}
                  className="text-xs px-2 py-1 text-green-400 hover:text-green-300"
                >
                  ✅ Unban
                </Button>
                <Button
                  variant="ghost"
                  disabled={isActionPending}
                  onClick={handleDeleteUser}
                  className="text-xs px-2 py-1 text-red-400 hover:text-red-300"
                >
                  🗑️ Delete User
                </Button>
              </>
            )}
            
            {user.isModerator && (
              <span className="text-xs text-purple-300">Protected Account</span>
            )}
          </div>
        </td>
      </tr>
      
      {/* Ban Form Row */}
      {showBanForm && (
        <tr className="bg-[rgba(255,0,0,0.05)] border-b border-red-500/20">
          <td colSpan={5} className="px-4 py-4">
            <div className="space-y-4 max-w-2xl">
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="banType"
                      value="ban"
                      checked={banType === 'ban'}
                      onChange={(e) => setBanType(e.target.value as 'ban')}
                    />
                    <span className="text-sm">Permanent Ban</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="banType"
                      value="suspend"
                      checked={banType === 'suspend'}
                      onChange={(e) => setBanType(e.target.value as 'suspend')}
                    />
                    <span className="text-sm">Temporary Suspension</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Reason for action..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-gray-400"
                />
                
                <input
                  type="number"
                  placeholder={banType === 'ban' ? 'Days (optional)' : 'Hours'}
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-32 px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-gray-400"
                />
                
                <Button
                  disabled={isActionPending || !banReason.trim()}
                  onClick={handleBanUser}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 text-sm"
                >
                  {banType === 'ban' ? 'Ban User' : 'Suspend User'}
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}