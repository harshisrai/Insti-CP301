import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Clock, MessageSquare, Briefcase } from 'lucide-react';
import { BlogPost } from '@/lib/types';
import { cn } from '@/lib/utils';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  blog: BlogPost;
  className?: string;
  isDraft?: boolean;
}

const categoryColors: Record<string, string> = {
  placement: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  internship: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  faculty_insight: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  alumni_experience: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  research: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  general: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
};

export function BlogCard({ blog, className, isDraft }: BlogCardProps) {
  const publishedDate = blog.publishedAt
    ? formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true })
    : 'Draft';

  const authorName = blog.author?.fullName || 'Anonymous User';
  const authorInitials = authorName.substring(0, 2).toUpperCase();

  return (
    <Link href={`/blogs/${blog.slug}`} className={cn("block group", className)}>
      <GlassSurface className="h-full flex flex-col p-4 overflow-hidden gap-4">

        {/* Cover Image */}
        {blog.featuredImageUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden shrink-0">
            <Image
              src={blog.featuredImageUrl}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="relative w-full h-48 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
            <span className="font-serif font-bold text-4xl text-muted-foreground/30">DEP</span>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 gap-3">
          {/* Header Row: Category Badge & Company (if placement/internship) */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("capitalize px-2 py-0.5", categoryColors[blog.category] || categoryColors.general)}>
              {blog.category.replace('_', ' ')}
            </Badge>

            {blog.companyName && (
              <Badge variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-xs font-normal border-transparent gap-1">
                <Briefcase size={12} className="opacity-70" />
                {blog.companyName}
              </Badge>
            )}

            {blog.isFeatured && (
              <Badge className="bg-amber-500 text-white border-transparent hover:bg-amber-600">Featured</Badge>
            )}
            {isDraft && (
              <Badge variant="outline" className="bg-zinc-500/10 text-zinc-600 border-zinc-500/20">Draft</Badge>
            )}
          </div>

          {/* Title & Excerpt */}
          <div className="space-y-1.5 flex-1">
            <h3 className="font-serif font-bold text-lg md:text-xl text-foreground line-clamp-2 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {blog.title}
            </h3>
            {blog.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {blog.excerpt}
              </p>
            )}
          </div>

          {/* Footer: Author & Meta Stats */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-8 h-8 rounded-lg ring-2 ring-background border border-border">
                <AvatarImage src={blog.author?.profilePictureUrl} alt={authorName} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">{authorInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground leading-none">{authorName}</span>
                <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock size={10} /> {publishedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Eye size={14} className="opacity-70" />
                <span>{(blog.viewCount ?? 0).toLocaleString()}</span>
              </div>
              {blog.allowComments && (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <MessageSquare size={14} className="opacity-70" />
                  <span>{(blog.commentCount ?? 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassSurface>
    </Link>
  );
}
