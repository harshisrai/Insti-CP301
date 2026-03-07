import React from 'react';
import Link from 'next/link';
import { PenTool, ChevronRight } from 'lucide-react';
import { BlogPost } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedBlogsWidgetProps {
    blogs: BlogPost[];
}

export function FeaturedBlogsWidget({ blogs }: FeaturedBlogsWidgetProps) {
    if (blogs.length === 0) return null;

    return (
        <GlassSurface className="p-5 flex flex-col pt-4 border-emerald-500/10 dark:border-emerald-400/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                    <PenTool className="text-emerald-500 w-5 h-5" />
                    Top Experiences
                </h3>
                <Link href="/blogs" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center">
                    View all <ChevronRight size={14} />
                </Link>
            </div>

            <div className="space-y-3">
                {blogs.map((blog) => (
                    <Link key={blog.id} href={`/blogs/${blog.slug}`} className="block group">
                        <div className="p-3 -mx-3 rounded-lg hover:bg-emerald-500/5 transition-colors border border-transparent hover:border-emerald-500/20">
                            <h4 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                                {blog.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="capitalize">{blog.category.replace('_', ' ')}</span>
                                {blog.publishedAt && <span>{formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true })}</span>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </GlassSurface>
    );
}
