import React from 'react';
import Link from 'next/link';
import { NoticeList } from '@/components/features/notices/NoticeList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export const metadata = {
    title: 'Official Notices | IIT Ropar Community',
    description: 'View official campus announcements and notices',
};

export default function NoticesPage() {
    return (
        <div className="max-w-4xl mx-auto py-6 md:py-8 animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold font-serif tracking-tight">Notices Board</h1>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Official announcements, academic schedules, and administrative updates.
                    </p>
                </div>

                <Button asChild className="bg-accent-gold hover:bg-accent-gold/90 text-white shrink-0 shadow-sm">
                    <Link href="/notices/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Publish Notice
                    </Link>
                </Button>
            </div>

            <NoticeList />
        </div>
    );
}
