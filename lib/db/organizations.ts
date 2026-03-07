// ============================================================
// lib/db/organizations.ts
// Organizations and Positions of Responsibility queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { Organization, UserPosition, OrgMember, OrgType } from '@/lib/types';

/**
 * Get all active positions (PORs) for a user
 */
export async function getUserPositions(userId: string): Promise<UserPosition[]> {
    const { data, error } = await db
        .from('user_positions')
        .select(`
      id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
      org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
    `)
        .eq('user_id', userId)
        .eq('is_active', true)

    if (error) throw new Error(`[getUserPositions] ${error.message}`);
    return (data ?? []).map(mapUserPosition);
}

/**
 * Get a single position by ID
 */
export async function getPositionById(positionId: string): Promise<UserPosition | null> {
    const { data, error } = await db
        .from('user_positions')
        .select(`
      id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
      org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
    `)
        .eq('id', positionId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getPositionById] ${error.message}`);
    }
    return data ? mapUserPosition(data) : null;
}

/**
 * Get all active organizations (Clubs, Boards, etc.)
 */
export async function getOrganizations(type?: OrgType): Promise<Organization[]> {
    let query = db
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (type) {
        query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw new Error(`[getOrganizations] ${error.message}`);
    return (data ?? []).map(mapOrganization);
}

/**
 * Get a single organization by slug
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await db
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`[getOrganizationBySlug] ${error.message}`);
    }
    return data ? mapOrganization(data) : null;
}

/**
 * Get members of an organization
 */
export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
    const { data, error } = await db
        .from('org_members')
        .select(`
      id, org_id, user_id, status, joined_at,
      user:users!org_members_user_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
        .eq('org_id', orgId)
        .eq('status', 'approved')
        .order('joined_at', { ascending: true });

    if (error) throw new Error(`[getOrgMembers] ${error.message}`);
    return (data ?? []).map(mapOrgMember);
}

/**
 * Get active positions (POR holders) for an organization
 */
export async function getOrgPositions(orgId: string): Promise<UserPosition[]> {
    const { data, error } = await db
        .from('user_positions')
        .select(`
      id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
      user:users!user_positions_user_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('por_type');

    if (error) throw new Error(`[getOrgPositions] ${error.message}`);
    return (data ?? []).map(mapUserPosition);
}

/**
 * Map database row to Organization type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrganization(row: any): Organization {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: row.type,
        parentId: row.parent_id,
        description: row.description,
        logoUrl: row.logo_url,
        email: row.email,
        socialLinks: row.social_links,
        isActive: row.is_active,
        foundedYear: row.founded_year,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/**
 * Map database row to UserPosition type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUserPosition(row: any): UserPosition {
    return {
        id: row.id,
        userId: row.user_id,
        orgId: row.org_id,
        title: row.title,
        porType: row.por_type,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
        isActive: row.is_active,
        createdAt: row.created_at,
        org: row.org ? mapOrganization(row.org) : undefined,
        user: row.user ? mapUser(row.user) : undefined,
    };
}

/**
 * Map database row to OrgMember type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrgMember(row: any): OrgMember {
    return {
        id: row.id,
        orgId: row.org_id,
        userId: row.user_id,
        status: row.status,
        joinedAt: row.joined_at,
        org: row.org ? mapOrganization(row.org) : undefined,
        user: row.user ? mapUser(row.user) : undefined,
    };
}

