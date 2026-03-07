'use client';

import React from 'react';
import { useNotices } from '@/lib/hooks/useNotices';
import { NoticeCard } from './NoticeCard';
import { Button } from '@/components/ui/button';
import { Loader2, Megaphone, Filter } from 'lucide-react';

export function NoticeList() {
    const { notices, loading, error, hasMore, loadMore, filters, updateFilters } = useNotices({ limit: 10 });

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load notices: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Optional: Add basic filter controls directly above the list if needed */}
            <div className="flex flex-wrap gap-2 items-center justify-between pb-2 border-b border-border">
                <h2 className="text-sm font-medium text-muted-foreground opacity-70 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Official Announcements
                </h2>
                <div className="flex gap-2">
                    {/* Example of simple filter pills */}
                    {(['all', 'academic', 'administrative', 'general'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => updateFilters({ category: cat })}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filters.category === cat || (!filters.category && cat === 'all')
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {notices.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} />
                ))}
            </div>

            {loading && notices.length === 0 && (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && notices.length === 0 && (
                <div className="text-center p-12 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10">
                    <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium text-foreground">No notices found</h3>
                    <p className="text-sm text-muted-foreground mt-1">There are no official announcements matching your filters.</p>
                </div>
            )}

            {hasMore && (
                <div className="pt-4 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full sm:w-auto min-w-[200px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? 'Loading...' : 'Load Older Notices'}
                    </Button>
                </div>
            )}
        </div>
    );
}
