'use client';

import React from 'react';
import { useCommunities } from '@/lib/hooks/useCommunities';
import { CommunityCard } from './CommunityCard';
import { Button } from '@/components/ui/button';
import { Loader2, Users, SearchX } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function CommunityList() {
    const { communities, loading, error, hasMore, loadMore, filters, updateFilters } = useCommunities({ limit: 12 });

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load communities: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Search */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <SearchX className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search communities..."
                        value={filters.search || ''}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="pl-9 bg-white dark:bg-zinc-900 shadow-sm"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map(community => (
                    <CommunityCard key={community.id} community={community} />
                ))}
            </div>

            {loading && communities.length === 0 && (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && communities.length === 0 && (
                <div className="text-center p-16 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No communities yet</h3>
                    <p className="text-sm text-muted-foreground">Be the first to create a community!</p>
                </div>
            )}

            {hasMore && (
                <div className="pt-6 flex justify-center">
                    <Button variant="outline" onClick={loadMore} disabled={loading} className="min-w-[200px]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
    );
}
