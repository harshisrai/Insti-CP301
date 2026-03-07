import { useState, useEffect, useRef } from 'react';
import { getUpcomingEvents } from '@/lib/db/events';
import { getNotices } from '@/lib/db/notices';
import { getFeaturedBlogs } from '@/lib/db/blogs';
import { Event, Notice, BlogPost } from '@/lib/types';

export function useDashboardWidgets() {
    const [events, setEvents] = useState<Event[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchWidgets() {
            if (fetchingRef.current) return;
            fetchingRef.current = true;
            try {
                setLoading(true);
                const [eventsResult, noticesResult, blogsResult] = await Promise.allSettled([
                    getUpcomingEvents(undefined, 3).catch(() => [] as Event[]),
                    getNotices({ limit: 3 }).then(res => res.data).catch(() => [] as Notice[]),
                    getFeaturedBlogs(3).catch(() => [] as BlogPost[]),
                ]);

                if (isMounted) {
                    setEvents(eventsResult.status === 'fulfilled' ? eventsResult.value : []);
                    setNotices(noticesResult.status === 'fulfilled' ? noticesResult.value : []);
                    setBlogs(blogsResult.status === 'fulfilled' ? blogsResult.value : []);
                }
            } catch (err) {
                if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch widgets');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
                fetchingRef.current = false;
            }
        }

        fetchWidgets();

        return () => {
            isMounted = false;
        };
    }, []);

    return { events, notices, blogs, loading, error };
}
