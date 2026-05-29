"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Bug,
  Zap,
  Code2,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, timeAgo, severityToColor, issueTypeToColor, scoreToHex, scoreToColor } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Review } from "@/types/review";
import { toast } from "sonner";

const issueTypeIcon: Record<string, React.ElementType> = {
  BUG: Bug,
  SECURITY: Shield,
  PERFORMANCE: Zap,
  QUALITY: Code2,
  BEST_PRACTICE: BookOpen,
};

function ScoreRing({
  score,
  label,
  size = 80,
}: {
  score: number;
  label: string;
  size?: number;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = scoreToHex(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={8}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 text-center">{label}</span>
    </div>
  );
}

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tokens } = useAuthStore();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"issues" | "optimized" | "recommendations">("issues");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchReview() {
      try {
        const res = await fetch(`/api/reviews/${params.id}`, {
          headers: { Authorization: `Bearer ${tokens?.accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReview(data.data);
        } else {
          router.push("/reviews");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReview();
  }, [params.id, tokens, router]);

  async function copyCode(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Code copied!");
  }

  function toggleIssue(id: string) {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-400 mx-auto mb-3" />
          <p className="text-slate-400">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const isCompleted = review.status === "COMPLETED";
  const criticalCount = review.issues.filter((i) => i.severity === "CRITICAL").length;
  const highCount = review.issues.filter((i) => i.severity === "HIGH").length;
  const securityIssues = review.issues.filter((i) => i.type === "SECURITY").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-1 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{review.title}</h1>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                review.status === "COMPLETED"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : review.status === "FAILED"
                  ? "bg-red-500/20 text-red-400"
                  : review.status === "PROCESSING"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-slate-500/20 text-slate-400"
              )}
            >
              {review.status === "COMPLETED" ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={10} /> Completed
                </span>
              ) : review.status === "FAILED" ? (
                <span className="flex items-center gap-1">
                  <XCircle size={10} /> Failed
                </span>
              ) : review.status === "PROCESSING" ? (
                <span className="flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" /> Processing
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock size={10} /> Pending
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="capitalize">{review.language}</span>
            <span>•</span>
            <span>{timeAgo(review.createdAt)}</span>
            {review.aiModel && (
              <>
                <span>•</span>
                <span className="text-slate-500">{review.aiProvider}/{review.aiModel}</span>
              </>
            )}
            {review.processingTime && (
              <>
                <span>•</span>
                <span className="text-slate-500">{(review.processingTime / 1000).toFixed(1)}s</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => toast.info("PDF export coming soon!")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white text-sm transition-colors"
        >
          <Download size={15} />
          Export
        </button>
      </div>

      {isCompleted && review.overallScore != null && (
        <>
          {/* Score cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overall score */}
            <div className="md:col-span-2 lg:col-span-1 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-6">
              <ScoreRing score={review.overallScore as number} label="" size={100} />
              <div>
                <p className="text-slate-400 text-sm mb-1">Overall Score</p>
                <p className={cn("text-4xl font-bold", scoreToColor(review.overallScore as number))}>
                  {review.overallScore}<span className="text-slate-500 text-xl">/100</span>
                </p>
                <p className="text-slate-400 text-xs mt-2 max-w-xs">
                  {review.summary}
                </p>
              </div>
            </div>

            {/* Sub scores */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Quality", score: review.qualityScore },
                  { label: "Security", score: review.securityScore },
                  { label: "Performance", score: review.performanceScore },
                  { label: "Maintainability", score: review.maintainabilityScore },
                ].map((s) =>
                  s.score !== null && s.score !== undefined ? (
                    <ScoreRing key={s.label} score={s.score} label={s.label} size={72} />
                  ) : null
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Issues", value: review.issues.length, color: "text-white" },
              { label: "Critical", value: criticalCount, color: criticalCount > 0 ? "text-red-400" : "text-slate-400" },
              { label: "High Severity", value: highCount, color: highCount > 0 ? "text-orange-400" : "text-slate-400" },
              { label: "Security Issues", value: securityIssues, color: securityIssues > 0 ? "text-orange-400" : "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
                <div className={cn("text-2xl font-bold mb-1", s.color)}>{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-800/60 w-fit">
        {[
          { id: "issues", label: `Issues (${review.issues.length})` },
          { id: "optimized", label: "Optimized Code" },
          { id: "recommendations", label: `Recommendations (${review.recommendations.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === t.id
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "issues" && (
        <div className="space-y-3">
          {review.issues.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-emerald-400 font-semibold">No issues found!</p>
              <p className="text-slate-400 text-sm mt-1">Your code looks great.</p>
            </div>
          ) : (
            review.issues.map((issue) => {
              const Icon = issueTypeIcon[issue.type] || Bug;
              const isExpanded = expandedIssues.has(issue.id);
              return (
                <motion.div
                  key={issue.id}
                  layout
                  className="rounded-xl border border-slate-800/60 bg-slate-900/60 overflow-hidden"
                >
                  <button
                    onClick={() => toggleIssue(issue.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors text-left"
                  >
                    <div className={cn("p-2 rounded-lg", issueTypeToColor(issue.type))}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-semibold border",
                            severityToColor(issue.severity)
                          )}
                        >
                          {issue.severity}
                        </span>
                        <span className="text-xs text-slate-500">{issue.type.replace("_", " ")}</span>
                        {issue.lineStart && (
                          <span className="text-xs text-slate-600">
                            Line {issue.lineStart}{issue.lineEnd !== issue.lineStart ? `–${issue.lineEnd}` : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium">{issue.title}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-3 border-t border-slate-800/60">
                      <p className="text-slate-400 text-sm pt-3">{issue.description}</p>

                      {issue.suggestion && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <p className="text-blue-300 text-xs font-medium mb-1">💡 Suggestion</p>
                          <p className="text-slate-300 text-sm">{issue.suggestion}</p>
                        </div>
                      )}

                      {issue.fixedCode && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-emerald-400 text-xs font-medium">✅ Fixed Code</p>
                            <button
                              onClick={() => copyCode(issue.fixedCode!, issue.id)}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              {copiedId === issue.id ? <Check size={12} /> : <Copy size={12} />}
                              {copiedId === issue.id ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <pre className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-sm font-code text-slate-300 overflow-x-auto">
                            <code>{issue.fixedCode}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "optimized" && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60">
            <span className="text-slate-300 text-sm font-medium">Optimized Code</span>
            {review.optimizedCode && (
              <button
                onClick={() => copyCode(review.optimizedCode!, "optimized")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copiedId === "optimized" ? <Check size={12} /> : <Copy size={12} />}
                {copiedId === "optimized" ? "Copied!" : "Copy all"}
              </button>
            )}
          </div>
          {review.optimizedCode ? (
            <pre className="p-5 text-sm font-code text-slate-300 overflow-x-auto max-h-[600px] overflow-y-auto">
              <code>{review.optimizedCode}</code>
            </pre>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              No optimized code available
            </div>
          )}
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="space-y-3">
          {review.recommendations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-800/60">
              <p className="text-slate-500 text-sm">No recommendations</p>
            </div>
          ) : (
            review.recommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-slate-800/60 bg-slate-900/60"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {rec.priority}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium">{rec.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-400 text-xs">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{rec.description}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Source code */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60">
          <span className="text-slate-300 text-sm font-medium">
            Source Code {review.fileName && `— ${review.fileName}`}
          </span>
          <button
            onClick={() => copyCode(review.sourceCode, "source")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copiedId === "source" ? <Check size={12} /> : <Copy size={12} />}
            {copiedId === "source" ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="p-5 text-sm font-code text-slate-300 overflow-x-auto max-h-80 overflow-y-auto">
          <code>{review.sourceCode}</code>
        </pre>
      </div>
    </div>
  );
}
