import React from 'react';
import { Metadata } from 'next';
import { ClubDetail } from '@/components/features/clubs/ClubDetail';

export const metadata: Metadata = {
    title: 'Club Detail | IIT Ropar',
    description: 'View details of an organization',
};

export default function ClubDetailPage() {
    return <ClubDetail />;
}
