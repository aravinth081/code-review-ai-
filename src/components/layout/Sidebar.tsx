"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Code2,
  GitBranch,
  Users,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const navigation = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/reviews", icon: Code2, label: "Code Reviews" },
      { href: "/repositories", icon: GitBranch, label: "Repositories" },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { href: "/teams", icon: Users, label: "Teams" },
      { href: "/reports", icon: FileText, label: "Reports" },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/notifications", icon: Bell, label: "Notifications" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  }

  const plan = user?.subscription?.plan || "FREE";
  const planColors: Record<string, string> = {
    FREE: "text-slate-400 bg-slate-800",
    PRO: "text-blue-400 bg-blue-500/10",
    ENTERPRISE: "text-purple-400 bg-purple-500/10",
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] flex flex-col border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800/60">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">CodeGuard AI</span>
            <div className={cn("text-xs px-1.5 py-0.5 rounded-md font-medium inline-block ml-2", planColors[plan])}>
              {plan}
            </div>
          </div>
        </Link>
      </div>

      {/* New Review CTA */}
      <div className="px-4 pt-4">
        <Link
          href="/reviews/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Sparkles size={15} />
          New Review
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "sidebar-nav-item",
                      isActive && "active"
                    )}
                  >
                    <item.icon size={17} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight size={14} className="opacity-60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Upgrade banner (for free users) */}
      {plan === "FREE" && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <p className="text-white text-xs font-semibold mb-1">Upgrade to Pro</p>
          <p className="text-slate-400 text-xs mb-2">Unlimited scans + GitHub integration</p>
          <Link
            href="/settings/billing"
            className="flex items-center gap-1 text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors"
          >
            <CreditCard size={11} />
            View plans
          </Link>
        </div>
      )}

      {/* Bottom: Settings + User */}
      <div className="border-t border-slate-800/60 p-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn("sidebar-nav-item", pathname.startsWith("/settings") && "active")}
        >
          <Settings size={17} />
          Settings
        </Link>

        {/* User profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/40 cursor-pointer group transition-colors mt-1">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name || ""}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              getInitials(user?.name, user?.email)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
