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
      ? "bg-white/5 text-surface-300 hover:bg-white/10 hover:text-white border border-white/10"
      : "bg-accent-500 text-white hover:bg-accent-400 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30";
  return <button {...props} className={`${base} ${v} ${props.className || ""}`} />;
}

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-xs font-medium text-surface-400">{children}</div>;
}
