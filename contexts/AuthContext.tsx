// ============================================================
// contexts/AuthContext.tsx
// Authentication context for managing user session and auth state
// ============================================================

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { User, SignInRequest, SignUpRequest } from '@/lib/types';
import { getUserById } from '@/lib/db/users';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (data: SignUpRequest) => Promise<void>;
  signIn: (data: SignInRequest) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = React.useRef(false);
  const lastTokenRef = React.useRef<string | null>(undefined);

  console.log(`[${new Date().toISOString()}] [AuthContext] Hook Rendered - User: ${user?.id || 'null'}, Loading: ${loading}`);

  // Check auth state on mount
  useEffect(() => {
    if (isInitialized.current) {
      console.log(`[${new Date().toISOString()}] [AuthContext] Skip redundant initialization`);
      return;
    }
    isInitialized.current = true;

    async function checkAuth() {
      console.log(`[AuthContext] checkAuth started`);
      try {
        const {
          data: { session },
        } = await db.auth.getSession();
        console.log(`[AuthContext] getSession returned - session exists: ${!!session}`);

        if (session?.user) {
          const userData = await getUserById(session.user.id);
          if (userData) {
            setUser(userData);
            console.log(`[AuthContext] Syncing cookie on checkAuth`);
            await syncCookie(session.access_token);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error checking auth:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] onAuthStateChange - Event: ${event}, Session exists: ${!!session}`);
      if (session) {
        try {
          const userData = await getUserById(session.user.id);
          if (userData) {
            setUser(userData);
            console.log(`[AuthContext] Syncing cookie on onAuthStateChange (${event})`);
            await syncCookie(session.access_token);
          }
        } catch (err) {
          console.error('[AuthContext] Error loading user:', err);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Helper to sync cookie with server
  const syncCookie = async (accessToken: string | null) => {
    const startTime = Date.now();
    if (lastTokenRef.current === accessToken) {
      console.log(`[${new Date().toISOString()}] [AuthContext] syncCookie - Token unchanged, skipping`);
      return;
    }
    lastTokenRef.current = accessToken;
    console.log(`[${new Date().toISOString()}] [AuthContext] syncCookie started - token exists: ${!!accessToken}`);
    try {
      if (accessToken) {
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        });
      } else {
        await fetch('/api/auth/clear-cookie', { method: 'POST' });
      }
      console.log(`[${new Date().toISOString()}] [AuthContext] syncCookie SUCCESS - Duration: ${Date.now() - startTime}ms`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] [AuthContext] syncCookie FATAL ERROR:`, err);
    }
  };

  const signUp = async (data: SignUpRequest) => {
    try {
      setError(null);
      setLoading(true);

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await db.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Sign up failed');

      // Create user profile using service_role (SECURITY DEFINER function)
      const { error: profileError } = await db.rpc('create_user_profile', {
        p_id: authData.user.id,
        p_email: data.email,
        p_full_name: data.fullName,
        p_role: data.role,
        p_department: data.department || null,
        p_branch: data.branch || null,
        p_batch: data.batch || null,
      });

      if (profileError) {
        // Clean up auth user if profile creation fails
        await db.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Load the created user
      const userData = await getUserById(authData.user.id);
      if (userData) {
        setUser(userData);
      }

      // Sync cookie server-side BEFORE redirecting
      await syncCookie(authData.session?.access_token || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInRequest) => {
    try {
      setError(null);
      setLoading(true);

      const { data: authData, error: signInError } = await db.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('Sign in failed');

      // Load user profile
      const userData = await getUserById(authData.user.id);
      if (userData) {
        setUser(userData);
      }

      // Sync cookie server-side BEFORE redirecting
      await syncCookie(authData.session?.access_token || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await syncCookie(null); // Clear server cookie first
      const { error } = await db.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      setError(null);

      const { error } = await db
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Reload user data
      const userData = await getUserById(user.id);
      if (userData) {
        setUser(userData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
