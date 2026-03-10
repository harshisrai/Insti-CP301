'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NoticeList } from '@/components/features/notices/NoticeList';
import { Button } from '@/components/ui/button';
import { Plus, BellRing, Filter } from 'lucide-react';
import Link from 'next/link';
import type { NoticeCategory } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NoticesPage() {
    const { user, activePositions, selectedIdentityId } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>('all');
    const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only faculty/staff OR students posting as an official POR identity can see the create button
    const canPostNotice = !!user && (
        user.role === 'faculty' ||
        user.role === 'staff' ||
        (selectedIdentityId !== null && activePositions !== null && activePositions.some(p => p.id === selectedIdentityId))
    );

    const categories: { label: string; value: NoticeCategory | 'all' }[] = [
        { label: 'All Notices', value: 'all' },
        { label: 'Academic', value: 'academic' },
        { label: 'Administrative', value: 'administrative' },
        { label: 'Placement', value: 'placement' },
        { label: 'Hostel', value: 'hostel' },
        { label: 'Sports', value: 'sports' },
        { label: 'Wellness', value: 'wellness' },
        { label: 'General', value: 'general' },
    ];

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black font-serif tracking-tight text-foreground flex items-center gap-3">
                        <BellRing className="w-8 h-8 text-accent-gold" />
                        Official Notices
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                        Official announcements, deadlines, and communications from the institute administration and students' gymkhana.
                    </p>
                </div>

                {isMounted && canPostNotice && (
                    <Button asChild className="shrink-0 font-semibold px-6 rounded-full">
                        <Link href="/notices/create">
                            <Plus className="w-4 h-4 mr-2" /> Publish Notice
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-border">
                {/* Status Tabs (Only visible to authors) */}
                {isMounted && canPostNotice ? (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'published' | 'draft')} className="w-full md:w-auto">
                        <TabsList className="bg-black/5 dark:bg-black/20 p-1">
                            <TabsTrigger value="published" className="rounded-md px-6">Published</TabsTrigger>
                            <TabsTrigger value="draft" className="rounded-md px-6">My Drafts</TabsTrigger>
                        </TabsList>
                    </Tabs>
                ) : (
                    <div className="hidden md:block"></div>
                )}

                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <Filter className="w-4 h-4 text-muted-foreground ml-2" />
                    {isMounted ? (
                        <Select
                            value={selectedCategory}
                            onValueChange={(val) => setSelectedCategory(val as NoticeCategory | 'all')}
                        >
                            <SelectTrigger className="w-full sm:w-[200px] border-none shadow-none focus:ring-0 bg-transparent">
                                <SelectValue placeholder="Filter by Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="w-full sm:w-[200px] h-10 rounded-md bg-muted animate-pulse"></div>
                    )}
                </div>
            </div>

            <NoticeList category={selectedCategory} status={activeTab} />
        </div>
    );
}
