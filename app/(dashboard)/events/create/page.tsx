import React from 'react';
import { CreateEventForm } from '@/components/features/events/CreateEventForm';

export const metadata = {
    title: 'Create Event | IIT Ropar Community',
    description: 'List a new event on the campus calendar',
};

export default function CreateEventPage() {
    return (
        <div className="animate-fade-in">
            <CreateEventForm />
        </div>
    );
}
