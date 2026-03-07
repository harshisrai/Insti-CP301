import React from 'react';
import { cn } from '@/lib/utils';
import type { UserPosition } from '@/lib/types';

interface PositionBadgeProps {
    position: UserPosition;
    className?: string;
}

export function PositionBadge({ position, className }: PositionBadgeProps) {
    // Determine if it's a prominent board/gymkhana or a regular club position
    const isHighLevel = ['governance_body', 'board'].includes(position.org?.type || '');

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                position.isActive
                    ? isHighLevel
                        ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/50'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/50'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
                className
            )}
        >
            <span className="truncate max-w-[200px]">
                {position.title}, {position.org?.name || 'Unknown Organization'}
            </span>
            {!position.isActive && (
                <span className="text-[10px] opacity-70 ml-1">(Past)</span>
            )}
        </div>
    );
}
