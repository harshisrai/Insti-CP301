// ============================================================
// lib/db/feed.ts
// Activity Feed queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { FeedPost } from '@/lib/types';

/**
 * Get feed posts with pagination
 */
export async function getFeedPosts(limit = 20, offset = 0): Promise<FeedPost[]> {
    const { data, error } = await db
        .from('feed_posts')
        .select(`
      id, author_id, posting_identity_id, content, media_urls,
      source_type, source_id, like_count, comment_count,
      is_public, target_roles, created_at, updated_at,
      author:users(id, full_name, role, profile_picture_url)
    `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        // Gracefully handle missing table/view — return empty feed instead of crashing
        console.warn(`[getFeedPosts] ${error.message} (code: ${error.code})`);
        return [];
    }
    return (data ?? []).map(mapFeedPost);
}

/**
 * Create a new feed post
 */
export async function createFeedPost(
    authorId: string,
    content: string,
    mediaUrls: string[] = []
): Promise<FeedPost> {
    const { data, error } = await db
        .from('feed_posts')
        .insert({
            author_id: authorId,
            content,
            media_urls: mediaUrls,
            source_type: 'post',
            is_public: true,
        })
        .select(`
      id, author_id, posting_identity_id, content, media_urls,
      source_type, source_id, like_count, comment_count,
      is_public, target_roles, created_at, updated_at,
      author:users(id, full_name, role, profile_picture_url)
    `)
        .single();

    if (error) throw new Error(`[createFeedPost] ${error.message}`);
    return mapFeedPost(data);
}

/**
 * Map database row to FeedPost type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapFeedPost(row: any): FeedPost {
    return {
        id: row.id,
        authorId: row.author_id,
        postingIdentityId: row.posting_identity_id,
        content: row.content,
        mediaUrls: row.media_urls || [],
        sourceType: row.source_type,
        sourceId: row.source_id,
        likeCount: row.like_count || 0,
        commentCount: row.comment_count || 0,
        isPublic: row.is_public,
        targetRoles: row.target_roles || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: row.author ? mapUser(row.author) : undefined,
    };
}
