'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMarketplace, useMarketplaceItem } from '@/lib/hooks/useMarketplace';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, MapPin, User, IndianRupee, Tag, Package, Truck, Clock, Eye, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function MarketplaceDetail() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params?.id === 'string' ? params.id : null;

    const { item, loading, error } = useMarketplaceItem(id);
    const { updateStatus } = useMarketplace();
    const { user } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center">
                <GlassSurface className="p-8">
                    <h2 className="text-xl font-bold mb-2">Listing Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || "This listing may have been removed."}</p>
                    <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
                </GlassSurface>
            </div>
        );
    }

    const isOwner = user?.id === item.sellerId;
    const isAvailable = item.status === 'available';
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;

    const handleMarkSold = async () => {
        if (!isOwner) return;
        if (confirm('Mark this item as sold?')) {
            await updateStatus(item.id, 'sold');
            window.location.reload();
        }
    };

    const handleMarkReserved = async () => {
        if (!isOwner) return;
        if (confirm('Reserve this item for a buyer?')) {
            await updateStatus(item.id, 'reserved');
            window.location.reload();
        }
    };

    const handleCancel = async () => {
        if (!isOwner) return;
        if (confirm('Cancel this listing? It will be removed from the marketplace.')) {
            await updateStatus(item.id, 'cancelled');
            window.location.reload();
        }
    };

    const conditionColors: Record<string, string> = {
        new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        like_new: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
        good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
        <div className="max-w-5xl mx-auto py-8 animate-fade-in space-y-6">
            <Button variant="ghost" size="sm" asChild className="-ml-4 mb-2 text-muted-foreground hover:text-foreground">
                <Link href="/marketplace"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace</Link>
            </Button>

            {!isAvailable && (
                <div className={cn(
                    "px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium",
                    item.status === 'sold' && 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50',
                    item.status === 'reserved' && 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/50',
                    item.status === 'cancelled' && 'bg-zinc-100 border border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                )}>
                    <XCircle className="w-5 h-5" />
                    <span>This item has been {item.status}.</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Image Section */}
                <GlassSurface className={cn("overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 min-h-[350px]", !isAvailable && "opacity-80 grayscale-[0.5]")}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.title} className="w-full h-auto max-h-[500px] object-contain" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 py-32">
                            <ImageIcon className="w-20 h-20 mb-4 opacity-50" />
                            <p className="font-medium uppercase tracking-widest text-xs opacity-70">No Image Provided</p>
                        </div>
                    )}

                    {/* Gallery thumbnails */}
                    {item.images && item.images.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 bg-gradient-to-t from-black/50 to-transparent">
                            {item.images.slice(0, 5).map((img, i) => (
                                <div key={i} className="w-12 h-12 rounded-md overflow-hidden border-2 border-white/50 shrink-0">
                                    <img src={img} alt={`${item.title} ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </GlassSurface>

                {/* Detail Section */}
                <div className="space-y-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="secondary" className="uppercase tracking-wider text-[10px] font-semibold">
                                {item.category.replace('_', ' ')}
                            </Badge>
                            <span className={cn('text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md', conditionColors[item.condition])}>
                                {item.condition.replace('_', ' ')}
                            </span>
                            {item.isNegotiable && (
                                <span className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                                    <Tag className="w-3 h-3" /> Negotiable
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-serif font-bold tracking-tight mb-3 text-foreground">{item.title}</h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
                            <IndianRupee className="w-6 h-6" />
                            {item.price.toLocaleString('en-IN')}
                        </div>

                        {item.description && (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap border-t border-border pt-4">
                                <p>{item.description}</p>
                            </div>
                        )}
                    </div>

                    <GlassSurface className="p-5 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">Details</h3>

                        {item.pickupLocation && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Pickup Location</p>
                                    <p className="text-muted-foreground text-sm">{item.pickupLocation}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <Truck className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Delivery</p>
                                <p className="text-muted-foreground text-sm">{item.deliveryAvailable ? 'Available within campus' : 'Pickup only'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Eye className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Views</p>
                                <p className="text-muted-foreground text-sm">{item.viewCount} views</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Listed</p>
                                <p className="text-muted-foreground text-sm">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                            </div>
                        </div>
                    </GlassSurface>

                    {/* Seller Card */}
                    <GlassSurface className="p-5 flex items-center justify-between gap-4 border-accent-gold/20">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border border-border">
                                <AvatarImage src={item.seller?.profilePictureUrl} />
                                <AvatarFallback className="bg-zinc-200 font-bold text-lg">{getInitials(item.seller?.fullName || '?')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Seller</p>
                                <p className="font-bold text-foreground">{item.seller?.fullName}</p>
                            </div>
                        </div>
                    </GlassSurface>

                    {/* Owner Actions */}
                    {isOwner && isAvailable && (
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                            <Button onClick={handleMarkSold} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Sold
                            </Button>
                            <Button onClick={handleMarkReserved} variant="outline" className="flex-1">
                                <Package className="w-4 h-4 mr-2" /> Reserve
                            </Button>
                            <Button onClick={handleCancel} variant="ghost" className="text-red-500 hover:text-red-700 flex-1">
                                <XCircle className="w-4 h-4 mr-2" /> Cancel Listing
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
