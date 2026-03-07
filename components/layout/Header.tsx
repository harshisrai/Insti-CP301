'use client';

import Link from 'next/link';
import { Bell, MessageCircle, Search, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostingIdentitySelector } from '@/components/features/profile/PostingIdentitySelector';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left section: Logo and menu */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2 font-serif font-bold text-lg md:text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
              R
            </div>
            <span className="hidden sm:inline text-foreground">IIT Ropar</span>
          </Link>
        </div>

        {/* Center section: Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          <Button variant="ghost" size="icon" aria-label="Messages">
            <MessageCircle size={20} />
          </Button>

          <ThemeToggle />

          {user && (
            <>
              <div className="hidden sm:block border-r border-border h-6 mx-2" />
              <PostingIdentitySelector />
              <Link href="/profile" className="ml-1 shrink-0">
                <Avatar className="w-8 h-8 border-2 border-amber-400">
                  <AvatarImage src={user.profilePictureUrl} alt={user.fullName} />
                  <AvatarFallback className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-sm font-medium">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
