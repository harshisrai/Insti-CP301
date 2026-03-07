'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useLostFound } from '@/lib/hooks/useLostFound';
import { Loader2, ArrowLeft, AlertCircle, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import type { LFCategory } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function ReportItemForm() {
    const router = useRouter();
    const { reportItem } = useLostFound();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form payload
    const [status, setStatus] = useState<'lost' | 'found'>('lost');
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState<LFCategory>('accessories');
    const [description, setDescription] = useState('');
    const [locationLostFound, setLocationLostFound] = useState('');
    const [dateLostFound, setDateLostFound] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    // Keeping it simple for demo: comma-separated URLs
    const [imagesStr, setImagesStr] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName.trim() || !locationLostFound.trim() || !dateLostFound) {
            setError('Item Name, Location, and Date are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const images = imagesStr.split(',').map(u => u.trim()).filter(Boolean);

        let parsedDate = '';
        if (dateLostFound) {
            parsedDate = new Date(dateLostFound).toISOString();
        }

        try {
            const success = await reportItem({
                itemName,
                category,
                status,
                description,
                locationLostFound,
                dateLostFound: parsedDate,
                contactInfo,
                images,
            });

            if (success) {
                router.push('/lost-found');
            } else {
                setError('Failed to submit report. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/lost-found"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif tracking-tight">Report an Item</h1>
                        <p className="text-sm text-muted-foreground">Post a lost item or report something you found.</p>
                    </div>
                </div>
            </div>

            <GlassSurface className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Status Toggle */}
                    <div className="flex gap-4 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setStatus('lost')}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-lg font-bold transition-all text-sm",
                                status === 'lost'
                                    ? "bg-red-500 text-white shadow-md"
                                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            )}
                        >
                            I Lost Something
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('found')}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-lg font-bold transition-all text-sm",
                                status === 'found'
                                    ? "bg-green-600 text-white shadow-md"
                                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            )}
                        >
                            I Found Something
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                        <div className="space-y-2">
                            <Label htmlFor="itemName" className="text-base">What is the item? <span className="text-red-500">*</span></Label>
                            <Input
                                id="itemName"
                                value={itemName}
                                onChange={e => setItemName(e.target.value)}
                                placeholder={status === 'lost' ? "e.g. Black Dell Laptop Charger" : "e.g. Blue Water Bottle"}
                                className="font-medium"
                                maxLength={100}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-base">Category</Label>
                            <select
                                id="category"
                                value={category}
                                onChange={e => setCategory(e.target.value as LFCategory)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="accessories">Accessories / Wearables</option>
                                <option value="electronics">Electronics</option>
                                <option value="documents">ID Cards / Documents</option>
                                <option value="keys">Keys</option>
                                <option value="wallet">Wallet / Purse</option>
                                <option value="bottle">Water Bottle</option>
                                <option value="clothing">Clothing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">When was it {status}? <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    id="date"
                                    value={dateLostFound}
                                    onChange={e => setDateLostFound(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Where was it {status}? <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="location"
                                    value={locationLostFound}
                                    onChange={e => setLocationLostFound(e.target.value)}
                                    placeholder={status === 'lost' ? "e.g. Library 2nd Floor" : "e.g. Near Main Gate"}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Detailed Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Any specific marks, colors, brand, or contents?"
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactInfo">Contact Information</Label>
                        <Input
                            id="contactInfo"
                            value={contactInfo}
                            onChange={e => setContactInfo(e.target.value)}
                            placeholder="How should someone reach you? (Phone number, Hostel Room No, etc.)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="images">Images (URLs, comma separated)</Label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="images"
                                value={imagesStr}
                                onChange={e => setImagesStr(e.target.value)}
                                placeholder="https://example.com/image1.jpg, ..."
                                className="pl-9"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">In a full backend, this would be a file upload to a storage bucket.</p>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className={cn(
                            "text-white min-w-[150px] font-bold",
                            status === 'lost' ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                        )} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Submit Report
                        </Button>
                    </div>
                </form>
            </GlassSurface>
        </div>
    );
}
