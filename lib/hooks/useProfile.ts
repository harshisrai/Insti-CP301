// ============================================================
// lib/hooks/useProfile.ts
// Hook for fetching and updating user profiles
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById, updateUserProfile } from '@/lib/db/users';
import type { User, UpdateProfileRequest } from '@/lib/types';

interface UseProfileReturn {
    profile: User | null;
    loading: boolean;
    error: string | null;
    updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
    refreshProfile: () => Promise<void>;
}

export function useProfile(userId?: string): UseProfileReturn {
    const { user: authUser } = useAuth();

    // If no userId provided, default to the logged in user
    const targetUserId = userId || authUser?.id;

    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userProfile = await getUserById(targetUserId);
            setProfile(userProfile);
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
        if (!targetUserId) return false;

        try {
            setLoading(true);
            setError(null);
            const updatedUser = await updateUserProfile(targetUserId, data);
            setProfile(updatedUser);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            return false;
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, updateProfile, refreshProfile: fetchProfile };
}
