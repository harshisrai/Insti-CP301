'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEvent } from '@/lib/hooks/useEvents';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, MapPin, Clock, Video, Link as LinkIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = typeof params?.slug === 'string' ? params.slug : null;

    const { event, loading, error } = useEvent(slug);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center">
                <GlassSurface className="p-8">
                    <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
                    <p className="text-muted-foreground mb-6"> {error || "This event may have been removed or doesn't exist."}</p>
                    <Button onClick={() => router.push('/events')}>Back to Events</Button>
                </GlassSurface>
            </div>
        );
    }

    const startDate = new Date(event.startTime!);
    const isPast = startDate < new Date();

    const fullDate = format(startDate, 'EEEE, MMMM do, yyyy');
    const time = event.endTime
        ? `${format(startDate, 'h:mm a')} - ${format(new Date(event.endTime), 'h:mm a')}`
        : format(startDate, 'h:mm a');

    const authorName = event.organizer ? event.organizer.name : event.poster?.fullName;
    const authorAvatar = event.organizer?.logoUrl || event.poster?.profilePictureUrl;
    const showOfficialBadge = !!event.organizer;

    return (
        <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-6">
            <Button variant="ghost" size="sm" asChild className="-ml-4 mb-2 text-muted-foreground hover:text-foreground">
                <Link href="/events"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Calendar</Link>
            </Button>

            <GlassSurface className="overflow-hidden relative">
                {/* Cover Image Placeholder or Pattern */}
                <div className="h-32 md:h-48 w-full bg-gradient-to-r from-accent-gold/20 to-transparent relative">
                    {event.coverImageUrl && (
                        <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" />
                    )}
                    {isPast && (
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                            PAST EVENT
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                        {/* Main Content Area */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={cn(
                                        'text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border',
                                        event.type === 'fest' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300' :
                                            event.type === 'club_event' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300' :
                                                'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                                    )}>
                                        {event.type.replace('_', ' ')}
                                    </span>
                                    {event.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-2 py-1 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4 text-foreground">{event.title}</h1>

                                <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {event.description}
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Info Area */}
                        <div className="w-full md:w-72 shrink-0 space-y-6">
                            {/* Organizer Card */}
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border flex items-center gap-3">
                                <Avatar className={cn("h-10 w-10", showOfficialBadge && "border-2 border-accent-gold/50")}>
                                    <AvatarImage src={authorAvatar} />
                                    <AvatarFallback className="bg-zinc-200">{getInitials(authorName || '?')}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5 uppercase tracking-wide">Organized By</p>
                                    <p className="text-sm font-bold text-foreground truncate">{authorName}</p>
                                </div>
                            </div>

                            {/* Key Details */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground">{fullDate}</p>
                                        <p className="text-muted-foreground text-xs mt-0.5">{time}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm">
                                    {event.isOnline ? <Video className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" /> : <MapPin className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />}
                                    <div>
                                        <p className="font-semibold text-foreground truncate">{event.venueName}</p>
                                        {event.venueMapUrl && (
                                            <a href={event.venueMapUrl} target="_blank" rel="noreferrer" className="text-accent-gold text-xs hover:underline mt-0.5 inline-block">View Map</a>
                                        )}
                                    </div>
                                </div>

                                {event.maxAttendees && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <Users className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-foreground">{event.maxAttendees} allowed</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA / Registration */}
                            {event.registrationUrl && !isPast && (
                                <div className="pt-4 border-t border-border">
                                    <Button asChild className="w-full bg-accent-gold hover:bg-accent-gold/90 text-white font-bold h-11">
                                        <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                                            <LinkIcon className="w-4 h-4 mr-2" />
                                            Register Now
                                        </a>
                                    </Button>
                                    {event.registrationDeadline && (
                                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                                            Deadline: {format(new Date(event.registrationDeadline), 'MMM do, h:mm a')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GlassSurface>
        </div>
    );
}
