"use client";

import { useAuthStore } from "@/stores/auth-store";
import { getInitials } from "@/lib/utils";
import { Shield, Mail, Calendar } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Profile */}
      <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/60">
        <h2 className="text-white font-semibold mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user?.name, user?.email)}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name || "—"}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-xs">
              {user?.subscription?.plan || "FREE"} Plan
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Mail size={15} />
            {user?.email}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Shield size={15} />
            {user?.provider} authentication
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Calendar size={15} />
            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/60">
        <h2 className="text-white font-semibold mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">{user?.subscription?.plan || "FREE"} Plan</p>
            <p className="text-slate-400 text-sm">
              {user?.subscription?.scansUsed ?? 0} / {user?.subscription?.scansLimit ?? 20} scans used
            </p>
          </div>
          {user?.subscription?.plan === "FREE" && (
            <button className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
