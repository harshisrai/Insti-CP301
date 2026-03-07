'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCommunityDetail } from '@/lib/hooks/useCommunities';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Loader2, ArrowLeft, Users, Lock, Globe, MessageSquare, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function CommunityDetail() {
    const params = useParams();
    const router = useRouter();
    const slug = typeof params?.slug === 'string' ? params.slug : null;
    const { community, members, posts, loading, error } = useCommunityDetail(slug);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !community) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center">
                <GlassSurface className="p-8">
                    <h2 className="text-xl font-bold mb-2">Community Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || "This community doesn't exist."}</p>
                    <Button onClick={() => router.push('/communities')}>Back to Communities</Button>
                </GlassSurface>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-8">
            <Button variant="ghost" size="sm" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
                <Link href="/communities"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Communities</Link>
            </Button>

            {/* Header */}
            <GlassSurface className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">{community.name}</h1>
                    {community.isPublic ? (
                        <Badge variant="secondary" className="flex items-center gap-1 font-medium shrink-0">
                            <Globe className="w-3.5 h-3.5" /> Public
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="flex items-center gap-1 font-medium border-yellow-300 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400 shrink-0">
                            <Lock className="w-3.5 h-3.5" /> Private
                        </Badge>
                    )}
                </div>
                {community.description && (
                    <p className="text-muted-foreground mb-4 max-w-2xl">{community.description}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> {community.memberCount} members
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" /> {community.postCount} posts
                    </span>
                    <span>Created by <strong className="text-foreground">{community.creator?.fullName}</strong></span>
                </div>
            </GlassSurface>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Posts */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold font-serif tracking-tight flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> Posts
                    </h2>
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <GlassSurface key={post.id} className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarImage src={post.author?.profilePictureUrl} />
                                        <AvatarFallback className="text-[10px] font-bold">{getInitials(post.author?.fullName || '?')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="text-sm font-semibold text-foreground">{post.author?.fullName}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {post.isPinned && (
                                        <Badge variant="outline" className="ml-auto text-[10px] flex items-center gap-1">
                                            <Pin className="w-3 h-3" /> Pinned
                                        </Badge>
                                    )}
                                </div>
                                {post.title && <h3 className="font-bold text-foreground mb-1">{post.title}</h3>}
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                                    <span>{post.likeCount} likes</span>
                                    <span>{post.commentCount} comments</span>
                                </div>
                            </GlassSurface>
                        ))
                    ) : (
                        <GlassSurface className="p-8 text-center">
                            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground">No posts yet. Be the first to contribute!</p>
                        </GlassSurface>
                    )}
                </div>

                {/* Members Sidebar */}
                <div>
                    <h2 className="text-xl font-bold font-serif tracking-tight mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" /> Members
                    </h2>
                    <GlassSurface className="p-4 space-y-3">
                        {members.length > 0 ? (
                            members.map(member => (
                                <div key={member.id} className="flex items-center gap-2.5">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarImage src={member.user?.profilePictureUrl} />
                                        <AvatarFallback className="text-[10px] font-bold">{getInitials(member.user?.fullName || '?')}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{member.user?.fullName}</p>
                                        <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
                        )}
                    </GlassSurface>
                </div>
            </div>
        </div>
    );
}
