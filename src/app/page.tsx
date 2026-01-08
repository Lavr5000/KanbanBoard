"use client";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { Board } from "@/widgets/board/ui/Board";
import { MobileBoard } from "@/widgets/board/ui/MobileBoard";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

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

  // Mobile layout
  if (isMobile) {
    return <MobileBoard />;
  }

  // Desktop layout
  return (
    <main className="flex min-h-screen bg-[#121218]">
      <Sidebar />
      <Board />
    </main>
  );
}
