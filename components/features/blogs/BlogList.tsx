'use client';

import React from 'react';
import { BlogCategory, BlogPost } from '@/lib/types';
import { BlogCard } from './BlogCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { MessageSquareOff } from 'lucide-react';

interface BlogListProps {
    blogs: BlogPost[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    category: BlogCategory | undefined;
    setCategory: (cat: BlogCategory | undefined) => void;
}

const CATEGORIES: { label: string; value: BlogCategory | undefined }[] = [
    { label: 'All', value: undefined },
    { label: 'Placement', value: 'placement' },
    { label: 'Internship', value: 'internship' },
    { label: 'Faculty Insight', value: 'faculty_insight' },
    { label: 'Alumni Exp', value: 'alumni_experience' },
    { label: 'Research', value: 'research' },
    { label: 'General', value: 'general' },
];

export function BlogList({ blogs, loading, hasMore, loadMore, category, setCategory }: BlogListProps) {
    // Skeleton loader for initial or sequential loading
    const renderSkeletons = () => (
        Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-card border border-border overflow-hidden">
                <div className="h-36 sm:h-48 bg-muted" />
                <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                        <div className="h-4 w-16 bg-muted rounded" />
                        <div className="h-4 w-20 bg-muted rounded" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-5 w-full bg-muted rounded" />
                        <div className="h-5 w-3/4 bg-muted rounded" />
                    </div>
                </div>
            </div>
        ))
    );

    return (
        <div className="space-y-8">
            {/* Category Filter Pills (Horizontal Scroll) */}
            <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 w-max pb-2">
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat.label}
                            variant={category === cat.value ? 'primary' : 'outline'}
                            size="sm"
                            className={cn(
                                "rounded-full px-4 sm:px-5 transition-all text-xs sm:text-sm font-medium whitespace-nowrap shrink-0",
                                category === cat.value
                                    ? "shadow-sm shadow-amber-500/20"
                                    : "hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 dark:hover:text-amber-400"
                            )}
                            onClick={() => setCategory(cat.value)}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid of Blog Cards */}
            {blogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} />
                    ))}
                    {loading && renderSkeletons()}
                </div>
            ) : (
                !loading && (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <MessageSquareOff size={32} className="text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="font-serif font-bold text-xl text-foreground mb-2">No blogs found</h3>
                        <p className="text-muted-foreground max-w-sm">
                            We couldn't find any blogs in this category. Be the first to share your experience!
                        </p>
                    </div>
                )
            )}

            {/* Initial Loading State */}
            {loading && blogs.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderSkeletons()}
                </div>
            )}

            {/* Load More Button */}
            {blogs.length > 0 && hasMore && (
                <div className="flex justify-center pt-8">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={loadMore}
                        disabled={loading}
                        className="min-w-[200px] border-dashed hover:border-amber-500/50 hover:bg-amber-500/5"
                    >
                        {loading ? <Spinner className="mr-2" /> : 'Load More Experiences'}
                    </Button>
                </div>
            )}
        </div>
    );
}
