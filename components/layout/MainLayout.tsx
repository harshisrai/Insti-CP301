'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // ── Cross-tab sign-out detection ────────────────────────────────
  // If the user signs out in Tab A, Tab B's Supabase auth listener fires
  // 'SIGNED_OUT', which clears the cookie but purposely avoids redirecting
  // (because Next.js struggles with navigations in hidden tabs).
  // When the user switches back to Tab B, this visibility check catches
  // the missing cookie and forces a clean reload to the login screen.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const hasAuth = document.cookie.includes('sb-auth-token');
        if (!hasAuth) {
          window.location.reload();
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={openSidebar} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="flex-1 min-w-0 min-h-[calc(100vh-4rem)] pb-20 md:pb-0">
          <div className="max-w-screen-xl mx-auto px-3 py-4 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      <BottomNav onMoreClick={openSidebar} />
    </div>
  );
}
