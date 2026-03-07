import React from 'react';
import { Metadata } from 'next';
import { ReportItemForm } from '@/components/features/lost-found/ReportItemForm';

export const metadata: Metadata = {
    title: 'Report Item | Lost & Found',
    description: 'Report a lost or found item',
};

export default function ReportItemPage() {
    return <ReportItemForm />;
}
