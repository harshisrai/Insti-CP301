import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { FeedPost } from '@/lib/types';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface FeedPostCardProps {
    post: FeedPost;
}

export function FeedPostCard({ post }: FeedPostCardProps) {
    const authorName = post.author?.fullName || 'Anonymous';
    const authorInitials = authorName.substring(0, 2).toUpperCase();
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
        <GlassSurface className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border/50">
                        <AvatarImage src={post.author?.profilePictureUrl} alt={authorName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {authorInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <Link
                            href={`/profile/${post.authorId}`}
                            className="font-medium text-foreground hover:underline"
                        >
                            {authorName}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {post.author?.role && <span className="capitalize">{post.author.role}</span>}
                            {post.author?.role && <span>•</span>}
                            <span>{timeAgo}</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal size={18} />
                </Button>
            </div>

            {/* Content */}
            <div className="text-foreground text-sm sm:text-base whitespace-pre-wrap leading-relaxed mb-4">
                {post.content}
            </div>

            {/* Media (Placeholder for future image support) */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-border/50 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.mediaUrls[0]}
                        alt="Post media"
                        className="w-full h-auto max-h-[400px] object-cover"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 sm:gap-6 pt-3 border-t border-border/50 text-muted-foreground">
                <Button variant="ghost" size="sm" className="gap-2 hover:text-amber-500 hover:bg-amber-500/10 px-2 sm:px-3">
                    <Heart size={18} />
                    <span className="text-sm font-medium">{post.likeCount > 0 ? post.likeCount : 'Like'}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-500 hover:bg-blue-500/10 px-2 sm:px-3">
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">{post.commentCount > 0 ? post.commentCount : 'Comment'}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 hover:text-emerald-500 hover:bg-emerald-500/10 px-2 sm:px-3 ml-auto">
                    <Share2 size={18} />
                    <span className="text-sm font-medium hidden sm:inline">Share</span>
                </Button>
            </div>
        </GlassSurface>
    );
}
