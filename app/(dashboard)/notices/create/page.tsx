import React from 'react';
import { CreateNoticeForm } from '@/components/features/notices/CreateNoticeForm';

export const metadata = {
    title: 'Publish Notice | IIT Ropar Community',
    description: 'Draft and publish an official institutional notice',
};

export default function CreateNoticePage() {
    return (
        <div className="animate-fade-in">
            <CreateNoticeForm />
        </div>
    );
}
