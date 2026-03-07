import React from 'react';
import { Metadata } from 'next';
import { MarketplaceList } from '@/components/features/marketplace/MarketplaceList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Marketplace | IIT Ropar',
    description: 'Buy and sell items within the campus community',
};

export default function MarketplacePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif">Marketplace</h1>
                    <p className="text-muted-foreground mt-1">
                        Buy and sell cycles, books, electronics, and more within the campus community.
                    </p>
                </div>
                <Button asChild className="bg-foreground text-background hover:bg-foreground/90 shrink-0 shadow-md">
                    <Link href="/marketplace/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Sell an Item
                    </Link>
                </Button>
            </div>

            <MarketplaceList />
        </div>
    );
}
