import React from 'react';
import Link from 'next/link';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import type { Organization } from '@/lib/types';

interface ClubCardProps {
    org: Organization;
}

const orgTypeLabels: Record<string, string> = {
    club: 'Club',
    board: 'Board',
    society: 'Society',
    governance_body: 'Governance',
    fest_committee: 'Fest Committee',
};

export function ClubCard({ org }: ClubCardProps) {
    return (
        <Link href={`/clubs/${org.slug}`} className="block group h-full">
            <GlassSurface className="h-full flex flex-col items-center text-center p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/5 hover:-translate-y-1">
                <Avatar className="h-20 w-20 border-2 border-border mb-4 transition-transform duration-300 group-hover:scale-110">
                    <AvatarImage src={org.logoUrl} />
                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-2xl font-bold">{getInitials(org.name)}</AvatarFallback>
                </Avatar>

                <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider mb-2">
                    {orgTypeLabels[org.type] || org.type}
                </Badge>

                <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-accent-gold transition-colors line-clamp-2 mb-1">
                    {org.name}
                </h3>

                {org.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {org.description}
                    </p>
                )}

                {org.foundedYear && (
                    <span className="text-[10px] text-muted-foreground mt-auto pt-3 opacity-70">
                        Est. {org.foundedYear}
                    </span>
                )}
            </GlassSurface>
        </Link>
    );
}
