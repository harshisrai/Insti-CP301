'use client';

import React from 'react';
import { useLostFound } from '@/lib/hooks/useLostFound';
import { LFItemCard } from './LFItemCard';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function LFItemList() {
    const { items, loading, error, hasMore, loadMore, filters, updateFilters } = useLostFound({ limit: 12 });

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load items: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-border">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto">
                    {(['all', 'lost', 'found'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => updateFilters({ status, category: 'all' })}
                            className={`flex-1 sm:flex-none text-sm font-medium px-6 py-2 rounded-lg transition-all ${filters.status === status || (!filters.status && status === 'all')
                                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64 shrink-0">
                    <SearchX className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items..."
                        value={filters.search || ''}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="pl-9 bg-white dark:bg-zinc-900"
                    />
                </div>
            </div>

            {/* Item Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <LFItemCard key={item.id} item={item} />
                ))}
            </div>

            {/* Loading & Empty States */}
            {loading && items.length === 0 && (
                <div className="flex justify-center p-12 col-span-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="text-center p-16 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10 col-span-full">
                    <SearchX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No items found</h3>
                    <p className="text-sm text-muted-foreground">We couldn't find any lost or found items matching your search criteria.</p>
                </div>
            )}

            {hasMore && (
                <div className="pt-6 flex justify-center col-span-full">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="min-w-[200px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? 'Loading...' : 'Load More Items'}
                    </Button>
                </div>
            )}
        </div>
    );
}
