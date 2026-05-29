"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Code2,
  Upload,
  Archive,
  GitBranch,
  Play,
  Loader2,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/types/review";
import { useAuthStore } from "@/stores/auth-store";

const TABS = [
  { id: "paste", label: "Paste Code", icon: Code2 },
  { id: "file", label: "Upload File", icon: Upload },
  { id: "zip", label: "Upload ZIP", icon: Archive },
  { id: "github", label: "GitHub", icon: GitBranch },
];

export default function NewReviewPage() {
  const router = useRouter();
  const { tokens } = useAuthStore();
  const [tab, setTab] = useState("paste");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);

    // Auto-detect language from extension
    const ext = f.name.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript", ts: "typescript", py: "python",
      java: "java", c: "c", cpp: "cpp", cs: "csharp",
      php: "php", go: "go", rs: "rust",
    };
    if (ext && langMap[ext]) setLanguage(langMap[ext]);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      if (!title) setTitle(f.name);
    };
    reader.readAsText(f);
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [".js", ".ts", ".py", ".java", ".c", ".cpp", ".cs", ".php", ".go", ".rs"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  async function handleSubmit() {
    if (!title.trim()) return toast.error("Please enter a review title");
    if (!code.trim()) return toast.error("Please provide code to review");
    if (code.length < 10) return toast.error("Code is too short to analyze");

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({
          title,
          language,
          sourceType:
            tab === "paste"
              ? "PASTE"
              : tab === "file"
              ? "FILE_UPLOAD"
              : tab === "zip"
              ? "ZIP_UPLOAD"
              : "GITHUB_IMPORT",
          sourceCode: code,
          fileName: file?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create review");
        return;
      }

      toast.success("Review completed!");
      router.push(`/reviews/${data.data.id}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">New Code Review</h1>
        <p className="text-slate-400 text-sm mt-1">
          Paste your code or upload a file to start an AI-powered analysis
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-800/60 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Review Title
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. User authentication module"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 text-sm transition-colors"
            />
          </div>

          {/* Code input */}
          {tab === "paste" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Code
              </label>
              <div className="relative">
                <textarea
                  id="code-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={20}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 placeholder-slate-700 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 text-sm font-code resize-none transition-colors"
                />
                {code && (
                  <button
                    onClick={() => setCode("")}
                    className="absolute top-3 right-3 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {code.length.toLocaleString()} characters
              </p>
            </div>
          )}

          {(tab === "file" || tab === "zip") && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {tab === "zip" ? "ZIP Archive" : "Source File"}
              </label>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-700 hover:border-slate-600 bg-slate-900/30"
                )}
              >
                <input {...getInputProps()} />
                <Upload
                  size={32}
                  className={cn(
                    "mx-auto mb-4",
                    isDragActive ? "text-blue-400" : "text-slate-600"
                  )}
                />
                {file ? (
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {(file.size / 1024).toFixed(1)} KB · Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 font-medium mb-1">
                      {isDragActive ? "Drop the file here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {tab === "zip" ? "ZIP archives up to 10MB" : ".js .ts .py .java .c .cpp .cs .php .go .rs"}
                    </p>
                  </div>
                )}
              </div>

              {code && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  ✓ File loaded ({code.length.toLocaleString()} characters)
                </div>
              )}
            </div>
          )}

          {tab === "github" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 text-sm transition-colors"
                />
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
                <p className="font-medium mb-1">GitHub Integration</p>
                <p className="text-slate-400 text-xs">
                  Connect your GitHub account in Settings to import repositories directly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar options */}
        <div className="space-y-4">
          {/* Language */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Programming Language
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium transition-all text-left",
                    language === lang.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-white"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis info */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-3">
            <h3 className="text-sm font-medium text-slate-300">Analysis Includes</h3>
            {[
              { emoji: "🐛", label: "Bug Detection" },
              { emoji: "🔒", label: "Security Scan" },
              { emoji: "⚡", label: "Performance" },
              { emoji: "✨", label: "Code Quality" },
              { emoji: "📏", label: "Best Practices" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-slate-400">
                <span>{item.emoji}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Submit */}
          <motion.button
            id="submit-review"
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing Code...
              </>
            ) : (
              <>
                <Play size={16} />
                Start AI Review
              </>
            )}
          </motion.button>

          {loading && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 text-center">
              AI is analyzing your code...
              <br />This usually takes 5–15 seconds
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
