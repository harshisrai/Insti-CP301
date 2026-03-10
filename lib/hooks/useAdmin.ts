import { useState, useCallback, useRef, useEffect } from 'react';
import {
    getAllUsers,
    updateUserRole,
    updateUserStatus
} from '../db/users';
import {
    createOrganization,
    updateOrganization,
    upsertOrganization,
    getAllOrgMembers,
    getAllOrgPositions,
    upsertMemberByEntry,
    upsertPORByEntry,
    assignUserPosition,
    revokeUserPosition,
    addOrgMember,
    removeOrgMember,
    getOrganizations,
    getOrgMembers,
    getOrgPositions
} from '../db/organizations';
import type { User, Organization, UserPosition, OrgMember } from '../types';

export function useAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // ========================
    // USERS
    // ========================

    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            return await getAllUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
            return [];
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const changeUserRole = useCallback(async (userId: string, role: string, isAdmin: boolean) => {
        setLoading(true);
        setError(null);
        try {
            return await updateUserRole(userId, role, isAdmin);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user role');
            return null;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const changeUserStatus = useCallback(async (userId: string, status: string) => {
        setLoading(true);
        setError(null);
        try {
            return await updateUserStatus(userId, status);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user status');
            return null;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    // ========================
    // ORGANIZATIONS
    // ========================

    const fetchAllOrganizations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Passing undefined fetches all active organizations regardless of type
            return await getOrganizations();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
            return [];
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const createNewOrg = useCallback(async (data: Partial<Organization>) => {
        setLoading(true);
        setError(null);
        try {
            return await createOrganization(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create organization');
            return null;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const updateOrg = useCallback(async (orgId: string, data: Partial<Organization>) => {
        setLoading(true);
        setError(null);
        try {
            return await updateOrganization(orgId, data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update organization');
            return null;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const bulkUpsertOrgs = useCallback(async (
        rows: Parameters<typeof upsertOrganization>[0][]
    ): Promise<{ succeeded: number; failed: { row: string; reason: string }[] }> => {
        setLoading(true);
        setError(null);
        let succeeded = 0;
        const failed: { row: string; reason: string }[] = [];
        for (const row of rows) {
            try {
                await upsertOrganization(row);
                succeeded++;
            } catch (err) {
                failed.push({
                    row: row.slug,
                    reason: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }
        if (mountedRef.current) setLoading(false);
        return { succeeded, failed };
    }, []);

    // ---- Bulk member upload ----
    const fetchAllMembers = useCallback(async () => {
        try { return await getAllOrgMembers(); }
        catch { return []; }
    }, []);

    const fetchAllPositions = useCallback(async () => {
        try { return await getAllOrgPositions(); }
        catch { return []; }
    }, []);

    type BulkResult = { succeeded: number; failed: { row: string; reason: string }[] };

    const bulkUpsertMembers = useCallback(async (
        rows: Parameters<typeof upsertMemberByEntry>[0][]
    ): Promise<BulkResult> => {
        setLoading(true);
        let succeeded = 0;
        const failed: BulkResult['failed'] = [];
        for (const row of rows) {
            try {
                await upsertMemberByEntry(row);
                succeeded++;
            } catch (err) {
                failed.push({ row: `${row.entry_number}@${row.org_slug}`, reason: err instanceof Error ? err.message : 'Unknown' });
            }
        }
        if (mountedRef.current) setLoading(false);
        return { succeeded, failed };
    }, []);

    const bulkUpsertPORs = useCallback(async (
        rows: Parameters<typeof upsertPORByEntry>[0][]
    ): Promise<BulkResult> => {
        setLoading(true);
        let succeeded = 0;
        const failed: BulkResult['failed'] = [];
        for (const row of rows) {
            try {
                await upsertPORByEntry(row);
                succeeded++;
            } catch (err) {
                failed.push({ row: `${row.entry_number}@${row.org_slug}`, reason: err instanceof Error ? err.message : 'Unknown' });
            }
        }
        if (mountedRef.current) setLoading(false);
        return { succeeded, failed };
    }, []);

    // ========================
    // ORGANIZATION ROSTERS
    // ========================

    const fetchOrgMembers = useCallback(async (orgId: string) => {
        setLoading(true);
        setError(null);
        try {
            return await getOrgMembers(orgId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch org members');
            return [];
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const fetchOrgPositions = useCallback(async (orgId: string) => {
        setLoading(true);
        setError(null);
        try {
            return await getOrgPositions(orgId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch org positions');
            return [];
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const assignPOR = useCallback(async (data: Omit<UserPosition, 'id' | 'createdAt' | 'org' | 'user'>) => {
        setLoading(true);
        setError(null);
        try {
            return await assignUserPosition(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign position');
            return null;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const revokePOR = useCallback(async (positionId: string) => {
        setLoading(true);
        setError(null);
        try {
            return await revokeUserPosition(positionId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to revoke position');
            return false;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const addMember = useCallback(async (orgId: string, userId: string) => {
        setLoading(true);
        setError(null);
        try {
            return await addOrgMember(orgId, userId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add member');
            return null;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const removeMember = useCallback(async (orgId: string, userId: string) => {
        setLoading(true);
        setError(null);
        try {
            return await removeOrgMember(orgId, userId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove member');
            return false;
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchAllUsers,
        changeUserRole,
        changeUserStatus,
        fetchAllOrganizations,
        createNewOrg,
        updateOrg,
        bulkUpsertOrgs,
        fetchAllMembers,
        fetchAllPositions,
        bulkUpsertMembers,
        bulkUpsertPORs,
        fetchOrgMembers,
        fetchOrgPositions,
        assignPOR,
        revokePOR,
        addMember,
        removeMember
    };
}
