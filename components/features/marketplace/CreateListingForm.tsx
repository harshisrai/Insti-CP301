'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useMarketplace } from '@/lib/hooks/useMarketplace';
import { Loader2, ArrowLeft, AlertCircle, MapPin, IndianRupee, Image as ImageIcon } from 'lucide-react';
import type { ItemCategory, ItemCondition } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CreateListingForm() {
    const router = useRouter();
    const { createListing } = useMarketplace();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ItemCategory>('electronics');
    const [price, setPrice] = useState('');
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [condition, setCondition] = useState<ItemCondition>('good');
    const [pickupLocation, setPickupLocation] = useState('');
    const [deliveryAvailable, setDeliveryAvailable] = useState(false);
    const [imagesStr, setImagesStr] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !price) {
            setError('Title and Price are required.');
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            setError('Please enter a valid price.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const images = imagesStr.split(',').map(u => u.trim()).filter(Boolean);

        const success = await createListing({
            title,
            description,
            category,
            price: parsedPrice,
            isNegotiable,
            condition,
            images,
            pickupLocation,
            deliveryAvailable,
        });

        setIsSubmitting(false);

        if (success) {
            router.push('/marketplace');
        } else {
            setError('Failed to create listing. Please try again.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/marketplace"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-serif tracking-tight">Create Listing</h1>
                    <p className="text-sm text-muted-foreground">List an item for sale on the campus marketplace.</p>
                </div>
            </div>

            <GlassSurface className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="title" className="text-base">What are you selling? <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Hero Lectro C5i Electric Cycle"
                                className="font-medium"
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-base">Category</Label>
                            <select
                                id="category"
                                value={category}
                                onChange={e => setCategory(e.target.value as ItemCategory)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="cycle">Cycles</option>
                                <option value="electronics">Electronics</option>
                                <option value="books">Books & Academics</option>
                                <option value="furniture">Furniture</option>
                                <option value="clothing">Clothing</option>
                                <option value="sports">Sports Equipment</option>
                                <option value="stationery">Stationery</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="condition" className="text-base">Condition</Label>
                            <select
                                id="condition"
                                value={condition}
                                onChange={e => setCondition(e.target.value as ItemCondition)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="new">Brand New</option>
                                <option value="like_new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-base">Price (₹) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder="0"
                                    className="pl-9 font-medium text-lg"
                                    min={0}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pickup" className="text-base">Pickup Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="pickup"
                                    value={pickupLocation}
                                    onChange={e => setPickupLocation(e.target.value)}
                                    placeholder="e.g. Kameng Hostel Wing 3"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={isNegotiable}
                                onChange={e => setIsNegotiable(e.target.checked)}
                                className="rounded border-border w-5 h-5 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Price is negotiable</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={deliveryAvailable}
                                onChange={e => setDeliveryAvailable(e.target.checked)}
                                className="rounded border-border w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Delivery available within campus</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Detailed Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your item: brand, model, age, any issues, why you're selling..."
                            rows={5}
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
                                placeholder="https://example.com/photo1.jpg, ..."
                                className="pl-9"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">In a full backend, this would be a file upload to a storage bucket.</p>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white min-w-[150px] font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Post Listing
                        </Button>
                    </div>
                </form>
            </GlassSurface>
        </div>
    );
}
