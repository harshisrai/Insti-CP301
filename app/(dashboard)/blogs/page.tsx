'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { BlogList } from '@/components/features/blogs/BlogList';
import { BlogCard } from '@/components/features/blogs/BlogCard';
import { useBlogs } from '@/lib/hooks/useBlogs';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDrafts } from '@/lib/db/blogs';
import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/ui/GlassSurface';
import Link from 'next/link';
import { PlusCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { BlogPost } from '@/lib/types';

export default function BlogsPage() {
    const { blogs, loading, hasMore, loadMore, category, setCategory } = useBlogs();
    const { user } = useAuth();

    const [drafts, setDrafts] = useState<BlogPost[]>([]);
    const [draftsLoading, setDraftsLoading] = useState(false);
    const [showDrafts, setShowDrafts] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;
        setDraftsLoading(true);
        getUserDrafts(user.id).then((data) => {
            if (!cancelled) setDrafts(data);
        }).finally(() => {
            if (!cancelled) setDraftsLoading(false);
        });
        return () => { cancelled = true; };
    }, [user?.id]);

    return (
        <PageContainer
            title="Experiences & Insights"
            description="Read interview experiences, internship stories, and faculty insights."
            actions={
                <Button asChild variant="primary" size="md">
                    <Link href="/blogs/create">
                        <PlusCircle size={18} className="mr-2" />
                        Share Experience
                    </Link>
                </Button>
            }
        >
            <div className="mt-6 space-y-8">

                {/* My Drafts Section */}
                {user && drafts.length > 0 && (
                    <GlassSurface className="p-4 sm:p-5">
                        <button
                            onClick={() => setShowDrafts(!showDrafts)}
                            className="w-full flex items-center justify-between gap-3 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <FileText className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-sm text-foreground">My Drafts</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {drafts.length} unpublished {drafts.length === 1 ? 'post' : 'posts'}
                                    </p>
                                </div>
                            </div>
                            {showDrafts
                                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            }
                        </button>

                        {showDrafts && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {drafts.map((draft) => (
                                    <BlogCard key={draft.id} blog={draft} isDraft />
                                ))}
                            </div>
                        )}
                    </GlassSurface>
                )}

                {/* Loading state for drafts */}
                {user && draftsLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
                        <FileText className="w-4 h-4" />
                        Checking for drafts...
                    </div>
                )}

                {/* Published Blog List */}
                <BlogList
                    blogs={blogs}
                    loading={loading}
                    hasMore={hasMore}
                    loadMore={loadMore}
                    category={category}
                    setCategory={setCategory}
                />
            </div>
        </PageContainer>
    );
}
