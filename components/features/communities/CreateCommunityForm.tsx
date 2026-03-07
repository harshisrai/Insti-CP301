'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useCreateCommunity } from '@/lib/hooks/useCommunities';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function CreateCommunityForm() {
    const router = useRouter();
    const { create, isSubmitting } = useCreateCommunity();

    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [requiresApproval, setRequiresApproval] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Community name is required.');
            return;
        }
        setError('');
        const result = await create({ name, description, isPublic, requiresApproval });
        if (result) {
            router.push(`/communities/${result.slug}`);
        } else {
            setError('Failed to create community.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/communities"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-serif tracking-tight">Create Community</h1>
                    <p className="text-sm text-muted-foreground">Start a new interest group for the campus.</p>
                </div>
            </div>

            <GlassSurface className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base">Community Name <span className="text-red-500">*</span></Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Competitive Programming Gang" maxLength={80} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this community about?" rows={4} />
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded border-border w-5 h-5" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Public (anyone can see and join)</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                            <input type="checkbox" checked={requiresApproval} onChange={e => setRequiresApproval(e.target.checked)} className="rounded border-border w-5 h-5" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Require approval to join</span>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" className="bg-foreground text-background font-bold min-w-[150px]" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Community
                        </Button>
                    </div>
                </form>
            </GlassSurface>
        </div>
    );
}
