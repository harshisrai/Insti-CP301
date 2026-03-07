// ============================================================
// contexts/AuthContext.tsx
// Authentication context for managing user session and auth state
// ============================================================

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { User, SignInRequest, SignUpRequest } from '@/lib/types';
import { getUserById } from '@/lib/db/users';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

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

  // Concurrency lock for syncCookie — prevents overlapping requests
  const syncingRef = React.useRef(false);
  const lastTokenRef = React.useRef<string | null>(undefined);

  // ── Cookie sync (concurrency-safe) ──────────────────────────
  const syncCookie = async (accessToken: string | null) => {
    // Skip if same token
    if (lastTokenRef.current === accessToken) return;
    // Skip if already syncing
    if (syncingRef.current) return;
    syncingRef.current = true;
    lastTokenRef.current = accessToken;

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
    } catch (err) {
      console.error('[AuthContext] syncCookie error:', err);
    } finally {
      syncingRef.current = false;
    }
  };

  // ── Initialize: getSession + listen for changes ─────────────
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Step 1: Get session on mount (no refreshSession — Supabase handles refresh automatically)
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await db.auth.getSession();

        if (session) {
          const userData = await getUserById(session.user.id);
          if (userData) {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error('[AuthContext] checkAuth error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Step 2: Listen for auth changes — THIS is the single source of truth for cookie sync
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange(async (event, session) => {
      // Only act on meaningful events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const userData = await getUserById(session.user.id);
          if (userData) setUser(userData);
          // Sync cookie — the ONLY place this happens for active sessions
          syncCookie(session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        syncCookie(null);
        // Redirect to login if on a protected route
        if (typeof window !== 'undefined' && !isPublicPath(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
      // INITIAL_SESSION is handled by checkAuth above — no action needed here
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ── Sign Up ─────────────────────────────────────────────────
  const signUp = async (data: SignUpRequest) => {
    try {
      setError(null);
      setLoading(true);

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
        await db.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Load the created user
      const userData = await getUserById(authData.user.id);
      if (userData) setUser(userData);

      // Cookie sync is handled by onAuthStateChange(SIGNED_IN) — not here
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Sign In ─────────────────────────────────────────────────
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
      if (userData) setUser(userData);

      // Cookie sync is handled by onAuthStateChange(SIGNED_IN) — not here
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Out ────────────────────────────────────────────────
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await db.auth.signOut();
      if (error) throw error;
      // Cookie clear + user null handled by onAuthStateChange(SIGNED_OUT)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  };

  // ── Update Profile ──────────────────────────────────────────
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      setError(null);

      const { error } = await db
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      const userData = await getUserById(user.id);
      if (userData) setUser(userData);
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
