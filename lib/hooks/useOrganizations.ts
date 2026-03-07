// ============================================================
// lib/hooks/useOrganizations.ts
// Hook for fetching organizations (Clubs & Bodies) directory
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { getOrganizations, getOrganizationBySlug, getOrgMembers, getOrgPositions } from '@/lib/db/organizations';
import type { Organization, OrgMember, UserPosition, OrgType } from '@/lib/types';

export function useOrganizations(typeFilter?: OrgType) {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<OrgType | undefined>(typeFilter);

    const fetchOrgs = useCallback(async (type?: OrgType) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrganizations(type);
            setOrgs(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load organizations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrgs(filterType);
    }, [filterType, fetchOrgs]);

    return {
        orgs,
        loading,
        error,
        filterType,
        setFilterType,
        refreshOrgs: () => fetchOrgs(filterType),
    };
}

/**
 * Hook to fetch a single organization by slug with its members and positions
 */
export function useOrganizationDetail(slug: string | null) {
    const [org, setOrg] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [positions, setPositions] = useState<UserPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchDetail() {
            if (!slug) { setLoading(false); return; }

            try {
                setLoading(true);
                setError(null);
                const orgData = await getOrganizationBySlug(slug);
                if (!isMounted) return;
                setOrg(orgData);

                if (orgData) {
                    const [membersData, positionsData] = await Promise.all([
                        getOrgMembers(orgData.id),
                        getOrgPositions(orgData.id),
                    ]);
                    if (isMounted) {
                        setMembers(membersData);
                        setPositions(positionsData);
                    }
                }
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Failed to fetch organization details');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchDetail();
        return () => { isMounted = false; };
    }, [slug]);

    return { org, members, positions, loading, error };
}
