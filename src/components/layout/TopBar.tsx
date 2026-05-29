"use client";

import { Bell, Search, Sun, Moon, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-xl flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Title */}
      {title && (
        <h1 className="text-white font-semibold text-sm hidden md:block">
          {title}
        </h1>
      )}

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search reviews, files..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500/50 focus:text-white transition-colors"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </Link>

        {/* Brand mark */}
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Shield size={15} className="text-white" />
        </div>
      </div>
    </header>
  );
}
