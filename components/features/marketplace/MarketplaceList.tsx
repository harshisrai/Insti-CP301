'use client';

import React from 'react';
import { useMarketplace } from '@/lib/hooks/useMarketplace';
import { MarketplaceCard } from './MarketplaceCard';
import { Button } from '@/components/ui/button';
import { Loader2, SearchX, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ItemCategory } from '@/lib/types';

const CATEGORIES: { value: ItemCategory | 'all', label: string }[] = [
    { value: 'all', label: 'All Items' },
    { value: 'cycle', label: 'Cycles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'books', label: 'Books & Academics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'sports', label: 'Sports Equip.' },
    { value: 'stationery', label: 'Stationery' },
    { value: 'other', label: 'Other' },
];

export function MarketplaceList() {
    const { items, loading, error, hasMore, loadMore, filters, updateFilters } = useMarketplace({ limit: 12 });

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load marketplace items: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in flex flex-col md:flex-row gap-8">

            {/* Sidebar Filters */}
            <div className="md:w-64 shrink-0 space-y-6">
                <div className="sticky top-24 space-y-6">
                    <div className="relative w-full">
                        <SearchX className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search items..."
                            value={filters.search || ''}
                            onChange={(e) => updateFilters({ search: e.target.value })}
                            className="pl-9 bg-white dark:bg-zinc-900 shadow-sm"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Categories
                        </h3>
                        <div className="flex flex-col gap-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => updateFilters({ category: cat.value })}
                                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${(filters.category === cat.value) || (!filters.category && cat.value === 'all')
                                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                                            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Filter (Simplified visual) */}
                    <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min ₹"
                                className="text-sm shadow-sm"
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    updateFilters({ minPrice: isNaN(val) ? undefined : val });
                                }}
                            />
                            <Input
                                type="number"
                                placeholder="Max ₹"
                                className="text-sm shadow-sm"
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    updateFilters({ maxPrice: isNaN(val) ? undefined : val });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Grid */}
            <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <MarketplaceCard key={item.id} item={item} />
                    ))}
                </div>

                {/* Loading & Empty States */}
                {loading && items.length === 0 && (
                    <div className="flex justify-center p-12 w-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className="text-center p-16 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10 w-full">
                        <SearchX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground mb-1">No items found</h3>
                        <p className="text-sm text-muted-foreground">Try adjusting your category or price filters.</p>
                    </div>
                )}

                {hasMore && (
                    <div className="pt-8 flex justify-center w-full">
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
        </div>
    );
}
