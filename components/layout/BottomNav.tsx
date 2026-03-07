'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Megaphone, Search, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/notices', label: 'Notices', icon: Megaphone },
  { href: '/lost-found', label: 'L&F', icon: Search },
];

interface BottomNavProps {
  onMoreClick?: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40 pb-safe">
      <div className="flex items-center justify-around px-1 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[56px] rounded-lg transition-colors',
                isActive
                  ? 'text-amber-500'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* More button → opens the Sidebar */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[56px] rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium leading-tight">More</span>
        </button>
      </div>
    </nav>
  );
}
