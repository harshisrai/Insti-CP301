import React from 'react';
import { Metadata } from 'next';
import { MarketplaceDetail } from '@/components/features/marketplace/MarketplaceDetail';

export const metadata: Metadata = {
    title: 'Item Detail | Marketplace',
    description: 'View details of a marketplace listing',
};

export default function MarketplaceDetailPage() {
    return <MarketplaceDetail />;
}
