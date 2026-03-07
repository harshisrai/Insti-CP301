'use client';

import React, { use } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { BlogForm } from '@/components/features/blogs/BlogForm';
import { useBlog } from '@/lib/hooks/useBlogs';
import { Spinner } from '@/components/ui/spinner';

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const { blog, loading, error } = useBlog(resolvedParams.slug);

    if (loading) {
        return (
            <PageContainer backHref="/blogs">
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Spinner className="w-8 h-8 text-amber-500" />
                    <p className="text-muted-foreground">Loading experience data...</p>
                </div>
            </PageContainer>
        );
    }

    if (error || !blog) {
        return (
            <PageContainer backHref="/blogs">
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-destructive font-bold text-2xl">!</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold">Blog not found</h2>
                    <p className="text-muted-foreground">{error || "The experience you're looking for doesn't exist."}</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Edit Experience"
            description={`Updating: ${blog.title}`}
            backHref="/blogs"
        >
            <div className="mt-8">
                <BlogForm initialData={blog} />
            </div>
        </PageContainer>
    );
}
