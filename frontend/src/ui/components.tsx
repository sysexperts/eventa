import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-500 outline-none transition-colors focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-accent-500/30 ${
        props.className || ""
      }`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-surface-500 outline-none transition-colors focus:border-accent-500/50 focus:bg-white/[0.08] focus:ring-1 focus:ring-accent-500/30 ${
        props.className || ""
      }`}
    />
  );
}

export function Button({ variant, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base = "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200";
  const v =
    variant === "ghost"
      ? "bg-white/5 text-surface-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
      : "bg-gradient-to-r from-accent-500 to-purple-600 text-white hover:from-accent-400 hover:to-purple-500 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:scale-[1.02]";
  return <button {...props} className={`${base} ${v} ${props.className || ""}`} />;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">{children}</div>;
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-1.5 text-xs font-medium text-surface-400 ${className || ""}`}>{children}</div>;
}
