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

  // ── Stale-tab recovery ──────────────────────────────────────────
  // When the browser tab is hidden (even briefly), the keepalive TCP
  // connection and/or Turbopack HMR chunks can become stale. Next.js's
  // client-side router reuses these for RSC payload fetches, causing
  // navigation to hang — the server responds 200 but the client never
  // processes it.
  //
  // Standard production pattern (used by Vercel, Linear, Notion):
  //   router.refresh() on every visibility change to "visible".
  //
  // Safety net: for 3s after tab return, force hard navigation on
  // link clicks in case the refresh hasn't settled yet.
  useEffect(() => {
    let forceHardNavUntil: number | null = null;

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Check if signed out from another tab (cookie cleared)
        const hasAuth = document.cookie.includes('sb-auth-token');
        if (!hasAuth) {
          // Session gone — hard reload. Proxy redirects to /login.
          window.location.reload();
          return;
        }
        router.refresh();
        forceHardNavUntil = Date.now() + 3_000;
      }
    };

    const onLinkClick = (e: MouseEvent) => {
      if (!forceHardNavUntil || Date.now() > forceHardNavUntil) {
        forceHardNavUntil = null;
        return;
      }

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

      // Force hard navigation — fresh TCP connection, fresh chunks
      e.preventDefault();
      e.stopPropagation();
      forceHardNavUntil = null;
      window.location.href = href;
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('click', onLinkClick, true);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('click', onLinkClick, true);
    };
  }, [router]);

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
