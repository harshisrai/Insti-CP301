'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { NoticeForm } from '@/components/features/notices/NoticeForm';
import { getNotice, updateNotice } from '@/lib/db/notices';
import type { Notice, NoticeStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function EditNoticePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState<Notice | null>(null);

    useEffect(() => {
        const fetchNotice = async () => {
            if (!id || typeof id !== 'string') return;
            try {
                const data = await getNotice(id);
                setNotice(data);
            } catch (err: any) {
                toast({ title: 'Error', description: err.message, variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
    }, [id, toast]);

    // Role safety check - redirect if they aren't the author
    useEffect(() => {
        if (!loading && notice && user) {
            if (notice.postedBy !== user.id) {
                toast({ title: 'Unauthorized', description: 'You can only edit your own notices.', variant: 'destructive' });
                router.replace('/notices');
            }
        }
    }, [loading, notice, user, router, toast]);

    const handleUpdate = async (updateData: Partial<Notice> & { status: NoticeStatus }) => {
        if (!id || typeof id !== 'string') return false;
        try {
            await updateNotice(id, updateData);
            toast({
                title: 'Notice Updated',
                description: `Successfully ${updateData.status === 'draft' ? 'saved as draft' : 'published'}.`
            });
            return true;
        } catch (err: any) {
            toast({ title: 'Error updating notice', description: err.message, variant: 'destructive' });
            return false;
        }
    };

    if (!user || loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="text-center p-12">
                <h2 className="text-xl font-bold">Notice not found</h2>
                <Button variant="link" asChild><Link href="/notices">Return to notices</Link></Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/notices"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black font-serif tracking-tight text-foreground flex items-center gap-3">
                        Edit Notice
                        {notice.status === 'draft' && (
                            <span className="text-xs tracking-wider uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/50 px-2 py-1 rounded-md">Draft</span>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Modify your notice or publish your draft.
                    </p>
                </div>
            </div>

            <NoticeForm
                initialData={notice}
                onSubmit={handleUpdate}
                isEdit={true}
            />
        </div>
    );
}
