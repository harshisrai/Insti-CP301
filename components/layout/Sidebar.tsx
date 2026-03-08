'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Calendar,
  ShoppingBag,
  Users,
  Bell,
  MessageCircle,
  Search,
  ExternalLink,
  X,
  Activity,
  BookOpen,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAIN_LINKS = [
  { href: '/', icon: Home, label: 'Feed' },
  { href: '/notices', icon: Megaphone, label: 'Notices' },
  { href: '/blogs', icon: BookOpen, label: 'Blogs' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { href: '/clubs', icon: Activity, label: 'Clubs' },
  { href: '/communities', icon: Users, label: 'Communities' },
  { href: '/map', icon: Search, label: 'Campus Map' },
  { href: '/lost-found', icon: FileText, label: 'Lost & Found' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/quick-links', icon: ExternalLink, label: 'Quick Links' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-sidebar-border">
          <span className="font-serif font-bold text-lg text-sidebar-foreground">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="px-3 space-y-1">
            {MAIN_LINKS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            {/* Admin Link (Only for admins) */}
            {user?.isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="h-px bg-sidebar-border w-full" />
                </div>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <Shield size={18} className={pathname.startsWith('/admin') ? '' : 'text-rose-500'} />
                  Admin Portal
                </Link>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
