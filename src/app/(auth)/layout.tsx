import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen animated-gradient grid-pattern flex flex-col items-center justify-center p-6">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 mb-8 group"
      >
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
          <Shield size={20} className="text-white" />
        </div>
        <span className="font-bold text-xl text-white">CodeGuard AI</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md glass rounded-2xl p-8 border border-slate-700/50">
        {children}
      </div>

      <p className="mt-6 text-slate-500 text-xs text-center">
        © {new Date().getFullYear()} CodeGuard AI · All rights reserved
      </p>
    </div>
  );
}
