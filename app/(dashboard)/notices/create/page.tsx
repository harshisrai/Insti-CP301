'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotices } from '@/lib/hooks/useNotices';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NoticeForm } from '@/components/features/notices/NoticeForm';

export default function CreateNoticePage() {
    const { user } = useAuth();
    const { addNotice } = useNotices();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/notices"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black font-serif tracking-tight text-foreground">
                        Publish Official Notice
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create a new campus-wide or targeted administrative announcement.
                    </p>
                </div>
            </div>

            <NoticeForm onSubmit={addNotice as any} />
        </div>
    );
}
