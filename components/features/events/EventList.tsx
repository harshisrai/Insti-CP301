'use client';

import React from 'react';
import { useEvents } from '@/lib/hooks/useEvents';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarHeart } from 'lucide-react';

export function EventList() {
    const { events, loading, error, hasMore, loadMore, filters, updateFilters } = useEvents({ limit: 10 });

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load events: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-border">
                <h2 className="text-sm font-medium text-muted-foreground opacity-70 flex items-center gap-2 mr-4 hidden sm:flex">
                    <CalendarHeart className="w-4 h-4" /> Discover Events
                </h2>
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'seminar', 'workshop', 'club_event', 'fest', 'sports'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => updateFilters({ type: cat })}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filters.type === cat || (!filters.type && cat === 'all')
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            {loading && events.length === 0 && (
                <div className="flex justify-center p-12 col-span-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="text-center p-12 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10 col-span-full">
                    <CalendarHeart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium text-foreground">No upcoming events</h3>
                    <p className="text-sm text-muted-foreground mt-1">There are no upcoming events matching your filters right now.</p>
                </div>
            )}

            {hasMore && (
                <div className="pt-4 flex justify-center col-span-full">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full sm:w-auto min-w-[200px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? 'Loading...' : 'Load More Events'}
                    </Button>
                </div>
            )}
        </div>
    );
}
