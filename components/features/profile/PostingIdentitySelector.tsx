'use client';

import React from 'react';
import { Check, ChevronsUpDown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIdentities } from '@/lib/hooks/useIdentities';
import { useAuth } from '@/contexts/AuthContext';

interface PostingIdentitySelectorProps {
    className?: string;
    triggerClassName?: string;
}

export function PostingIdentitySelector({ className, triggerClassName }: PostingIdentitySelectorProps) {
    const { user } = useAuth();
    const { positions, selectedIdentityId, setSelectedIdentityId } = useIdentities();

    if (!user) return null;

    // Filter out inactive positions for posting
    const activePositions = positions.filter((p) => p.isActive);

    // If no PORs, show a static "Personal" badge so users know who they're posting as
    if (activePositions.length === 0) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                    Posting as:
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-black/8 dark:border-white/8 h-8">
                    <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground">
                        {user.fullName?.split(' ')[0] || 'Personal'}
                    </span>
                </div>
            </div>
        );
    }

    const selectedTitle = selectedIdentityId
        ? activePositions.find((p) => p.id === selectedIdentityId)?.title + ', ' + activePositions.find((p) => p.id === selectedIdentityId)?.org?.name
        : 'Personal (' + user.role.charAt(0).toUpperCase() + user.role.slice(1) + ')';

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                Posting as:
            </span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        role="combobox"
                        className={cn('w-full sm:w-[220px] justify-between h-8 bg-surface border-black/8 dark:border-white/8', triggerClassName)}
                    >
                        <div className="flex items-center gap-2 truncate">
                            {selectedIdentityId ? (
                                <Shield className="h-3.5 w-3.5 text-accent-gold shrink-0" />
                            ) : (
                                <div className="h-3.5 w-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 border border-black/10 dark:border-white/10" />
                            )}
                            <span className="truncate text-xs font-medium">{selectedTitle}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[260px] max-h-[300px] overflow-y-auto">
                    {/* Base Role Option */}
                    <DropdownMenuItem
                        className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                        onClick={() => setSelectedIdentityId(null)}
                    >
                        <div className="flex items-center w-full justify-between">
                            <span className="font-medium text-sm">Personal Identity</span>
                            {selectedIdentityId === null && <Check className="h-4 w-4 text-accent-gold" />}
                        </div>
                        <span className="text-xs text-muted-foreground">Post as a regular {user.role}</span>
                    </DropdownMenuItem>

                    {activePositions.length > 0 && (
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1">
                            Official Positions
                        </div>
                    )}

                    {/* Active POR Options */}
                    {activePositions.map((position) => (
                        <DropdownMenuItem
                            key={position.id}
                            className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                            onClick={() => setSelectedIdentityId(position.id)}
                        >
                            <div className="flex items-center w-full justify-between">
                                <span className="font-medium text-sm truncate pr-2">
                                    {position.title}
                                </span>
                                {selectedIdentityId === position.id && <Check className="h-4 w-4 text-accent-gold shrink-0" />}
                            </div>
                            <span className="text-xs text-muted-foreground truncate w-full">
                                {position.org?.name}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
