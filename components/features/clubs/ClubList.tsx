'use client';

import React from 'react';
import { useOrganizations } from '@/lib/hooks/useOrganizations';
import { ClubCard } from './ClubCard';
import { Loader2, Building2 } from 'lucide-react';
import type { OrgType } from '@/lib/types';

const ORG_TYPES: { value: OrgType | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'club', label: 'Clubs' },
    { value: 'board', label: 'Boards' },
    { value: 'society', label: 'Societies' },
    { value: 'governance_body', label: 'Governance' },
    { value: 'fest_committee', label: 'Fest Committees' },
];

export function ClubList() {
    const { orgs, loading, error, filterType, setFilterType } = useOrganizations();

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load organizations: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filter Tabs */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl overflow-x-auto">
                {ORG_TYPES.map(type => (
                    <button
                        key={type.label}
                        onClick={() => setFilterType(type.value)}
                        className={`shrink-0 text-sm font-medium px-5 py-2 rounded-lg transition-all ${filterType === type.value
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {orgs.map(org => (
                    <ClubCard key={org.id} org={org} />
                ))}
            </div>

            {loading && (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && orgs.length === 0 && (
                <div className="text-center p-16 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No organizations found</h3>
                    <p className="text-sm text-muted-foreground">Try a different filter.</p>
                </div>
            )}
        </div>
    );
}
