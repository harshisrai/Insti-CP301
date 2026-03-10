'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrganizationDetail } from '@/lib/hooks/useOrganizations';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Loader2, ArrowLeft, Users, ShieldCheck, Mail, Globe, Calendar } from 'lucide-react';
import Link from 'next/link';

export function ClubDetail() {
    const params = useParams();
    const router = useRouter();
    const slug = typeof params?.slug === 'string' ? params.slug : null;
    const { org, members, positions, children, loading, error } = useOrganizationDetail(slug);
    const isParentBody = org?.type === 'board' || org?.type === 'governance_body';

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !org) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center">
                <GlassSurface className="p-8">
                    <h2 className="text-xl font-bold mb-2">Organization Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || "This organization doesn't exist."}</p>
                    <Button onClick={() => router.push('/clubs')}>Back to Directory</Button>
                </GlassSurface>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-8">
            <Button variant="ghost" size="sm" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
                <Link href="/clubs"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory</Link>
            </Button>

            {/* Header */}
            <GlassSurface className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24 border-2 border-border shrink-0">
                    <AvatarImage src={org.logoUrl} />
                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-3xl font-bold">{getInitials(org.name)}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider mb-2">
                        {org.type.replace('_', ' ')}
                    </Badge>
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">{org.name}</h1>
                    {org.description && (
                        <p className="text-muted-foreground mt-2 max-w-xl">{org.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {org.email && (
                            <a href={`mailto:${org.email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                <Mail className="w-4 h-4" /> {org.email}
                            </a>
                        )}
                        {org.foundedYear && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> Est. {org.foundedYear}
                            </span>
                        )}
                        {org.socialLinks && Object.entries(org.socialLinks).map(([key, url]) => (
                            <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors capitalize">
                                <Globe className="w-4 h-4" /> {key}
                            </a>
                        ))}
                    </div>
                </div>
            </GlassSurface>

            {/* Positions of Responsibility */}
            {positions.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold font-serif tracking-tight mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent-gold" /> {isParentBody ? 'General Secretary' : 'Office Bearers'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {(isParentBody ? positions.filter(p => p.title.toLowerCase().includes('general secretary') || p.title.toLowerCase().includes('gsec')) : positions).map(pos => (
                            <GlassSurface key={pos.id} className="p-4 flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage src={pos.user?.profilePictureUrl} />
                                    <AvatarFallback className="text-sm font-bold">{getInitials(pos.user?.fullName || '?')}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-foreground truncate">{pos.user?.fullName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{pos.title}</p>
                                </div>
                            </GlassSurface>
                        ))}
                    </div>
                </div>
            )}

            {/* Child Organizations (For Boards/Governance Bodies) */}
            {isParentBody && children && children.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold font-serif tracking-tight mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent-cyan" /> Associated Clubs
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {children.map(child => (
                            <Link key={child.id} href={`/clubs/${child.slug}`}>
                                <GlassSurface className="p-4 flex items-center gap-3 hover:border-accent-cyan/50 transition-colors cursor-pointer h-full">
                                    <Avatar className="h-12 w-12 border-2 border-border shrink-0">
                                        <AvatarImage src={child.logoUrl} />
                                        <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 font-bold">{getInitials(child.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">{child.name}</p>
                                        <Badge variant="secondary" className="text-[9px] uppercase mt-1">
                                            {child.type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </GlassSurface>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Members (Hide for Boards) */}
            {!isParentBody && members.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold font-serif tracking-tight mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" /> Members <span className="text-sm font-normal text-muted-foreground">({members.length})</span>
                    </h2>
                    <GlassSurface className="p-4">
                        <div className="flex flex-wrap gap-3">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-lg">
                                    <Avatar className="h-7 w-7 border">
                                        <AvatarImage src={member.user?.profilePictureUrl} />
                                        <AvatarFallback className="text-[10px] font-bold">{getInitials(member.user?.fullName || '?')}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-foreground">{member.user?.fullName}</span>
                                </div>
                            ))}
                        </div>
                    </GlassSurface>
                </div>
            )}

            {positions.length === 0 && members.length === 0 && (!isParentBody || children?.length === 0) && (
                <GlassSurface className="p-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No members, office bearers, or child organizations listed yet.</p>
                </GlassSurface>
            )}
        </div>
    );
}
