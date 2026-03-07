import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Video, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const startDate = new Date(event.startTime!);
  const isPast = startDate < new Date();

  const month = format(startDate, 'MMM');
  const day = format(startDate, 'dd');
  const time = format(startDate, 'h:mm a');

  const authorName = event.organizer ? event.organizer.name : event.poster?.fullName;
  const authorAvatar = event.organizer?.logoUrl || event.poster?.profilePictureUrl;

  return (
    <Link href={`/events/${event.slug}`} className="block group">
      <GlassSurface className={cn(
        'relative overflow-hidden flex transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/5 hover:-translate-y-1',
        compact ? 'p-3 gap-4' : 'p-5 sm:p-6 gap-5 sm:gap-6',
        isPast && 'opacity-70 grayscale-[0.3]'
      )}>
        {/* Calendar Date Badge (Left Side) */}
        <div className={cn(
          'shrink-0 flex flex-col items-center justify-center rounded-xl overflow-hidden border shadow-sm',
          compact ? 'w-14 h-16' : 'w-16 h-20 sm:w-20 sm:h-24',
          isPast ? 'bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700' : 'bg-white border-accent-gold/20 dark:bg-background/50 dark:border-accent-gold/20'
        )}>
          <div className={cn(
            'w-full text-center font-bold tracking-wider text-white',
            compact ? 'text-[10px] py-1' : 'text-xs py-1.5',
            isPast ? 'bg-zinc-500' : 'bg-accent-gold'
          )}>
            {month.toUpperCase()}
          </div>
          <div className={cn(
            'flex-1 w-full flex items-center justify-center font-serif font-bold text-foreground',
            compact ? 'text-xl' : 'text-2xl sm:text-3xl'
          )}>
            {day}
          </div>
        </div>

        {/* Content (Right Side) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-flex items-center',
              event.type === 'fest' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                event.type === 'club_event' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            )}>
              {event.type.replace('_', ' ')}
            </span>
          </div>

          <h3 className={cn(
            'font-serif font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate',
            compact ? 'text-base mb-1' : 'text-lg sm:text-xl mb-2'
          )}>
            {event.title}
          </h3>

          {!compact && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-auto">
            <span className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              {time}
            </span>
            {event.venueName && (
              <span className="flex items-center gap-1.5 truncate max-w-[150px] sm:max-w-[200px]">
                {event.isOnline ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                <span className="truncate">{event.venueName}</span>
              </span>
            )}

            {/* Organizer Avatar */}
            {!compact && (
              <span className="flex items-center gap-1.5 ml-auto border-l pl-4 border-black/10 dark:border-white/10 shrink-0">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback className="text-[8px] bg-zinc-200">{getInitials(authorName || '?')}</AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px] font-medium">{authorName}</span>
              </span>
            )}
          </div>
        </div>
      </GlassSurface>
    </Link>
  );
}
