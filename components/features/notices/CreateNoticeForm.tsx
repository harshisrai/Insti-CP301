'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useNotices } from '@/lib/hooks/useNotices';
import { PostingIdentitySelector } from '@/components/features/profile/PostingIdentitySelector';
import { useIdentities } from '@/lib/hooks/useIdentities';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import type { NoticeCategory, NoticePriority } from '@/lib/types';
import Link from 'next/link';

export function CreateNoticeForm() {
    const router = useRouter();
    const { addNotice } = useNotices();
    const { selectedIdentityId } = useIdentities();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form payload
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<NoticeCategory>('general');
    const [priority, setPriority] = useState<NoticePriority>('medium');
    const [tagsStr, setTagsStr] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

        const success = await addNotice({
            title,
            content,
            category,
            priority,
            tags,
            postingIdentityId: selectedIdentityId || undefined, // from the dropdown selector
        });

        setIsSubmitting(false);

        if (success) {
            router.push('/notices');
        } else {
            setError('Failed to publish. Check if you have permissions to post officially.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/notices"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif tracking-tight">Draft Official Notice</h1>
                        <p className="text-sm text-muted-foreground">Broadcast an institutional announcement.</p>
                    </div>
                </div>
            </div>

            <GlassSurface className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Posting Authority</Label>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                                Select the official role you are posting this notice under. Important for institutional credibility.
                            </p>
                        </div>
                        <PostingIdentitySelector className="w-full sm:w-auto" triggerClassName="w-full sm:w-[250px]" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base">Notice Title <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. End Semester Examination Schedule - Nov 2026"
                            className="font-medium text-lg py-6"
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                value={category}
                                onChange={e => setCategory(e.target.value as NoticeCategory)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="academic">Academic</option>
                                <option value="administrative">Administrative</option>
                                <option value="placement">Placement & Internship</option>
                                <option value="hostel">Hostel & Mess</option>
                                <option value="wellness">Wellness (Snehita)</option>
                                <option value="sports">Sports</option>
                                <option value="general">General Campus</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority Level</Label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={e => setPriority(e.target.value as NoticePriority)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="low">Standard / Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High (e.g. Schedule Changes)</option>
                                <option value="urgent">Urgent (e.g. Deadlines, Emergencies)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Full Notice Content <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Type the full official announcement here..."
                            rows={10}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (Optional)</Label>
                        <Input
                            id="tags"
                            value={tagsStr}
                            onChange={e => setTagsStr(e.target.value)}
                            placeholder="e.g. exams, cse, btech2024 (comma separated)"
                        />
                        <p className="text-[10px] text-muted-foreground">Helps students filter and search for this notice.</p>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-accent-gold hover:bg-accent-gold/90 text-white min-w-[120px]" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Publish Notice
                        </Button>
                    </div>
                </form>
            </GlassSurface>
        </div>
    );
}
