'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

interface NotificationPreferences {
  emailOnNewSympathy: boolean;
  emailOnFirstReaction: boolean;
  emailDailyDigest: boolean;
  smsEnabled: boolean;
  smsOnNewSympathy: boolean;
  smsOnFirstReaction: boolean;
  phoneNumber: string;
  quietHoursStart: number;
  quietHoursEnd: number;
  timezone: string;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
];

const formatHour = (hour: number) => {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

export function NotificationPreferencesSection() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailOnNewSympathy: true,
    emailOnFirstReaction: true,
    emailDailyDigest: false,
    smsEnabled: false,
    smsOnNewSympathy: false,
    smsOnFirstReaction: false,
    phoneNumber: '',
    quietHoursStart: 21, // 9 PM
    quietHoursEnd: 8,    // 8 AM
    timezone: 'UTC',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setMessage('Notification preferences updated successfully!');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to update preferences');
      }
    } catch (error) {
      setMessage('An error occurred while updating preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
      <p className="text-gray-400 text-sm mb-6">
        Control how and when you receive notifications about activity on your memorials.
      </p>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Email Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={preferences.emailOnNewSympathy}
                onChange={(e) => updatePreference('emailOnNewSympathy', e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div>
                <div className="text-white text-sm font-medium">New sympathy messages</div>
                <div className="text-gray-400 text-xs">Get notified when someone leaves a sympathy on your memorial</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={preferences.emailOnFirstReaction}
                onChange={(e) => updatePreference('emailOnFirstReaction', e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div>
                <div className="text-white text-sm font-medium">First daily reaction</div>
                <div className="text-gray-400 text-xs">Get notified on the first reaction from a unique person each day</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={preferences.emailDailyDigest}
                onChange={(e) => updatePreference('emailDailyDigest', e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div>
                <div className="text-white text-sm font-medium">Daily digest</div>
                <div className="text-gray-400 text-xs">Receive a summary of all activity on your memorials each day</div>
              </div>
            </label>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">SMS Notifications</h4>
          
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={preferences.smsEnabled}
              onChange={(e) => updatePreference('smsEnabled', e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <div>
              <div className="text-white text-sm font-medium">Enable SMS notifications</div>
              <div className="text-gray-400 text-xs">Allow text message notifications (opt-in only)</div>
            </div>
          </label>

          {preferences.smsEnabled && (
            <div className="ml-7 space-y-3">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={preferences.phoneNumber}
                  onChange={(e) => updatePreference('phoneNumber', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Include country code (e.g., +1 for US/Canada)
                </p>
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.smsOnNewSympathy}
                  onChange={(e) => updatePreference('smsOnNewSympathy', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div>
                  <div className="text-white text-sm font-medium">Text for new sympathies</div>
                  <div className="text-gray-400 text-xs">One text per memorial per day, only if activity</div>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={preferences.smsOnFirstReaction}
                  onChange={(e) => updatePreference('smsOnFirstReaction', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-black/20 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div>
                  <div className="text-white text-sm font-medium">Text for first daily reactions</div>
                  <div className="text-gray-400 text-xs">Limited to one text per memorial per day</div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Quiet Hours</h4>
          <p className="text-gray-400 text-sm">
            Notifications during these hours will be delayed until the morning.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="quietStart" className="block text-sm font-medium text-white mb-2">
                Start Time
              </label>
              <select
                id="quietStart"
                value={preferences.quietHoursStart}
                onChange={(e) => updatePreference('quietHoursStart', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quietEnd" className="block text-sm font-medium text-white mb-2">
                End Time
              </label>
              <select
                id="quietEnd"
                value={preferences.quietHoursEnd}
                onChange={(e) => updatePreference('quietHoursEnd', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-white mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => updatePreference('timezone', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Quiet hours: {formatHour(preferences.quietHoursStart)} - {formatHour(preferences.quietHoursEnd)}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Notification Preferences'}
          </Button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('successfully') 
              ? 'bg-green-900/30 border border-green-500/30 text-green-300'
              : 'bg-red-900/30 border border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}