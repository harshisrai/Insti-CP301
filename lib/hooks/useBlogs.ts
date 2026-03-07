import { useState, useCallback, useEffect, useRef } from 'react';
import { BlogPost, BlogCategory } from '@/lib/types';
import { getPublishedBlogs, getBlogBySlug } from '@/lib/db/blogs';

export function useBlogs(initialCategory?: BlogCategory) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<BlogCategory | undefined>(initialCategory);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const fetchingRef = useRef(false);
  const limit = 20;

  console.log(`[${new Date().toISOString()}] [useBlogs] Hook Rendered - Category: ${category}, Loading: ${loading}, Blogs: ${blogs.length}`);

  const fetchBlogs = useCallback(async (isLoadMore = false, cat?: BlogCategory) => {
    if (fetchingRef.current) {
      console.log(`[${new Date().toISOString()}] [useBlogs] Fetch already in progress, skipping`);
      return;
    }
    fetchingRef.current = true;
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] [useBlogs] fetchBlogs triggered - isLoadMore: ${isLoadMore}, cat: ${cat}`);
    try {
      setLoading(true);
      setError(null);
      const offset = (isLoadMore ? pageRef.current + 1 : 0) * limit;
      const data = await getPublishedBlogs(cat, limit, offset);

      setBlogs(prev => isLoadMore ? [...prev, ...data] : data);
      setHasMore(data.length === limit);
      if (isLoadMore) pageRef.current += 1;
      else pageRef.current = 0;
      console.log(`[${new Date().toISOString()}] [useBlogs] fetchBlogs SUCCESS - Blogs: ${data.length}, Duration: ${Date.now() - startTime}ms`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] [useBlogs] fetchBlogs ERROR:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] [useBlogs] useEffect (category) - Triggering fetch. Category: ${category}`);
    fetchBlogs(false, category);
  }, [category]); // Re-fetch when category changes

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBlogs(true, category);
    }
  };

  return {
    blogs,
    loading,
    error,
    category,
    setCategory,
    loadMore,
    hasMore,
    refresh: () => fetchBlogs(false, category)
  };
}

export function useBlog(slug: string) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBlogBySlug(slug);
        if (cancelled) return;
        if (!data) {
          setError('Blog not found');
        } else {
          setBlog(data);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch blog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  return {
    blog,
    loading,
    error,
    refresh: () => { } // Re-mount the component to refresh
  };
}
