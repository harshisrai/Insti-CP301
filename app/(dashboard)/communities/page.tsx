import React from 'react';
import { Metadata } from 'next';
import { CommunityList } from '@/components/features/communities/CommunityList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Communities | IIT Ropar',
    description: 'Join or create interest-based communities on campus',
};

export default function CommunitiesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif">Communities</h1>
                    <p className="text-muted-foreground mt-1">
                        Join interest groups, share knowledge, and connect with like-minded peers.
                    </p>
                </div>
                <Button asChild className="bg-foreground text-background hover:bg-foreground/90 shrink-0 shadow-md">
                    <Link href="/communities/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Community
                    </Link>
                </Button>
            </div>
            <CommunityList />
        </div>
    );
}
