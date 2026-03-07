import React from 'react';
import { Metadata } from 'next';
import { CommunityDetail } from '@/components/features/communities/CommunityDetail';

export const metadata: Metadata = {
    title: 'Community Detail | IIT Ropar',
    description: 'View community details, posts, and members',
};

export default function CommunityDetailPage() {
    return <CommunityDetail />;
}
