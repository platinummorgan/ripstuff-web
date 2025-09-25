"use client";

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "secondary";
  icon?: ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, icon, children, asChild = false, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(4,7,15,0.6)]";

    const variants: Record<Exclude<ButtonProps["variant"], undefined>, string> = {
      primary: "bg-[var(--accent)] text-black hover:bg-white",
      secondary: "bg-[rgba(255,255,255,0.12)] text-white hover:bg-[rgba(255,255,255,0.18)]",
      ghost: "bg-transparent text-[var(--muted)] hover:text-white",
    };

    if (asChild) {
      // For asChild usage, return a simple button and let the consumer handle the rendering
      return (
        <button ref={ref} className={twMerge(base, variants[variant], className)} {...props}>
          {icon}
          {children}
        </button>
      );
    }

    return (
      <button ref={ref} className={twMerge(base, variants[variant], className)} {...props}>
        {icon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
