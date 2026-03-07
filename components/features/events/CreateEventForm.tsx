'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useEvents } from '@/lib/hooks/useEvents';
import { PostingIdentitySelector } from '@/components/features/profile/PostingIdentitySelector';
import { useIdentities } from '@/lib/hooks/useIdentities';
import { Loader2, ArrowLeft, AlertCircle, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import type { EventType } from '@/lib/types';
import Link from 'next/link';

export function CreateEventForm() {
    const router = useRouter();
    const { addEvent } = useEvents();
    const { selectedIdentityId, selectedIdentity } = useIdentities();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form payload
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<EventType>('club_event');
    const [startDateStr, setStartDateStr] = useState('');
    const [startTimeStr, setStartTimeStr] = useState('');
    const [venueName, setVenueName] = useState('');
    const [registrationUrl, setRegistrationUrl] = useState('');
    const [tagsStr, setTagsStr] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !startDateStr || !startTimeStr || !venueName.trim()) {
            setError('Title, description, date, time, and venue are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        // Construct full ISO string for start time
        const startDateTimeStr = `${startDateStr}T${startTimeStr}:00`;
        let startTime;
        try {
            startTime = new Date(startDateTimeStr).toISOString();
        } catch (e) {
            setError('Invalid date or time format.');
            setIsSubmitting(false);
            return;
        }

        const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

        // If a POR is selected, use that org ID as the organizer
        const organizerId = selectedIdentity?.orgId;

        try {
            const success = await addEvent({
                title,
                description,
                type,
                startTime,
                venueName,
                registrationUrl: registrationUrl || undefined,
                tags,
                organizerId, // Will be null if posting as personal
            });

            if (success) {
                router.push('/events');
            } else {
                setError('Failed to publish event. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/events"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif tracking-tight">Create an Event</h1>
                        <p className="text-sm text-muted-foreground">List a new event on the campus calendar.</p>
                    </div>
                </div>
            </div>

            <GlassSurface className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Organizing Identity</Label>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                                Only students with a specific Club/Board position can officially list an event under that organization.
                            </p>
                        </div>
                        <PostingIdentitySelector className="w-full sm:w-auto" triggerClassName="w-full sm:w-[250px]" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base">Event Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Intro to Machine Learning Workshop"
                            className="font-medium text-lg py-6"
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="type">Event Type</Label>
                            <select
                                id="type"
                                value={type}
                                onChange={e => setType(e.target.value as EventType)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="club_event">Club Event</option>
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar / Guest Lecture</option>
                                <option value="fest">Fest / Department Day</option>
                                <option value="sports">Sports Match</option>
                                <option value="music">Music / Cultural</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Event Date <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    id="startDate"
                                    value={startDateStr}
                                    onChange={e => setStartDateStr(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                            <Input
                                type="time"
                                id="startTime"
                                value={startTimeStr}
                                onChange={e => setStartTimeStr(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venueName">Venue / Location <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="venueName"
                                value={venueName}
                                onChange={e => setVenueName(e.target.value)}
                                placeholder="e.g. L1, Lecture Hall Complex"
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Event Description <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What is this event about? What should attendees bring?"
                            rows={5}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="registrationUrl">Registration Link (Optional)</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="url"
                                id="registrationUrl"
                                value={registrationUrl}
                                onChange={e => setRegistrationUrl(e.target.value)}
                                placeholder="https://forms.gle/..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (Optional)</Label>
                        <Input
                            id="tags"
                            value={tagsStr}
                            onChange={e => setTagsStr(e.target.value)}
                            placeholder="e.g. coding, pizza, ai (comma separated)"
                        />
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-accent-gold hover:bg-accent-gold/90 text-white min-w-[120px]" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Publish Event
                        </Button>
                    </div>
                </form>
            </GlassSurface>
        </div>
    );
}
