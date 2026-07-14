import type React from "react";

export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium bg-linear-to-br from-pink-800 to-pink-500 hover:opacity-90 active:scale-95 transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const GhostButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium border border-pink-500/50 bg-white/3 hover:bg-white/6 backdrop-blur-sm active:scale-95 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);
