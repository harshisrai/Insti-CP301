import React from 'react';
import { Metadata } from 'next';
import { ClubList } from '@/components/features/clubs/ClubList';

export const metadata: Metadata = {
    title: 'Clubs & Organizations | IIT Ropar',
    description: 'Browse clubs, boards, societies, and official bodies at IIT Ropar',
};

export default function ClubsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-serif">Clubs & Organizations</h1>
                <p className="text-muted-foreground mt-1">
                    Explore the vibrant ecosystem of clubs, boards, societies, and governance bodies at IIT Ropar.
                </p>
            </div>
            <ClubList />
        </div>
    );
}
