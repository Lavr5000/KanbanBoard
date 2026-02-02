"use client";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { Board } from "@/widgets/board/ui/Board";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated (only after loading completes)
  useEffect(() => {
    if (!loading && user === null) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121218]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Base gradient layer */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-purple-950/50 via-blue-950/50 to-slate-950/50"></div>

      {/* Animated gradient overlay */}
      <div className="fixed inset-0 -z-10 animate-gradient-shift bg-gradient-to-br from-purple-600/15 via-blue-600/15 to-pink-600/10 bg-[length:400%_400%]"></div>

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[30%] right-[20%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[60%] left-[60%] w-[300px] h-[300px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[10%] right-[40%] w-[250px] h-[250px] bg-cyan-500/10 rounded-full blur-[60px] animate-float"></div>
      </div>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <Sidebar className="hidden md:block" />
      <Board />
    </main>
  );
}
