// ============================================================
// lib/hooks/useEvents.ts
// Hook for fetching and managing Events
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { getEvents, createEvent, getEventBySlug, type GetEventsFilters } from '@/lib/db/events';
import type { Event } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useEvents(initialFilters?: GetEventsFilters) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const [filters, setFilters] = useState<GetEventsFilters>(initialFilters || { limit: 15 });


  const fetchEvents = useCallback(async (isLoadMore = false, currentFilters?: GetEventsFilters) => {
    if (fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);

      const f = currentFilters || filters;
      const currentPage = isLoadMore ? pageRef.current + 1 : 1;
      const response = await getEvents({ ...f, page: currentPage });

      setEvents(prev => isLoadMore ? [...prev, ...response.data] : response.data);
      setHasMore(response.hasMore);
      pageRef.current = currentPage;
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchEvents(false, filters);
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchEvents(true);
    }
  }, [loading, hasMore, fetchEvents]);

  const updateFilters = useCallback((newFilters: Partial<GetEventsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addEvent = useCallback(async (data: Partial<Event>) => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to create an event.", variant: "destructive" });
      return null;
    }
    try {
      const newEvent = await createEvent({ ...data, postedBy: user.id });
      if (newEvent) {
        setEvents(prev => [newEvent, ...prev]);
        toast({ title: "Event published successfully" });
        return newEvent;
      }
      return null;
    } catch (err: any) {
      console.error('[addEvent]', err);
      toast({ title: "Failed to publish event", description: err.message || 'Database error.', variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  return {
    events,
    loading,
    error,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    addEvent,
    refreshEvents: () => fetchEvents(false, filters)
  };
}

/**
 * Hook to fetch a single event by slug (useful for the detail page)
 */
export function useEvent(slug: string | null) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEvent() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getEventBySlug(slug);
        if (isMounted) setEvent(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to fetch event details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { event, loading, error };
}
