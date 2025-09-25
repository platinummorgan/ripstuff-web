"use client";

import { useState } from "react";
import { ContactFormModal } from "./ContactFormModal";

export function SiteFooter() {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] bg-[rgba(4,7,15,0.72)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} RipStuff. All slightly haunted rights reserved.</span>
        <div className="flex flex-wrap gap-4">
          <a href="/guidelines" className="hover:text-white">
            Guidelines
          </a>
          <a href="/privacy" className="hover:text-white">
            Privacy
          </a>
          <button
            onClick={() => setShowContactForm(true)}
            className="hover:text-white cursor-pointer"
          >
            Contact
          </button>
        </div>
      </div>
      
      {showContactForm && (
        <ContactFormModal onClose={() => setShowContactForm(false)} />
      )}
    </footer>
  );
}
