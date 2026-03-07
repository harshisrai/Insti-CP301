import { useState, useCallback, useEffect, useRef } from 'react';
import { FeedPost } from '@/lib/types';
import { getFeedPosts, createFeedPost } from '@/lib/db/feed';

export function useFeed() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const pageRef = useRef(0);
    const limit = 15;
    const hasFetched = useRef(false);
    const fetchingRef = useRef(false);

    console.log(`[${new Date().toISOString()}] [useFeed] Hook Rendered - Posts: ${posts.length}, Loading: ${loading}, hasFetched: ${hasFetched.current}`);

    const fetchFeed = useCallback(async (isLoadMore = false) => {
        if (fetchingRef.current) {
            console.log(`[${new Date().toISOString()}] [useFeed] Fetch already in progress, skipping`);
            return;
        }
        fetchingRef.current = true;

        const startTime = Date.now();
        console.log(`[${new Date().toISOString()}] [useFeed] fetchFeed triggered - isLoadMore: ${isLoadMore}`);
        try {
            setLoading(true);
            setError(null);
            const offset = (isLoadMore ? pageRef.current + 1 : 0) * limit;
            const data = await getFeedPosts(limit, offset);

            setPosts(prev => isLoadMore ? [...prev, ...data] : data);
            setHasMore(data.length === limit);
            if (isLoadMore) pageRef.current += 1;
            else pageRef.current = 0;
            console.log(`[${new Date().toISOString()}] [useFeed] fetchFeed SUCCESS - Posts: ${data.length}, Duration: ${Date.now() - startTime}ms`);
        } catch (err) {
            console.error(`[${new Date().toISOString()}] [useFeed] fetchFeed ERROR:`, err);
            setError(err instanceof Error ? err.message : 'Failed to fetch feed');
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        console.log(`[useFeed] useEffect triggered - hasFetched: ${hasFetched.current}`);
        if (!hasFetched.current) {
            console.log(`[useFeed] First fetch - setting hasFetched to true`);
            hasFetched.current = true;
            fetchFeed();
        }
    }, [fetchFeed]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchFeed(true);
        }
    };

    const addPost = async (authorId: string, content: string, mediaUrls: string[] = []) => {
        try {
            const newPost = await createFeedPost(authorId, content, mediaUrls);
            setPosts(prev => [newPost, ...prev]);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create post');
            return false;
        }
    };

    return {
        posts,
        loading,
        error,
        loadMore,
        hasMore,
        addPost,
        refresh: () => fetchFeed(false),
    };
}
