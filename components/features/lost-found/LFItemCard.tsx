import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { MapPin, Calendar, User, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LostFoundItem, LFStatus } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';

interface LFItemCardProps {
    item: LostFoundItem;
}

export function LFItemCard({ item }: LFItemCardProps) {
    const isResolved = item.status === 'claimed' || item.status === 'returned';

    const statusColors: Record<LFStatus, string> = {
        lost: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50',
        found: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50',
        claimed: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
        returned: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
    };

    const StatusIcon = isResolved ? CheckCircle2 : Search;
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
        <Link href={`/lost-found/${item.id}`} className="block group h-full">
            <GlassSurface className={cn(
                'h-full flex flex-col transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/5 hover:-translate-y-1 overflow-hidden',
                isResolved && 'opacity-70 grayscale-[0.2]'
            )}>
                {/* Image / Placeholder */}
                <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-900 border-b border-black/5 dark:border-white/5 shrink-0 overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={item.itemName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                            <Search className="w-12 h-12" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 shadow-sm">
                        <span className={cn(
                            'text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 backdrop-blur-md',
                            statusColors[item.status]
                        )}>
                            <StatusIcon className="w-3 h-3" />
                            {item.status}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <Badge variant="secondary" className="w-fit mb-2 text-[10px] font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors">
                        {item.category.replace('_', ' ')}
                    </Badge>

                    <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-accent-gold transition-colors line-clamp-1 mb-2">
                        {item.itemName}
                    </h3>

                    <div className="space-y-2 mt-auto text-xs text-muted-foreground pt-3 border-t border-border">
                        {item.locationLostFound && (
                            <div className="flex items-start gap-2 line-clamp-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span className="truncate">{item.locationLostFound}</span>
                            </div>
                        )}

                        {item.dateLostFound && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <span>{format(new Date(item.dateLostFound), 'MMM do, yyyy')}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Reported by {item.reporter?.fullName}</span>
                        </div>
                    </div>
                </div>
            </GlassSurface>
        </Link>
    );
}
