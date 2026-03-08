'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for auth to finish loading
        if (loading) return;

        // If not logged in or not admin, bounce them out
        if (!user || !user.isAdmin) {
            router.replace('/');
        } else {
            setIsChecking(false);
        }
    }, [user, loading, router]);

    // Show nothing or a loader while validating access
    if (loading || isChecking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-rose-500" />
                <h2 className="text-xl font-medium">Verifying Credentials...</h2>
            </div>
        );
    }

    // Double check just in case
    if (!user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 text-rose-500">
                <ShieldAlert className="h-16 w-16 mb-2" />
                <h1 className="text-3xl font-bold font-serif">Access Denied</h1>
                <p className="text-muted-foreground max-w-md">
                    You do not have administrative privileges to view this page.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {children}
        </div>
    );
}
