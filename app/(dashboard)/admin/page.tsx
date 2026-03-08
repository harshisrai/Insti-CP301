'use client';

import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { AdminUserManagement } from '@/components/features/admin/AdminUserManagement';
import { AdminOrgManagement } from '@/components/features/admin/AdminOrgManagement';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'organizations' | 'settings'>('users');

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 text-rose-500 mb-2">
                    <Shield className="h-6 w-6" />
                    <span className="font-medium tracking-wider uppercase text-sm">Governance</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-serif text-foreground">
                    Admin Portal
                </h1>
                <p className="text-muted-foreground text-lg mt-3 max-w-2xl">
                    Manage college users, organizational hierarchy, and assign official Positions of Responsibility (PORs).
                </p>
            </header>

            {/* Tabs */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl overflow-x-auto w-max">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`shrink-0 text-sm font-medium px-6 py-2.5 rounded-lg transition-all ${activeTab === 'users'
                            ? 'bg-white text-rose-600 shadow-sm dark:bg-zinc-800 dark:text-rose-400'
                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                >
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('organizations')}
                    className={`shrink-0 text-sm font-medium px-6 py-2.5 rounded-lg transition-all ${activeTab === 'organizations'
                            ? 'bg-white text-rose-600 shadow-sm dark:bg-zinc-800 dark:text-rose-400'
                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                >
                    College Structure
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`shrink-0 text-sm font-medium px-6 py-2.5 rounded-lg transition-all ${activeTab === 'settings'
                            ? 'bg-white text-rose-600 shadow-sm dark:bg-zinc-800 dark:text-rose-400'
                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                >
                    System Settings
                </button>
            </div>

            {/* Content Area */}
            <div className="pt-2">
                {activeTab === 'users' && <AdminUserManagement />}
                {activeTab === 'organizations' && <AdminOrgManagement />}
                {activeTab === 'settings' && (
                    <div className="p-12 text-center border rounded-xl bg-white/50 dark:bg-zinc-900/50">
                        <h3 className="text-lg font-medium">System Settings</h3>
                        <p className="text-muted-foreground mt-2">Global platform configurations will be placed here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
