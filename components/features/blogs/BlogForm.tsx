'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createBlogPost, updateBlogPost } from '@/lib/db/blogs';
import { BlogCategory, BlogPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send } from 'lucide-react';

const CATEGORIES: { label: string; value: BlogCategory }[] = [
    { label: 'Placement', value: 'placement' },
    { label: 'Internship', value: 'internship' },
    { label: 'Faculty Insight', value: 'faculty_insight' },
    { label: 'Alumni Experience', value: 'alumni_experience' },
    { label: 'Research', value: 'research' },
    { label: 'General', value: 'general' },
];

interface BlogFormProps {
    initialData?: BlogPost;
}

export function BlogForm({ initialData }: BlogFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [category, setCategory] = useState<BlogCategory>(initialData?.category || 'general');
    const [content, setContent] = useState(initialData?.content || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
    const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featuredImageUrl || '');

    // Placement/Internship specific fields
    const [companyName, setCompanyName] = useState(initialData?.companyName || '');
    const [roleApplied, setRoleApplied] = useState(initialData?.roleApplied || '');
    const [interviewRound, setInterviewRound] = useState(initialData?.interviewRound || '');

    const isPlacement = category === 'placement' || category === 'internship';

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-6);
    };

    const handleSubmit = async (e: React.FormEvent, publishNow: boolean) => {
        e.preventDefault();
        if (loading) return;
        if (!user) {
            setError('You must be logged in to create or edit a post.');
            return;
        }
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let updatedBlog;

            if (initialData) {
                // Update existing post
                updatedBlog = await updateBlogPost(
                    initialData.id,
                    {
                        title,
                        content,
                        category,
                        excerpt: excerpt || undefined,
                        featuredImageUrl: featuredImageUrl || undefined,
                        companyName: isPlacement ? companyName || undefined : undefined,
                        roleApplied: isPlacement ? roleApplied || undefined : undefined,
                        interviewRound: isPlacement ? interviewRound || undefined : undefined,
                        status: publishNow ? 'published' : initialData.status,
                    }
                );
            } else {
                // Create new post
                const slug = generateSlug(title);
                updatedBlog = await createBlogPost(
                    user.id,
                    title,
                    slug,
                    content,
                    category,
                    excerpt || undefined,
                    featuredImageUrl || undefined,
                    isPlacement ? companyName || undefined : undefined,
                    isPlacement ? roleApplied || undefined : undefined,
                    isPlacement ? interviewRound || undefined : undefined,
                    publishNow
                );
            }

            router.push(`/blogs/${updatedBlog.slug}`);
            router.refresh();
        } catch (err) {
            console.error('[BlogForm submit]', err);
            if (err instanceof DOMException && err.name === 'AbortError') {
                setError('Request timed out. Please check your internet connection and try again.');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to save blog post. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-3xl mx-auto shadow-sm">
            <CardHeader>
                <CardTitle className="font-serif text-2xl">
                    {initialData ? 'Edit Post' : 'Create New Post'}
                </CardTitle>
                <CardDescription>
                    {initialData
                        ? 'Update your experience and keep the community informed.'
                        : 'Share your experiences, insights, and stories with the community.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="E.g., My Google SWE Internship Experience"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                        <Select value={category} onValueChange={(val: BlogCategory) => setCategory(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dynamic Fields for Placement & Internship */}
                    {isPlacement && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g., Microsoft"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roleApplied">Role</Label>
                                <Input
                                    id="roleApplied"
                                    value={roleApplied}
                                    onChange={(e) => setRoleApplied(e.target.value)}
                                    placeholder="e.g., SDE Intern"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interviewRound">Details/Round</Label>
                                <Input
                                    id="interviewRound"
                                    value={interviewRound}
                                    onChange={(e) => setInterviewRound(e.target.value)}
                                    placeholder="e.g., On-Campus 2024"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="featuredImageUrl">Cover Image URL</Label>
                        <Input
                            id="featuredImageUrl"
                            value={featuredImageUrl}
                            onChange={(e) => setFeaturedImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            type="url"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Short Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="A brief summary of your post..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your full story here..."
                            className="min-h-[300px]"
                            required
                        />
                    </div>

                    <div className="pt-6 border-t flex flex-col sm:flex-row justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/blogs')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            disabled={loading}
                            isLoading={loading}
                            onClick={(e) => handleSubmit(e, false)}
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Update Draft' : 'Save as Draft'}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="gap-2"
                            disabled={loading}
                            isLoading={loading}
                            onClick={(e) => handleSubmit(e, true)}
                        >
                            <Send className="w-4 h-4" />
                            {initialData?.status === 'published' ? 'Update Post' : 'Publish Now'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
