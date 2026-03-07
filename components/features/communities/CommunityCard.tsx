import React from 'react';
import Link from 'next/link';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, Globe } from 'lucide-react';
import type { Community } from '@/lib/types';

interface CommunityCardProps {
    community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
    return (
        <Link href={`/communities/${community.slug}`} className="block group h-full">
            <GlassSurface className="h-full flex flex-col p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/5 hover:-translate-y-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-accent-gold/20 transition-colors">
                        <Users className="w-6 h-6 text-zinc-500 group-hover:text-accent-gold transition-colors" />
                    </div>
                    {community.isPublic ? (
                        <Badge variant="secondary" className="text-[10px] flex items-center gap-1 font-medium">
                            <Globe className="w-3 h-3" /> Public
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] flex items-center gap-1 font-medium border-yellow-300 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400">
                            <Lock className="w-3 h-3" /> Private
                        </Badge>
                    )}
                </div>

                <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-accent-gold transition-colors line-clamp-1 mb-1">
                    {community.name}
                </h3>

                {community.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {community.description}
                    </p>
                )}

                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> {community.memberCount} members
                    </span>
                    <span>{community.postCount} posts</span>
                </div>
            </GlassSurface>
        </Link>
    );
}
