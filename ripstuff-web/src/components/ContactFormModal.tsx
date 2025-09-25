"use client";

import { useState } from "react";

interface ContactFormModalProps {
  onClose: () => void;
}

export function ContactFormModal({ onClose }: ContactFormModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    try {
      setStatus("sending");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      setStatus("success");
      setTimeout(onClose, 2000); // Close after showing success message
    } catch (err) {
      console.error("Failed to send contact message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#0B1123] border border-[rgba(255,255,255,0.08)] rounded-xl w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.08)]">
          <h3 className="text-lg font-medium">Contact Us</h3>
          <button
            onClick={onClose}
            className="hover:bg-[rgba(255,255,255,0.05)] rounded p-1"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#161f36] border border-[rgba(255,255,255,0.08)] rounded-lg"
              placeholder="What's this about?"
              required
              maxLength={120}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-[#161f36] border border-[rgba(255,255,255,0.08)] rounded-lg resize-none"
              placeholder="Tell us what's on your mind..."
              required
            />
          </div>

          {status === "error" && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {status === "success" && (
            <div className="text-emerald-400 text-sm">Message sent successfully!</div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm hover:bg-[rgba(255,255,255,0.05)] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="px-4 py-2 bg-[var(--accent)] text-black font-medium rounded-lg text-sm hover:bg-[#a3e635] disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}