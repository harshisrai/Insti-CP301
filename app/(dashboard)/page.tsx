'use client';

import { useDashboardWidgets } from '@/lib/hooks/useDashboardWidgets';
import { FeedList } from '@/components/features/feed/FeedList';
import { UpcomingEventsWidget } from '@/components/features/dashboard/UpcomingEventsWidget';
import { RecentNoticesWidget } from '@/components/features/dashboard/RecentNoticesWidget';
import { FeaturedBlogsWidget } from '@/components/features/dashboard/FeaturedBlogsWidget';

export default function DashboardPage() {
  const { events, notices, blogs, loading } = useDashboardWidgets();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
          Campus Feed
        </h1>
        <p className="text-sm text-muted-foreground hidden md:block">
          Stay updated with what's happening at IIT Ropar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Central Content: Activity Feed (65% width on large screens) */}
        <div className="lg:col-span-8 xl:col-span-8">
          <FeedList />
        </div>

        {/* Right Hand Side (RHS): Summary Widgets (35% width on large screens) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          <UpcomingEventsWidget events={events} />
          <RecentNoticesWidget notices={notices} />
          <FeaturedBlogsWidget blogs={blogs} />

          {loading && events.length === 0 && (
            <div className="space-y-6 opacity-60 pointer-events-none">
              <div className="h-[200px] w-full bg-card rounded-2xl animate-pulse border border-border" />
              <div className="h-[250px] w-full bg-card rounded-2xl animate-pulse border border-border" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
