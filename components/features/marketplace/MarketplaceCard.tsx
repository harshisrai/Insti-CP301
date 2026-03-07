import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, User, Image as ImageIcon, Tag, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketplaceItem } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';

interface MarketplaceCardProps {
  item: MarketplaceItem;
}

export function MarketplaceCard({ item }: MarketplaceCardProps) {
  const isAvailable = item.status === 'available';
  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <Link href={`/marketplace/${item.id}`} className="block group h-full">
      <GlassSurface className={cn(
        'h-full flex flex-col transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/5 hover:-translate-y-1 overflow-hidden',
        !isAvailable && 'opacity-70 grayscale-[0.3]'
      )}>
        {/* Image / Placeholder */}
        <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-900 border-b border-black/5 dark:border-white/5 shrink-0 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
              <ImageIcon className="w-12 h-12 mb-2" />
              <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
            </div>
          )}

          {/* Status Badge */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10 transition-opacity">
              <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg transform -rotate-12 border-2 border-white shadow-xl text-lg tracking-widest uppercase">
                {item.status}
              </span>
            </div>
          )}

          {/* Condition Badge */}
          <div className="absolute top-3 left-3 shadow-sm z-0">
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 flex items-center gap-1 backdrop-blur-md rounded-md bg-white/80 dark:bg-black/60 text-foreground border border-black/10 dark:border-white/10">
              {item.condition.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary" className="w-fit text-[10px] font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors uppercase tracking-wider">
              {item.category.replace('_', ' ')}
            </Badge>
            <div className="text-right shrink-0">
              <div className="flex items-center text-lg font-bold text-green-700 dark:text-green-400">
                <IndianRupee className="w-4 h-4 mr-0.5" />
                {item.price.toLocaleString('en-IN')}
              </div>
              {item.isNegotiable && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center justify-end gap-1">
                  <Tag className="w-3 h-3" /> Negotiable
                </span>
              )}
            </div>
          </div>

          <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-accent-gold transition-colors line-clamp-2 mb-2">
            {item.title}
          </h3>

          <div className="space-y-2 mt-auto text-xs text-muted-foreground pt-3 border-t border-border">
            {item.pickupLocation && (
              <div className="flex items-start gap-2 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="truncate">{item.pickupLocation}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.seller?.fullName}</span>
              <span className="mx-1 opacity-50">•</span>
              <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </GlassSurface>
    </Link>
  );
}
