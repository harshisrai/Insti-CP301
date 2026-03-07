'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

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

      {/* BottomNav's "More" tab opens the same Sidebar */}
      <BottomNav onMoreClick={openSidebar} />
    </div>
  );
}
