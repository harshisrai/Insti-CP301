import React from 'react';
import { Metadata } from 'next';
import { CreateCommunityForm } from '@/components/features/communities/CreateCommunityForm';

export const metadata: Metadata = {
    title: 'Create Community | IIT Ropar',
    description: 'Start a new community on campus',
};

export default function CreateCommunityPage() {
    return <CreateCommunityForm />;
}
