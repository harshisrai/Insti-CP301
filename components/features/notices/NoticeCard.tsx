import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { Pin, Calendar, FileText, Bell, AlertTriangle, AlertCircle, Info, Paperclip, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notice, NoticePriority } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

// Maps priority to CSS classes and icons
const PRIORITY_CONFIG: Record<NoticePriority, { classes: string; icon: React.ReactNode; label: string }> = {
    urgent: {
        classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: 'Urgent',
    },
    high: {
        classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        label: 'High',
    },
    medium: {
        classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
        icon: <Bell className="w-3.5 h-3.5" />,
        label: 'Medium',
    },
    low: {
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30',
        icon: <Info className="w-3.5 h-3.5" />,
        label: 'Standard',
    },
};

interface NoticeCardProps {
    notice: Notice;
    compact?: boolean;
}

export function NoticeCard({ notice, compact = false }: NoticeCardProps) {
    const pConfig = PRIORITY_CONFIG[notice.priority] || PRIORITY_CONFIG.low;

    // Decide who the author is based on posting identity
    const authorName = notice.postingIdentity ? notice.postingIdentity.title : notice.poster?.fullName;
    const authorSubName = notice.postingIdentity ? notice.postingIdentity.org?.name : notice.poster?.role;
    const authorAvatar = notice.postingIdentity?.org?.logoUrl || notice.poster?.profilePictureUrl;
    const showOfficialBadge = !!notice.postingIdentity;

    return (
        <GlassSurface className={cn(
            'group relative overflow-hidden flex flex-col transition-all',
            compact ? 'p-4' : 'p-5 sm:p-6',
            notice.isPinned && 'border-accent-gold/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)] dark:shadow-[0_0_15px_-3px_rgba(245,158,11,0.05)]'
        )}>
            {/* Pinned visual indicator stripe */}
            {notice.isPinned && (
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold" />
            )}

            {/* Header Row: Title and Badges */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        {notice.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
                                <Pin className="w-3 h-3 fill-current" /> Pinned
                            </span>
                        )}
                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border', pConfig.classes)}>
                            {pConfig.icon} {pConfig.label}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {notice.category.replace('_', ' ')}
                        </span>
                    </div>

                    <h3 className={cn(
                        'font-serif font-bold text-foreground group-hover:text-accent-gold transition-colors line-clamp-2',
                        compact ? 'text-lg' : 'text-xl'
                    )}>
                        {notice.title}
                    </h3>
                </div>
            </div>

            {/* Content Excerpt (only if not compact) */}
            {!compact && (
                <div className="text-sm text-foreground/80 mb-4 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                </div>
            )}

            {/* Footer Details */}
            <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-black/5 dark:border-white/5 pt-4">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                    <Avatar className={cn(compact ? 'h-8 w-8' : 'h-10 w-10', showOfficialBadge && 'border-2 border-accent-gold/50')}>
                        <AvatarImage src={authorAvatar} alt={authorName} className="object-cover" />
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-xs text-muted-foreground">
                            {getInitials(authorName || 'User')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold truncate text-foreground">{authorName}</span>
                            {showOfficialBadge && (
                                <div className="w-3 h-3 rounded-full bg-accent-gold/20 flex items-center justify-center shrink-0" title="Official Organization Notice">
                                    <div className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                            {authorSubName && <span className="capitalize">{authorSubName}</span>}
                            <span>•</span>
                            <span className="flex items-center gap-1 shrink-0">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action/Meta area */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    {/* Tags */}
                    {!compact && notice.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 hidden lg:flex">
                            {notice.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                    #{tag}
                                </span>
                            ))}
                            {notice.tags.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">+{notice.tags.length - 2}</span>
                            )}
                        </div>
                    )}

                    {/* Attachments indicator */}
                    {notice.attachments && notice.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
                            <Paperclip className="w-3 h-3" />
                            {notice.attachments.length} file{notice.attachments.length > 1 ? 's' : ''}
                        </span>
                    )}

                    {/* If we needed a dedicated detail view later, this button would link there. For now, it expands content inline or just acts as a visual affordance. */}
                    <Link href={`#`} className="p-2 -mr-2 text-muted-foreground hover:text-accent-gold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors hidden sm:block">
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </GlassSurface>
    );
}
