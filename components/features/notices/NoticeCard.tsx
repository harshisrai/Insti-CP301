'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Paperclip, Pin, Clock, ShieldCheck, FileText, Pencil } from 'lucide-react';
import type { Notice } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

// Simple utility to strip markdown for the preview snippet
const stripMarkdown = (markdown: string) => {
    if (!markdown) return '';
    return markdown
        .replace(/#+\s/g, '') // Remove headings
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replace links with text
        .replace(/(\*|_){1,3}([^*_]+)\1{1,3}/g, '$2') // Remove bold/italic
        .replace(/`{1,3}[^`\n]+`{1,3}/g, '') // Remove inline code
        .replace(/>\s?/g, '') // Remove blockquotes
        .replace(/---/g, '') // Remove horizontal rules
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .trim();
};

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface NoticeCardProps {
    notice: Notice;
    compact?: boolean;
}

export function NoticeDialogContent({ notice, isAuthor, authorAvatar, authorInitials, authorName, getPriorityBadgeColor, isDraft }: { notice: Notice, isAuthor: boolean, authorAvatar: string | undefined, authorInitials: string, authorName: string | undefined, getPriorityBadgeColor: (priority: string) => string, isDraft: boolean }) {
    const isUrgent = notice.priority === 'urgent';
    const isHigh = notice.priority === 'high';

    return (
        <DialogContent className="max-w-[95vw] md:max-w-[60vw] overflow-y-auto max-h-[85vh] p-0 gap-0">
            <div className={`p-6 border-b ${isUrgent ? 'border-red-500/20 bg-red-50/10' : isHigh ? 'border-amber-500/20 bg-amber-50/10' : 'border-border/50 bg-black/5 dark:bg-white/5'}`}>
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <Badge variant="secondary" className="capitalize font-semibold">{notice.category.replace('_', ' ')}</Badge>
                        {isDraft && <Badge variant="outline" className="text-amber-600 border-amber-500/50 bg-amber-500/10 uppercase font-bold">Draft</Badge>}
                        <span className="flex items-center text-muted-foreground ml-2">
                            <Clock className="w-3 h-3 mr-1" /> {formatDistanceToNow(new Date(notice.validFrom || notice.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    {isAuthor && (
                        <Button variant="outline" size="sm" asChild className="h-8">
                            <Link href={`/notices/edit/${notice.id}`}>
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                            </Link>
                        </Button>
                    )}
                </div>
                <DialogTitle className="text-2xl font-serif font-bold text-foreground leading-tight mb-4">
                    {notice.title}
                </DialogTitle>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={authorAvatar} />
                        <AvatarFallback className="text-sm font-bold">{authorInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold flex items-center gap-1.5">
                            {authorName}
                            {notice.postingIdentity && <ShieldCheck className="w-4 h-4 text-accent-gold" />}
                        </span>
                        {!notice.postingIdentity && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                {notice.poster?.role}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed space-y-4">
                    <ReactMarkdown>{notice.content}</ReactMarkdown>
                </div>

                {/* Tags and Targeting Information */}
                <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border/50">
                    {notice.tags && notice.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs text-muted-foreground bg-secondary/50 border-transparent">
                            #{tag.toLowerCase()}
                        </Badge>
                    ))}
                </div>

                {/* Attachments within Dialog */}
                {notice.attachments && notice.attachments.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Paperclip className="w-4 h-4" /> Attachments
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {notice.attachments.map((url, i) => (
                                <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/60 border border-border/50 rounded-xl transition-colors group"
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <div className="p-2 bg-background rounded-lg group-hover:bg-accent-cyan/10 group-hover:text-accent-cyan transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium truncate">
                                            {url.split('/').pop() || `Document ${i + 1}`}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    );
}

export function NoticeCard({ notice, compact = false }: NoticeCardProps) {
    const { user } = useAuth();

    const isUrgent = notice.priority === 'urgent';
    const isHigh = notice.priority === 'high';
    const isMedium = notice.priority === 'medium';
    const isDraft = notice.status === 'draft';
    const isAuthor = user?.id === notice.postedBy;

    const getPriorityColors = () => {
        if (isUrgent) return 'border-red-500/50 dark:border-red-500/50 bg-red-50/50 dark:bg-red-950/20';
        if (isHigh) return 'border-amber-500/50 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20';
        if (isMedium) return 'border-blue-500/30 dark:border-blue-500/30';
        return 'border-border/50';
    };

    const getPriorityBadgeColor = () => {
        if (isUrgent) return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-100';
        if (isHigh) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 hover:bg-amber-100';
        if (isMedium) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 hover:bg-blue-100';
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-100';
    };

    // Use posting identity if available, otherwise fallback to the raw author
    const authorName = notice.postingIdentity?.title
        ? `${notice.postingIdentity.title}${notice.postingIdentity.org ? `, ${notice.postingIdentity.org.name}` : ''}`
        : notice.poster?.fullName;

    const authorAvatar = notice.postingIdentity?.org?.logoUrl || notice.poster?.profilePictureUrl;
    const authorInitials = getInitials(authorName || '?');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div role="button" tabIndex={0} className={`text-left p-5 transition-all relative overflow-hidden rounded-xl border hover:shadow-md hover:-translate-y-1 cursor-pointer bg-card h-[280px] flex flex-col ${getPriorityColors()}`}>
                    {/* Urgency edge strip */}
                    {isUrgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                    {isHigh && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}

                    <div className="flex flex-col gap-3 h-full justify-between">
                        {/* Header Area */}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
                                {isDraft && (
                                    <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/50 bg-amber-500/10 text-[10px] tracking-wider uppercase font-bold">
                                        Draft
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="capitalize text-[10px] tracking-wider font-semibold">
                                    {notice.category.replace('_', ' ')}
                                </Badge>
                                {(isUrgent || isHigh || isMedium) && (
                                    <Badge variant="secondary" className={`capitalize text-[10px] tracking-wider font-semibold ${getPriorityBadgeColor()}`}>
                                        {notice.priority}
                                    </Badge>
                                )}
                                {notice.isPinned && (
                                    <span className="flex items-center text-accent-cyan font-medium">
                                        <Pin className="w-3 h-3 mr-1" /> Pinned
                                    </span>
                                )}
                                <span className="flex items-center text-muted-foreground ml-auto">
                                    <Clock className="w-3 h-3 mr-1" /> {formatDistanceToNow(new Date(notice.validFrom || notice.createdAt), { addSuffix: true })}
                                </span>
                            </div>

                            <h3 className="text-lg font-serif font-bold tracking-tight text-foreground line-clamp-2">
                                {notice.title}
                            </h3>
                        </div>

                        {/* Content Preview (Plain Text) */}
                        {!compact && (
                            <div className="line-clamp-3 overflow-hidden text-sm text-muted-foreground flex-1 min-h-0 leading-relaxed max-h-[4.5rem]">
                                {stripMarkdown(notice.content)}
                            </div>
                        )}

                        {/* Footer Area */}
                        <div className="flex items-end justify-between mt-2 pt-3 border-t border-border/50">
                            {/* Author Info */}
                            <div className="flex items-center gap-2 w-fit max-w-[80%]">
                                <Avatar className="h-6 w-6 border border-border">
                                    <AvatarImage src={authorAvatar} />
                                    <AvatarFallback className="text-[10px] font-bold">{authorInitials}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col truncate">
                                    <span className="text-xs font-semibold flex items-center gap-1.5 truncate">
                                        <span className="truncate">{authorName}</span>
                                        {notice.postingIdentity && (
                                            <ShieldCheck className="w-3 h-3 text-accent-gold shrink-0" />
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Attachments / Targeting Indicator */}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {(notice.targetRoles?.length > 0 || notice.targetBatches?.length > 0 || notice.targetDepartments?.length > 0) && (
                                    <ShieldCheck className="w-4 h-4" />
                                )}
                                {notice.attachments && notice.attachments.length > 0 && (
                                    <Paperclip className="w-4 h-4" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            {/* FULL NOTICE DIALOG */}
            <NoticeDialogContent
                notice={notice}
                isAuthor={isAuthor}
                authorAvatar={authorAvatar}
                authorInitials={authorInitials}
                authorName={authorName}
                getPriorityBadgeColor={() => getPriorityBadgeColor()}
                isDraft={isDraft}
            />
        </Dialog>
    );
}
