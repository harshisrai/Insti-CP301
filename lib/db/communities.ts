// ============================================================
// lib/db/communities.ts
// Database queries for Communities module
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { Community, CommunityMember, CommunityPost, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface GetCommunityFilters extends PaginationParams {
    search?: string;
    isPublic?: boolean;
}

/**
 * Fetch all communities with pagination
 */
export async function getCommunities(filters: GetCommunityFilters = {}): Promise<PaginatedResponse<Community>> {
    const { page = 1, limit = 20, search, isPublic } = filters;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = db
        .from('communities')
        .select(`
      id, creator_id, name, slug, description,
      is_public, requires_approval, allow_posts,
      member_count, post_count, created_at, updated_at,
      creator:users!communities_creator_id_fkey(id, full_name, role, profile_picture_url)
    `, { count: 'estimated' });

    if (isPublic !== undefined) {
        query = query.eq('is_public', isPublic);
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    query = query
        .order('member_count', { ascending: false })
        .range(start, end);

    const { data, error, count } = await query;

    if (error) {
        console.warn(`[getCommunities] ${error.message}`);
        return { data: [], total: 0, page, limit, hasMore: false };
    }

    return {
        data: (data ?? []).map(mapCommunity),
        total: count ?? 0,
        page,
        limit,
        hasMore: count ? start + limit < count : false,
    };
}

/**
 * Get a single community by slug
 */
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
    const { data, error } = await db
        .from('communities')
        .select(`
      *,
      creator:users!communities_creator_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
        .eq('slug', slug)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getCommunityBySlug] ${error.message}`);
    }
    return data ? mapCommunity(data) : null;
}

/**
 * Create a new community
 */
export async function createCommunity(communityData: {
    creatorId: string;
    name: string;
    slug: string;
    description?: string;
    isPublic: boolean;
    requiresApproval: boolean;
}): Promise<Community | null> {
    const { data, error } = await db
        .from('communities')
        .insert([{
            creator_id: communityData.creatorId,
            name: communityData.name,
            slug: communityData.slug,
            description: communityData.description || null,
            is_public: communityData.isPublic,
            requires_approval: communityData.requiresApproval,
            allow_posts: true,
        }])
        .select(`
      *,
      creator:users!communities_creator_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
        .single();

    if (error) throw new Error(`[createCommunity] ${error.message}`);
    return data ? mapCommunity(data) : null;
}

/**
 * Get members of a community
 */
export async function getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    const { data, error } = await db
        .from('community_members')
        .select(`
      id, community_id, user_id, role, joined_at,
      user:users!community_members_user_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: true });

    if (error) throw new Error(`[getCommunityMembers] ${error.message}`);
    return (data ?? []).map(mapCommunityMember);
}

/**
 * Get posts in a community
 */
export async function getCommunityPosts(communityId: string, page = 1, limit = 20): Promise<PaginatedResponse<CommunityPost>> {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await db
        .from('community_posts')
        .select(`
      id, community_id, author_id, title, content,
      media_urls, like_count, comment_count, is_pinned,
      created_at,
      author:users!community_posts_author_id_fkey(id, full_name, role, profile_picture_url)
    `, { count: 'estimated' })
        .eq('community_id', communityId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(start, end);

    if (error) {
        console.warn(`[getCommunityPosts] ${error.message}`);
        return { data: [], total: 0, page, limit, hasMore: false };
    }

    return {
        data: (data ?? []).map(mapCommunityPost),
        total: count ?? 0,
        page,
        limit,
        hasMore: count ? start + limit < count : false,
    };
}

// ========================
// MAPPERS
// ========================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunity(row: any): Community {
    return {
        id: row.id,
        creatorId: row.creator_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        isPublic: row.is_public,
        requiresApproval: row.requires_approval,
        allowPosts: row.allow_posts,
        memberCount: row.member_count || 0,
        postCount: row.post_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        creator: row.creator ? mapUser(row.creator) : undefined,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunityMember(row: any): CommunityMember {
    return {
        id: row.id,
        communityId: row.community_id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.joined_at,
        user: row.user ? mapUser(row.user) : undefined,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunityPost(row: any): CommunityPost {
    return {
        id: row.id,
        communityId: row.community_id,
        authorId: row.author_id,
        title: row.title,
        content: row.content,
        mediaUrls: row.media_urls || [],
        likeCount: row.like_count || 0,
        commentCount: row.comment_count || 0,
        isPinned: row.is_pinned,
        createdAt: row.created_at,
        author: row.author ? mapUser(row.author) : undefined,
    };
}
