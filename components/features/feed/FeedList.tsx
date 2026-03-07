'use client';

import React from 'react';
import { useFeed } from '@/lib/hooks/useFeed';
import { FeedPostCard } from './FeedPostCard';
import { CreatePostInput } from './CreatePostInput';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function FeedList() {
    const { posts, loading, error, hasMore, loadMore, addPost } = useFeed();
    const { user } = useAuth();

    const handleCreatePost = async (content: string, mediaUrls?: string[]) => {
        if (!user) return false;
        return await addPost(user.id, content, mediaUrls);
    };

    const renderSkeletons = () => (
        Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-5 mb-6 h-40">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/6" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                </div>
            </div>
        ))
    );

    return (
        <div className="space-y-6">
            {/* Create Post Widget */}
            <CreatePostInput onPostCreated={handleCreatePost} />

            {/* Error State */}
            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-center text-sm border border-destructive/20">
                    {error}
                </div>
            )}

            {/* List of Posts */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <FeedPostCard key={post.id} post={post} />
                ))}
            </div>

            {/* Empty State */}
            {!loading && posts.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <Activity size={32} className="text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="font-serif font-bold text-xl mb-1">No Activity Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Be the first to share something with the campus community!
                    </p>
                </div>
            )}

            {/* Loading Skeletons */}
            {loading && renderSkeletons()}

            {/* Load More Button */}
            {posts.length > 0 && hasMore && (
                <div className="flex justify-center pt-4 pb-8">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="min-w-[200px] border-dashed"
                    >
                        {loading ? <Spinner className="mr-2" /> : 'Load More Activity'}
                    </Button>
                </div>
            )}
        </div>
    );
}
