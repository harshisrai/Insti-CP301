// ============================================================
// lib/hooks/useNotices.ts
// Hook for fetching and managing Notices
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getNotices, createNotice, type GetNoticesFilters } from '@/lib/db/notices';
import type { Notice } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useNotices(initialFilters?: GetNoticesFilters) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const pageRef = useRef(1);
    const fetchingRef = useRef(false);
    const [filters, setFilters] = useState<GetNoticesFilters>(initialFilters || { limit: 15 });

    const fetchNotices = useCallback(async (isLoadMore = false, currentFilters?: GetNoticesFilters) => {
        if (fetchingRef.current) {
            return;
        }
        fetchingRef.current = true;
        try {
            setLoading(true);
            setError(null);

            const f = currentFilters || filters;
            const currentPage = isLoadMore ? pageRef.current + 1 : 1;
            const response = await getNotices({ ...f, page: currentPage });

            setNotices(prev => isLoadMore ? [...prev, ...response.data] : response.data);
            setHasMore(response.hasMore);
            pageRef.current = currentPage;
        } catch (err: any) {
            setError(err.message || 'Failed to load notices');
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [filters]);

    useEffect(() => {
        fetchNotices(false, filters);
    }, [filters, fetchNotices]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchNotices(true);
        }
    }, [loading, hasMore, fetchNotices]);

    const updateFilters = useCallback((newFilters: Partial<GetNoticesFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const addNotice = useCallback(async (data: Partial<Notice>) => {
        if (!user) return null;
        try {
            const newNotice = await createNotice({ ...data, postedBy: user.id });
            if (newNotice) {
                setNotices(prev => [newNotice, ...prev]);
                toast({ title: "Notice published successfully" });
                return newNotice;
            }
            return null;
        } catch (err: any) {
            toast({
                title: "Failed to publish notice",
                description: err.message,
                variant: "destructive"
            });
            return null;
        }
    }, [user, toast]);

    return {
        notices,
        loading,
        error,
        hasMore,
        loadMore,
        filters,
        updateFilters,
        addNotice,
        refreshNotices: () => fetchNotices(false, filters)
    };
}
