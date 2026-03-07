import React from 'react';
import Link from 'next/link';
import { EventList } from '@/components/features/events/EventList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export const metadata = {
    title: 'Campus Events | IIT Ropar Community',
    description: 'Discover upcoming fests, club events, and seminars on campus',
};

export default function EventsPage() {
    return (
        <div className="max-w-7xl mx-auto py-6 md:py-8 animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold font-serif tracking-tight">Campus Events</h1>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Find out what's happening around campus, from tech workshops to cultural fests.
                    </p>
                </div>

                <Button asChild className="bg-accent-gold hover:bg-accent-gold/90 text-white shrink-0 shadow-sm">
                    <Link href="/events/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>

            <EventList />
        </div>
    );
}
