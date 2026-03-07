import React from 'react';
import { Metadata } from 'next';
import { LFItemDetail } from '@/components/features/lost-found/LFItemDetail';

export const metadata: Metadata = {
    title: 'Item Detail | Lost & Found',
    description: 'View details of a lost or found item',
};

export default function LFItemDetailPage() {
    return <LFItemDetail />;
}
