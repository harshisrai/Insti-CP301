import React from 'react';
import { Metadata } from 'next';
import { LFItemList } from '@/components/features/lost-found/LFItemList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Lost & Found | IIT Ropar',
    description: 'Report and find lost items on campus',
};

export default function LostFoundPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif">Lost & Found</h1>
                    <p className="text-muted-foreground mt-1">
                        Help your peers find their missing belongings, or report something you've lost.
                    </p>
                </div>
                <Button asChild className="bg-foreground text-background hover:bg-foreground/90 shrink-0 shadow-md">
                    <Link href="/lost-found/report">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Report Item
                    </Link>
                </Button>
            </div>

            <LFItemList />
        </div>
    );
}
