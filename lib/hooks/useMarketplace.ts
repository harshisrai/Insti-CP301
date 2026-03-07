// ============================================================
// lib/hooks/useMarketplace.ts
// Hook for fetching and managing Marketplace items
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getMarketplaceItems, createMarketplaceItem, getMarketplaceItemById, updateMarketplaceItemStatus, type GetMarketplaceFilters } from '@/lib/db/marketplace';
import type { MarketplaceItem, ListingStatus, ItemCategory, ItemCondition } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useMarketplace(initialFilters?: GetMarketplaceFilters) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const [filters, setFilters] = useState<GetMarketplaceFilters>(initialFilters || { limit: 12 });

  console.log(`[${new Date().toISOString()}] [useMarketplace] Hook Rendered - Items: ${items.length}, Loading: ${loading}, Filters: ${JSON.stringify(filters)}`);

  const fetchItems = useCallback(async (isLoadMore = false, currentFilters?: GetMarketplaceFilters) => {
    if (fetchingRef.current) {
      console.log(`[${new Date().toISOString()}] [useMarketplace] Fetch already in progress, skipping`);
      return;
    }
    fetchingRef.current = true;
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] [useMarketplace] fetchItems triggered - isLoadMore: ${isLoadMore}, filters: ${JSON.stringify(currentFilters || filters)}`);
    try {
      setLoading(true);
      setError(null);

      const f = currentFilters || filters;
      const currentPage = isLoadMore ? pageRef.current + 1 : 1;
      const response = await getMarketplaceItems({ ...f, page: currentPage });

      setItems(prev => isLoadMore ? [...prev, ...response.data] : response.data);
      setHasMore(response.hasMore);
      pageRef.current = currentPage;
      console.log(`[${new Date().toISOString()}] [useMarketplace] fetchItems SUCCESS - Items: ${response.data.length}, Duration: ${Date.now() - startTime}ms`);
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] [useMarketplace] fetchItems ERROR:`, err);
      setError(err.message || 'Failed to load marketplace items');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [filters]);

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] [useMarketplace] useEffect (filters) - Triggering fetch. Filters: ${JSON.stringify(filters)}`);
    fetchItems(false, filters);
  }, [filters, fetchItems]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchItems(true);
    }
  }, [loading, hasMore, fetchItems]);

  const updateFilters = useCallback((newFilters: Partial<GetMarketplaceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const createListing = useCallback(async (data: {
    title: string;
    description?: string;
    category: ItemCategory;
    price: number;
    isNegotiable: boolean;
    condition: ItemCondition;
    images?: string[];
    pickupLocation?: string;
    deliveryAvailable: boolean;
  }) => {
    if (!user) return null;
    try {
      const newItem = await createMarketplaceItem({ ...data, sellerId: user.id });
      if (newItem) {
        setItems(prev => [newItem, ...prev]);
        toast({
          title: "Listing Created",
          description: "Your item has been successfully listed on the marketplace."
        });
        return newItem;
      }
      return null;
    } catch (err: any) {
      toast({
        title: "Failed to create listing",
        description: err.message,
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  const updateStatus = useCallback(async (id: string, newStatus: ListingStatus) => {
    try {
      const updated = await updateMarketplaceItemStatus(id, newStatus);
      if (updated) {
        setItems(prev => prev.map(item => item.id === id ? updated : item));
        toast({ title: `Listing marked as ${newStatus}` });
      }
      return updated;
    } catch (err: any) {
      toast({
        title: "Failed to update listing status",
        description: err.message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    createListing,
    updateStatus,
    refreshItems: () => fetchItems(false, filters)
  };
}

/**
 * Hook to fetch a single Marketplace Item by ID
 */
export function useMarketplaceItem(id: string | null) {
  const [item, setItem] = useState<MarketplaceItem | null>(null);
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
        const data = await getMarketplaceItemById(id);
        if (isMounted) setItem(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to fetch listing details');
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
