import React from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, AlertCircle } from 'lucide-react';
import { Notice } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { formatDistanceToNow } from 'date-fns';
import { cn, getInitials } from '@/lib/utils';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { NoticeDialogContent } from '@/components/features/notices/NoticeCard';
import { useAuth } from '@/contexts/AuthContext';

interface RecentNoticesWidgetProps {
    notices: Notice[];
}

export function RecentNoticesWidget({ notices }: RecentNoticesWidgetProps) {
    const { user } = useAuth();

    if (notices.length === 0) return null;

    return (
        <GlassSurface className="p-5 flex flex-col pt-4 border-blue-500/10 dark:border-blue-400/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                    <Bell className="text-blue-500 w-5 h-5" />
                    Recent Notices
                </h3>
                <Link href="/notices" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    View all <ChevronRight size={14} />
                </Link>
            </div>

            <div className="space-y-1">
                {notices.map((notice) => {
                    const isAuthor = user?.id === notice.postedBy;
                    const authorName = notice.postingIdentity?.title
                        ? `${notice.postingIdentity.title}${notice.postingIdentity.org ? `, ${notice.postingIdentity.org.name}` : ''}`
                        : notice.poster?.fullName;
                    const authorAvatar = notice.postingIdentity?.org?.logoUrl || notice.poster?.profilePictureUrl;
                    const authorInitials = getInitials(authorName || '?');
                    const isDraft = notice.status === 'draft';

                    const getPriorityBadgeColor = () => {
                        if (notice.priority === 'urgent') return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-100';
                        if (notice.priority === 'high') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 hover:bg-amber-100';
                        if (notice.priority === 'medium') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 hover:bg-blue-100';
                        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-100';
                    };

                    return (
                        <Dialog key={notice.id}>
                            <DialogTrigger asChild>
                                <button className="w-full text-left block group">
                                    <div className="py-2.5 px-3 -mx-3 rounded-lg hover:bg-blue-500/5 transition-colors border border-transparent hover:border-blue-500/20">
                                        <div className="flex items-start gap-2.5">
                                            <AlertCircle
                                                size={16}
                                                className={cn(
                                                    "mt-0.5 shrink-0 transition-colors",
                                                    notice.priority === 'urgent' ? 'text-destructive' :
                                                        notice.priority === 'high' ? 'text-amber-500' :
                                                            'text-blue-500'
                                                )}
                                            />
                                            <div className="space-y-1">
                                                <h4 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {notice.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span className="capitalize">{notice.category.replace('_', ' ')}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span>{formatDistanceToNow(new Date(notice.validFrom || notice.createdAt), { addSuffix: true })}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </DialogTrigger>
                            <NoticeDialogContent
                                notice={notice}
                                isAuthor={isAuthor}
                                authorAvatar={authorAvatar}
                                authorInitials={authorInitials}
                                authorName={authorName}
                                getPriorityBadgeColor={getPriorityBadgeColor}
                                isDraft={isDraft}
                            />
                        </Dialog>
                    );
                })}
            </div>
        </GlassSurface>
    );
}
