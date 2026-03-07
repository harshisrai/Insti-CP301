'use client';

import React, { use, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, Eye, MessageSquare, Briefcase, User, Calendar, Send, FileText, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useBlog } from '@/lib/hooks/useBlogs';
import { useAuth } from '@/contexts/AuthContext';
import { publishBlogPost, deleteBlogPost } from '@/lib/db/blogs';
import { PageContainer } from '@/components/layout/PageContainer';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { blog, loading, error } = useBlog(resolvedParams.slug);
    const { user } = useAuth();
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handlePublish = async () => {
        if (!blog || publishing) return;
        try {
            setPublishing(true);
            await publishBlogPost(blog.id);
            window.location.reload();
        } catch (err) {
            console.error('[publishBlogPost]', err);
            alert('Failed to publish. Please try again.');
        } finally {
            setPublishing(false);
        }
    };

    const handleDelete = async () => {
        if (!blog || deleting) return;
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

        try {
            setDeleting(true);
            await deleteBlogPost(blog.id);
            router.push('/blogs');
            router.refresh();
        } catch (err) {
            console.error('[deleteBlogPost]', err);
            alert('Failed to delete. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <PageContainer backHref="/blogs">
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Spinner className="w-8 h-8 text-amber-500" />
                    <p className="text-muted-foreground">Loading experience...</p>
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

    const authorName = blog.author?.fullName || 'Anonymous User';
    const authorInitials = authorName.substring(0, 2).toUpperCase();
    const isPlacement = blog.category === 'placement' || blog.category === 'internship';
    const isDraft = blog.status === 'draft';
    const isOwnPost = user?.id === blog.authorId;

    return (
        <PageContainer backHref="/blogs" className="max-w-4xl mx-auto">
            <article className="space-y-8 animate-in fade-in zoom-in-95 duration-500">

                {/* Draft Banner */}
                {isDraft && isOwnPost && (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">This post is a draft</p>
                                <p className="text-xs text-amber-700/70 dark:text-amber-400/70">Only you can see it. Publish when you're ready.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 h-9 px-3"
                                asChild
                            >
                                <Link href={`/blogs/${blog.slug}/edit`}>
                                    <Pencil size={14} />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2 h-9 px-3"
                                onClick={handleDelete}
                                isLoading={deleting}
                            >
                                <Trash2 size={14} />
                                Delete
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="gap-2 h-9 px-4"
                                onClick={handlePublish}
                                isLoading={publishing}
                            >
                                <Send className="w-4 h-4" />
                                Publish
                            </Button>
                        </div>
                    </div>
                )}

                {isDraft && !isOwnPost && (
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-border rounded-xl text-center text-sm text-muted-foreground">
                        This post is a draft and has not been published yet.
                    </div>
                )}

                {/* Header Section */}
                <header className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="capitalize text-amber-600 border-amber-500/30 bg-amber-500/10 px-3 py-1">
                            {blog.category.replace('_', ' ')}
                        </Badge>
                        {isDraft && (
                            <Badge className="bg-zinc-500 text-white border-transparent">Draft</Badge>
                        )}
                        {blog.isFeatured && (
                            <Badge className="bg-amber-500 text-white border-transparent">Featured</Badge>
                        )}
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Clock size={14} />
                            {blog.publishedAt ? formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true }) : 'Draft'}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5 ml-auto">
                            <Eye size={14} /> {blog.viewCount.toLocaleString()} views
                        </span>
                    </div>

                    <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight text-foreground">
                        {blog.title}
                    </h1>

                    {blog.excerpt && (
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {blog.excerpt}
                        </p>
                    )}

                    {/* Author Info */}
                    <div className="flex items-center gap-4 py-6 border-y border-border">
                        <Avatar className="w-12 h-12 ring-2 ring-background border border-border">
                            <AvatarImage src={blog.author?.profilePictureUrl} alt={authorName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{authorInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium text-lg text-foreground">{authorName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-3 mt-0.5">
                                {blog.author?.role && <span className="capitalize"><User size={12} className="inline mr-1" />{blog.author.role}</span>}
                                {blog.publishedAt && <span><Calendar size={12} className="inline mr-1" />{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {blog.featuredImageUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
                        <Image
                            src={blog.featuredImageUrl}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Placement/Internship Meta Details Card */}
                {isPlacement && (blog.companyName || blog.roleApplied || blog.interviewRound) && (
                    <GlassSurface className="bg-amber-500/5 border-amber-500/20 p-6 md:p-8 rounded-2xl">
                        <h3 className="font-serif font-bold text-xl mb-4 text-foreground flex items-center gap-2">
                            <Briefcase className="text-amber-500" />
                            Role Details
                        </h3>
                        <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {blog.companyName && (
                                <div>
                                    <dt className="text-sm text-muted-foreground mb-1">Company</dt>
                                    <dd className="font-medium text-lg text-foreground">{blog.companyName}</dd>
                                </div>
                            )}
                            {blog.roleApplied && (
                                <div>
                                    <dt className="text-sm text-muted-foreground mb-1">Role</dt>
                                    <dd className="font-medium text-lg text-foreground">{blog.roleApplied}</dd>
                                </div>
                            )}
                            {blog.interviewRound && (
                                <div>
                                    <dt className="text-sm text-muted-foreground mb-1">Process / Round</dt>
                                    <dd className="font-medium text-lg text-foreground">{blog.interviewRound}</dd>
                                </div>
                            )}
                        </dl>
                    </GlassSurface>
                )}

                {/* Article Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-amber-600 dark:prose-a:text-amber-400">
                    {blog.content.split('\n').map((paragraph, index) => (
                        paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
                    ))}
                </div>

                {/* Footer Actions */}
                <footer className="pt-10 pb-20 border-t border-border mt-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {blog.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="capitalize">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="gap-2 rounded-full">
                            <MessageSquare size={16} />
                            Discuss ({blog.commentCount})
                        </Button>
                    </div>
                </footer>

            </article>
        </PageContainer>
    );
}

