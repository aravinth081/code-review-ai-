"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Code2,
  ShieldAlert,
  Bug,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAuthStore } from "@/stores/auth-store";
import { cn, timeAgo, scoreToColor, scoreToHex } from "@/lib/utils";

interface DashboardStats {
  totalReviews: number;
  completedReviews: number;
  totalIssues: number;
  criticalIssues: number;
  avgScore: number;
  scansUsed: number;
  scansLimit: number;
  plan: string;
}

interface RecentReview {
  id: string;
  title: string;
  language: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
  _count: { issues: number };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [trendData, setTrendData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = useAuthStore.getState().tokens?.accessToken;
        const res = await fetch("/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.data.stats);
          setRecentReviews(data.data.recentReviews);
          setTrendData(data.data.trendData);
        }
      } catch {
        // Use empty state
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Reviews",
      value: stats?.totalReviews ?? 0,
      icon: Code2,
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      border: "border-blue-500/20",
    },
    {
      label: "Avg Quality Score",
      value: stats?.avgScore ? `${stats.avgScore}/100` : "—",
      icon: TrendingUp,
      color: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    {
      label: "Issues Found",
      value: stats?.totalIssues ?? 0,
      icon: Bug,
      color: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
      border: "border-amber-500/20",
    },
    {
      label: "Critical Alerts",
      value: stats?.criticalIssues ?? 0,
      icon: ShieldAlert,
      color: "from-red-500/20 to-red-600/5",
      iconColor: "text-red-400",
      border: "border-red-500/20",
    },
  ];

  const statusIcon = (status: string) => {
    if (status === "COMPLETED") return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (status === "FAILED") return <XCircle size={14} className="text-red-400" />;
    if (status === "PROCESSING") return <Loader2 size={14} className="text-blue-400 animate-spin" />;
    return <Clock size={14} className="text-slate-500" />;
  };

  const langColors: Record<string, string> = {
    javascript: "text-yellow-400 bg-yellow-500/10",
    typescript: "text-blue-400 bg-blue-500/10",
    python: "text-green-400 bg-green-500/10",
    java: "text-orange-400 bg-orange-500/10",
    go: "text-cyan-400 bg-cyan-500/10",
    rust: "text-orange-300 bg-orange-500/10",
    php: "text-purple-400 bg-purple-500/10",
    csharp: "text-violet-400 bg-violet-500/10",
    c: "text-slate-400 bg-slate-500/10",
    cpp: "text-pink-400 bg-pink-500/10",
  };

  const scansPercent = stats
    ? Math.min((stats.scansUsed / stats.scansLimit) * 100, 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            {user?.name?.split(" ")[0] || "Developer"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here&apos;s your code quality overview
          </p>
        </div>
        <Link
          href="/reviews/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Review
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-5 rounded-2xl border bg-gradient-to-br card-hover",
              card.color,
              card.border
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center", card.iconColor)}>
                <card.icon size={20} />
              </div>
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse mb-1" />
              ) : (
                <div className="text-2xl font-bold text-white">{card.value}</div>
              )}
              <div className="text-slate-400 text-sm">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          className="lg:col-span-2 p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold">Code Quality Trend</h2>
            <span className="text-xs text-slate-500">Last 30 days</span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="overallScore"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Overall"
                />
                <Line
                  type="monotone"
                  dataKey="securityScore"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={false}
                  name="Security"
                />
                <Line
                  type="monotone"
                  dataKey="qualityScore"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  name="Quality"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3Icon className="mx-auto text-slate-700 mb-3" size={40} />
                <p className="text-slate-500 text-sm">Run your first review to see trends</p>
                <Link href="/reviews/new" className="text-blue-400 text-sm hover:text-blue-300 mt-2 inline-block">
                  Start a review →
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* Scans usage */}
        <motion.div
          className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-white font-semibold mb-6">Monthly Usage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Scans Used</span>
                <span className="text-white font-medium">
                  {stats?.scansUsed ?? 0}/{stats?.scansLimit ?? 20}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    scansPercent >= 90 ? "bg-red-500" : scansPercent >= 70 ? "bg-amber-500" : "bg-blue-500"
                  )}
                  initial={{ width: "0%" }}
                  animate={{ width: `${scansPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.scansLimit && stats.scansLimit - (stats?.scansUsed ?? 0)} scans remaining this month
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/60 space-y-3">
              {[
                { label: "Completed", value: stats?.completedReviews ?? 0, color: "text-emerald-400" },
                { label: "Issues Found", value: stats?.totalIssues ?? 0, color: "text-amber-400" },
                { label: "Critical Issues", value: stats?.criticalIssues ?? 0, color: "text-red-400" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className={cn("font-semibold text-sm", item.color)}>
                    {loading ? "—" : item.value}
                  </span>
                </div>
              ))}
            </div>

            {stats?.plan === "FREE" && (
              <Link
                href="/settings/billing"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-colors"
              >
                Upgrade for Unlimited Scans
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent reviews */}
      <motion.div
        className="rounded-2xl border border-slate-800/60 bg-slate-900/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h2 className="text-white font-semibold">Recent Reviews</h2>
          <Link
            href="/reviews"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-800/60">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="flex-1" />
                <div className="h-4 w-16 bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : recentReviews.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Code2 size={32} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">No reviews yet</p>
            <Link
              href="/reviews/new"
              className="text-blue-400 text-sm hover:text-blue-300 mt-2 inline-block"
            >
              Start your first review →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentReviews.map((review) => (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusIcon(review.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                    {review.title}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {timeAgo(review.createdAt)}
                  </p>
                </div>

                <span
                  className={cn(
                    "px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0",
                    langColors[review.language] || "text-slate-400 bg-slate-500/10"
                  )}
                >
                  {review.language}
                </span>

                <span className="text-xs text-slate-500 flex-shrink-0">
                  {review._count.issues} issues
                </span>

                {review.overallScore !== null && (
                  <span
                    className={cn(
                      "text-sm font-bold flex-shrink-0",
                      scoreToColor(review.overallScore)
                    )}
                  >
                    {review.overallScore}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function BarChart3Icon({ className, size }: { className?: string; size?: number }) {
  return <TrendingUp className={className} size={size} />;
}
