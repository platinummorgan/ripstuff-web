'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';

interface PendingNotification {
  id: string;
  type: 'NEW_SYMPATHY' | 'FIRST_DAILY_REACTION' | 'DAILY_DIGEST';
  createdAt: string;
  user: {
    email: string;
    name?: string;
    picture?: string;
  };
  grave: {
    title: string;
    slug: string;
  };
  emailData: {
    to: string;
    subject: string;
    text: string;
    html: string;
  };
  sympathyAuthor?: string;
  sympathyMessage?: string;
  reactionType?: string;
  reactorName?: string;
}

interface NotificationManagerProps {
  className?: string;
}

export function NotificationManager({ className }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<PendingNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/moderation/notifications', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError('Failed to load pending notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (notificationId: string, action: 'mark_sent' | 'skip') => {
    setProcessingIds(prev => new Set(prev).add(notificationId));

    try {
      const res = await fetch('/api/moderation/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notificationId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to process notification');
      }

      // Remove from list after successful action
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error processing notification:', err);
      setError('Failed to process notification');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const generateMailtoLink = (notification: PendingNotification): string => {
    const { to, subject, text } = notification.emailData;
    
    // Clean up the text for mailto (remove HTML)
    const cleanText = text.replace(/\n\n/g, '\n').trim();
    
    const params = new URLSearchParams({
      to,
      subject,
      body: cleanText,
    });
    
    return `mailto:?${params.toString()}`;
  };

  const formatNotificationType = (type: string): string => {
    switch (type) {
      case 'NEW_SYMPATHY':
        return '💌 New Sympathy';
      case 'FIRST_DAILY_REACTION':
        return '❤️ First Reaction';
      case 'DAILY_DIGEST':
        return '📊 Daily Digest';
      default:
        return '📧 Notification';
    }
  };

  const getNotificationDetails = (notification: PendingNotification): string => {
    switch (notification.type) {
      case 'NEW_SYMPATHY':
        return `${notification.sympathyAuthor}: "${notification.sympathyMessage?.slice(0, 100)}${(notification.sympathyMessage?.length || 0) > 100 ? '...' : ''}"`;
      case 'FIRST_DAILY_REACTION':
        return `${notification.reactorName} reacted with ${notification.reactionType}`;
      case 'DAILY_DIGEST':
        return 'Daily activity summary';
      default:
        return 'Email notification';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <SectionHeader
          title="🔔 Pending Notifications"
          description="Loading notification queue..."
        />
        <div className="text-center py-8 text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <SectionHeader
        title={`🔔 Pending Notifications (${notifications.length})`}
        description="Review and send email notifications to users manually via Outlook"
      />

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-300 p-3 rounded-lg mb-4">
          {error}
          <Button 
            variant="ghost" 
            onClick={loadNotifications}
            className="ml-2"
          >
            Retry
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No pending notifications. All caught up! 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-[rgba(10,14,25,0.82)] border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-white">
                      {formatNotificationType(notification.type)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm text-gray-300 mb-1">
                      <strong>To:</strong> {notification.user.name || 'Anonymous'} ({notification.user.email})
                    </div>
                    <div className="text-sm text-gray-300 mb-1">
                      <strong>Memorial:</strong> {notification.grave.title}
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>Details:</strong> {getNotificationDetails(notification)}
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-400 mb-1">Email Subject:</div>
                    <div className="text-sm text-white font-medium">{notification.emailData.subject}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={processingIds.has(notification.id)}
                  >
                    <a 
                      href={generateMailtoLink(notification)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📧 Open in Outlook
                    </a>
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => handleAction(notification.id, 'mark_sent')}
                    disabled={processingIds.has(notification.id)}
                  >
                    ✅ Mark as Sent
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => handleAction(notification.id, 'skip')}
                    disabled={processingIds.has(notification.id)}
                  >
                    ⏭️ Skip
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        💡 Click "Open in Outlook" to compose email, then "Mark as Sent" after sending, or "Skip" to dismiss.
      </div>
    </div>
  );
}