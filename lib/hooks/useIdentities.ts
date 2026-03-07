// ============================================================
// lib/hooks/useIdentities.ts
// Hook for fetching User Positions (PORs)
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPositions } from '@/lib/db/organizations';
import type { UserPosition } from '@/lib/types';

interface UseIdentitiesReturn {
    positions: UserPosition[];
    loading: boolean;
    error: string | null;
    refreshPositions: () => Promise<void>;

    // Exposes currently active selected identity logic
    selectedIdentityId: string | null;
    setSelectedIdentityId: (id: string | null) => void;
    selectedIdentity: UserPosition | null;
}

export function useIdentities(userId?: string): UseIdentitiesReturn {
    const { user: authUser } = useAuth();
    const targetUserId = userId || authUser?.id;

    const [positions, setPositions] = useState<UserPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // null = Base Role (Student/Faculty). string = UserPosition ID.
    const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null);

    const fetchPositions = useCallback(async () => {
        if (!targetUserId) {
            setPositions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userPositions = await getUserPositions(targetUserId);
            setPositions(userPositions);
        } catch (err: any) {
            setError(err.message || 'Failed to load user positions');
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    // Derived state to easily grab the full identity object if needed
    const selectedIdentity = selectedIdentityId
        ? positions.find(p => p.id === selectedIdentityId) || null
        : null;

    return {
        positions,
        loading,
        error,
        refreshPositions: fetchPositions,
        selectedIdentityId,
        setSelectedIdentityId,
        selectedIdentity,
    };
}
