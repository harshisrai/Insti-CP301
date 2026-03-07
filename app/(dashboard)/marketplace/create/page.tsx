import React from 'react';
import { Metadata } from 'next';
import { CreateListingForm } from '@/components/features/marketplace/CreateListingForm';

export const metadata: Metadata = {
    title: 'Sell an Item | Marketplace',
    description: 'List a new item for sale on the campus marketplace',
};

export default function CreateListingPage() {
    return <CreateListingForm />;
}
