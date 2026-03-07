// ============================================================
// lib/db/notices.ts
// Notices database queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import { mapUserPosition } from './organizations';
import type { Notice, NoticeCategory, NoticePriority, PaginationParams, PaginatedResponse } from '@/lib/types';

export interface GetNoticesFilters extends PaginationParams {
    category?: NoticeCategory | 'all';
    priority?: NoticePriority;
    isActive?: boolean;
}

/**
 * Fetch notices with pagination and optional filters
 */
export async function getNotices(filters: GetNoticesFilters = {}): Promise<PaginatedResponse<Notice>> {
    const { page = 1, limit = 20, category, priority, isActive = true } = filters;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = db
        .from('notices')
        .select(`
      id, posted_by, posting_identity_id, title,
      category, priority, tags, target_roles, target_departments, target_batches,
      attachments, is_active, is_pinned, valid_from, valid_until,
      created_at, updated_at,
      poster:users!notices_posted_by_fkey(id, full_name, role, profile_picture_url),
      postingIdentity:user_positions!notices_posting_identity_id_fkey(
        id, title, por_type, is_active,
        org:organizations(id, name, slug, type, logo_url)
      )
    `, { count: 'estimated' });

    // Apply filters
    if (isActive !== undefined) {
        query = query.eq('is_active', isActive);

        if (isActive) {
            const now = new Date().toISOString();
            query = query.or(`valid_until.is.null,valid_until.gte.${now}`);
        }
    }

    if (category && category !== 'all') {
        query = query.eq('category', category);
    }

    if (priority) {
        query = query.eq('priority', priority);
    }

    query = query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(start, end);

    const { data, error, count } = await query;

    if (error) {
        console.warn(`[getNotices] ${error.message}`);
        return { data: [], total: 0, page, limit, hasMore: false };
    }

    return {
        data: (data ?? []).map(mapNotice),
        total: count ?? 0,
        page,
        limit,
        hasMore: count ? start + limit < count : false,
    };
}

/**
 * Create a new notice
 */
export async function createNotice(
    noticeData: Partial<Notice> & { postedBy: string }
): Promise<Notice | null> {
    const { data, error } = await db
        .from('notices')
        .insert([{
            posted_by: noticeData.postedBy,
            posting_identity_id: noticeData.postingIdentityId || null,
            title: noticeData.title,
            content: noticeData.content,
            category: noticeData.category || 'general',
            priority: noticeData.priority || 'medium',
            tags: noticeData.tags || [],
            target_roles: noticeData.targetRoles || [],
            target_departments: noticeData.targetDepartments || [],
            target_batches: noticeData.targetBatches || [],
            attachments: noticeData.attachments || [],
            is_active: noticeData.isActive !== false,
            is_pinned: noticeData.isPinned || false,
            valid_from: noticeData.validFrom || new Date().toISOString(),
            valid_until: noticeData.validUntil || null,
        }])
        .select(`
      *,
      poster:users!notices_posted_by_fkey(id, email, full_name, role, profile_picture_url),
      postingIdentity:user_positions!notices_posting_identity_id_fkey(
        id, title, por_type, valid_from, valid_until, is_active,
        org:organizations(id, name, slug, type, logo_url)
      )
    `)
        .single();

    if (error) throw new Error(`[createNotice] ${error.message}`);
    return data ? mapNotice(data) : null;
}

/**
 * Toggle pinned status (Admin/Staff only)
 */
export async function toggleNoticePin(noticeId: string, isPinned: boolean): Promise<boolean> {
    const { error } = await db
        .from('notices')
        .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
        .eq('id', noticeId);

    if (error) throw new Error(`[toggleNoticePin] ${error.message}`);
    return true;
}

/**
 * Map database row to Notice type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotice(row: any): Notice {
    return {
        id: row.id,
        postedBy: row.posted_by,
        postingIdentityId: row.posting_identity_id,
        title: row.title,
        content: row.content,
        category: row.category,
        priority: row.priority,
        tags: row.tags || [],
        targetRoles: row.target_roles || [],
        targetDepartments: row.target_departments || [],
        targetBatches: row.target_batches || [],
        attachments: row.attachments || [],
        isActive: row.is_active,
        isPinned: row.is_pinned,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        poster: row.poster ? mapUser(row.poster) : undefined,
        postingIdentity: row.postingIdentity ? mapUserPosition(row.postingIdentity) : undefined,
    };
}
