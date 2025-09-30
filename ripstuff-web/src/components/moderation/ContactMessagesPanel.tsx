"use client";

import { useState, useEffect } from "react";
// Simple date formatting helper instead of date-fns
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

interface ContactMessage {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  moderatorNotes: string | null;
}

export function ContactMessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/moderation/contact-messages");
      
      if (response.status === 401) {
        setError("Unauthorized - please log in as a moderator");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load contact messages";
      setError(`Error: ${errorMessage}`);
      console.error("Contact messages fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleResolve = async (messageId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/moderation/contact-messages/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error("Failed to resolve message");
      
      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error("Failed to resolve message:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <div className="mb-4">{error}</div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchMessages();
          }}
          className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[#a3e635]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contact Messages</h2>
        <span className="text-sm text-[var(--muted)]">
          {messages.filter(m => m.status === "UNREAD").length} unread
        </span>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg border ${
              message.status === "UNREAD"
                ? "bg-[#161f36] border-[rgba(255,255,255,0.12)]"
                : "bg-[#111a30] border-[rgba(255,255,255,0.08)]"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-medium">
                  {message.subject}
                  {message.status === "UNREAD" && (
                    <span className="ml-2 text-xs bg-[var(--accent)] text-black px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {formatDistanceToNow(new Date(message.createdAt))} ago
                </p>
              </div>
              {message.status === "UNREAD" && (
                <button
                  onClick={() => handleResolve(message.id)}
                  className="px-2 py-1 text-sm bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] rounded"
                >
                  Mark as Read
                </button>
              )}
            </div>

            <div className="mt-3 text-sm whitespace-pre-wrap">{message.message}</div>

            {message.moderatorNotes && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
                <p className="text-sm font-medium mb-1">Moderator Notes:</p>
                <p className="text-sm text-[var(--muted)]">{message.moderatorNotes}</p>
              </div>
            )}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-8 text-[var(--muted)]">
            No contact messages yet
          </div>
        )}
      </div>
    </div>
  );
}