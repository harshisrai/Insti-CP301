// ============================================================
// lib/hooks/useLostFound.ts
// Hook for fetching and managing Lost & Found items
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getLFItems, createLFItem, getLFItemById, updateLFItemStatus, type GetLFFilters } from '@/lib/db/lost-found';
import type { LostFoundItem, LFStatus, LFCategory } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useLostFound(initialFilters?: GetLFFilters) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [items, setItems] = useState<LostFoundItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const pageRef = useRef(1);
    const fetchingRef = useRef(false);
    const [filters, setFilters] = useState<GetLFFilters>(initialFilters || { limit: 15 });

    console.log(`[${new Date().toISOString()}] [useLostFound] Hook Rendered - Items: ${items.length}, Loading: ${loading}, Filters: ${JSON.stringify(filters)}`);

    const fetchItems = useCallback(async (isLoadMore = false, currentFilters?: GetLFFilters) => {
        if (fetchingRef.current) {
            console.log(`[${new Date().toISOString()}] [useLostFound] Fetch already in progress, skipping`);
            return;
        }
        fetchingRef.current = true;
        const startTime = Date.now();
        console.log(`[${new Date().toISOString()}] [useLostFound] fetchItems triggered - isLoadMore: ${isLoadMore}, filters: ${JSON.stringify(currentFilters || filters)}`);
        try {
            setLoading(true);
            setError(null);

            const f = currentFilters || filters;
            const currentPage = isLoadMore ? pageRef.current + 1 : 1;
            const response = await getLFItems({ ...f, page: currentPage });

            setItems(prev => isLoadMore ? [...prev, ...response.data] : response.data);
            setHasMore(response.hasMore);
            pageRef.current = currentPage;
            console.log(`[${new Date().toISOString()}] [useLostFound] fetchItems SUCCESS - Items: ${response.data.length}, Duration: ${Date.now() - startTime}ms`);
        } catch (err: any) {
            console.error(`[${new Date().toISOString()}] [useLostFound] fetchItems ERROR:`, err);
            setError(err.message || 'Failed to load lost & found items');
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [filters]);

    useEffect(() => {
        console.log(`[${new Date().toISOString()}] [useLostFound] useEffect (filters) - Triggering fetch. Filters: ${JSON.stringify(filters)}`);
        fetchItems(false, filters);
    }, [filters, fetchItems]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchItems(true, filters);
        }
    }, [loading, hasMore, fetchItems, filters]);

    const updateFilters = useCallback((newFilters: Partial<GetLFFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    }, []);

    const reportItem = useCallback(async (data: {
        itemName: string;
        category: LFCategory;
        status: 'lost' | 'found';
        description?: string;
        locationLostFound?: string;
        dateLostFound?: string;
        contactInfo?: string;
        images?: string[];
    }) => {
        if (!user) {
            toast({
                title: "Not logged in",
                description: "Please log in to report an item.",
                variant: "destructive"
            });
            return null;
        }
        try {
            const newItem = await createLFItem({ ...data, reporterId: user.id });
            if (newItem) {
                setItems(prev => [newItem, ...prev]);
                toast({
                    title: `Reported as ${data.status === 'lost' ? 'Lost' : 'Found'}`,
                    description: "Your item has been posted successfully."
                });
                return newItem;
            }
            return null;
        } catch (err: any) {
            console.error('[reportItem]', err);
            toast({
                title: "Failed to post item",
                description: err.message || 'Database error. Please try again.',
                variant: "destructive"
            });
            return null;
        }
    }, [user, toast]);

    const resolveItem = useCallback(async (id: string, newStatus: LFStatus) => {
        try {
            const updated = await updateLFItemStatus(id, newStatus, user?.id);
            if (updated) {
                setItems(prev => prev.map(item => item.id === id ? updated : item));
                toast({
                    title: "Status updated successfully"
                });
            }
            return updated;
        } catch (err: any) {
            toast({
                title: "Failed to update status",
                description: err.message,
                variant: "destructive"
            });
            return null;
        }
    }, [user, toast]);

    return {
        items,
        loading,
        error,
        hasMore,
        loadMore,
        filters,
        updateFilters,
        reportItem,
        resolveItem,
        refreshItems: () => fetchItems(false, filters)
    };
}

/**
 * Hook to fetch a single Lost Found Item by ID
 */
export function useLostFoundItem(id: string | null) {
    const [item, setItem] = useState<LostFoundItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchItem() {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getLFItemById(id);
                if (isMounted) setItem(data);
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Failed to fetch item details');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchItem();

        return () => {
            isMounted = false;
        };
    }, [id]);

    return { item, loading, error };
}
