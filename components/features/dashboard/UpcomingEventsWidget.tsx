import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Event } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { format } from 'date-fns';

interface UpcomingEventsWidgetProps {
    events: Event[];
}

export function UpcomingEventsWidget({ events }: UpcomingEventsWidgetProps) {
    if (events.length === 0) return null;

    return (
        <GlassSurface className="p-5 flex flex-col pt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                    <Calendar className="text-amber-500 w-5 h-5" />
                    Upcoming Events
                </h3>
                <Link href="/events" className="text-sm font-medium text-amber-600 hover:underline flex items-center">
                    View all <ChevronRight size={14} />
                </Link>
            </div>

            <div className="space-y-4">
                {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.slug}`} className="block group">
                        <div className="flex gap-4 p-3 -mx-3 rounded-lg hover:bg-amber-500/5 transition-colors border border-transparent hover:border-amber-500/20">
                            {/* Date Box */}
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                                <span className="text-xs font-bold uppercase">
                                    {event.startTime ? format(new Date(event.startTime), 'MMM') : 'TBD'}
                                </span>
                                <span className="text-lg font-black leading-none">
                                    {event.startTime ? format(new Date(event.startTime), 'dd') : '--'}
                                </span>
                            </div>

                            {/* Event Info */}
                            <div className="space-y-1 overflow-hidden">
                                <h4 className="font-semibold text-foreground truncate group-hover:text-amber-600 transition-colors">
                                    {event.title}
                                </h4>
                                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                    {event.startTime && (
                                        <span className="flex items-center gap-1.5 truncate">
                                            <Clock size={12} className="opacity-70" />
                                            {format(new Date(event.startTime), 'h:mm a')}
                                        </span>
                                    )}
                                    {event.venueName && (
                                        <span className="flex items-center gap-1.5 truncate">
                                            <MapPin size={12} className="opacity-70" />
                                            {event.venueName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </GlassSurface>
    );
}
