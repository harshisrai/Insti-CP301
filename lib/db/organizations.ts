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

// ========================
// ADMIN FUNCTIONS
// ========================

/**
 * Create a new organization (Admin only)
 * NOTE: All optional params are sent as explicit null to avoid PostgREST
 *       signature-mismatch errors when undefined values are stripped.
 */
export async function createOrganization(data: Partial<Organization>): Promise<Organization | null> {
    const { data: newOrg, error } = await db
        .rpc('admin_create_organization', {
            p_name: data.name ?? null,
            p_slug: data.slug ?? null,
            p_type: data.type ?? null,
            p_parent_id: data.parentId ?? null,
            p_description: data.description ?? null,
            p_logo_url: data.logoUrl ?? null,
            p_email: data.email ?? null,
            p_social_links: data.socialLinks ?? null,
            p_founded_year: data.foundedYear ?? null,
            p_is_active: data.isActive ?? true,
        });

    if (error) throw new Error(`[createOrganization] ${error.message}`);
    return newOrg ? mapOrganization(newOrg) : null;
}

/**
 * Update an organization (Admin only)
 * NOTE: All optional params are sent as explicit null to avoid PostgREST
 *       signature-mismatch errors when undefined values are stripped.
 */
export async function updateOrganization(id: string, data: Partial<Organization>): Promise<Organization | null> {
    const { data: updatedOrg, error } = await db
        .rpc('admin_update_organization', {
            p_id: id,
            p_name: data.name ?? null,
            p_slug: data.slug ?? null,
            p_type: data.type ?? null,
            p_parent_id: data.parentId ?? null,
            p_description: data.description ?? null,
            p_logo_url: data.logoUrl ?? null,
            p_email: data.email ?? null,
            p_social_links: data.socialLinks ?? null,
            p_founded_year: data.foundedYear ?? null,
            p_is_active: data.isActive ?? null,
        });

    if (error) throw new Error(`[updateOrganization] ${error.message}`);
    return updatedOrg ? mapOrganization(updatedOrg) : null;
}

/**
 * Assign a Position of Responsibility (POR) to a user (Admin only)
 * NOTE: Optional params sent as explicit null to avoid PostgREST overload-resolution failures.
 */
export async function assignUserPosition(data: Omit<UserPosition, 'id' | 'createdAt' | 'org' | 'user'>): Promise<UserPosition | null> {
    // Safely derive a date string from validFrom (may be ISO datetime or date-only)
    const validFromDate = data.validFrom
        ? data.validFrom.substring(0, 10)
        : new Date().toISOString().substring(0, 10);

    const { data: newPosition, error } = await db
        .rpc('admin_assign_por', {
            p_user_id: data.userId,
            p_org_id: data.orgId,
            p_title: data.title,
            p_por_type: data.porType,
            p_valid_from: validFromDate,
            p_valid_until: data.validUntil ? data.validUntil.substring(0, 10) : null,
            p_is_active: data.isActive ?? true,
        });

    if (error) throw new Error(`[assignUserPosition] ${error.message}`);

    // Since RPC doesn't do joins, fetch the fully-joined position after creation
    if (newPosition) {
        const { data: joinedPosition } = await db
            .from('user_positions')
            .select(`
                id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
                user:users!user_positions_user_id_fkey(id, email, full_name, role, profile_picture_url),
                org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
            `)
            .eq('id', newPosition.id)
            .single();
        return joinedPosition ? mapUserPosition(joinedPosition) : mapUserPosition(newPosition);
    }
    return null;
}

/**
 * Revoke or expire a User Position (Admin only)
 */
export async function revokeUserPosition(positionId: string): Promise<boolean> {
    const { data: success, error } = await db
        .rpc('admin_revoke_por', {
            p_position_id: positionId
        });

    if (error) throw new Error(`[revokeUserPosition] ${error.message}`);
    return !!success;
}

/**
 * Upsert an organization via CSV row (Admin only, idempotent by slug).
 * Uses parent_slug so CSV files stay human-readable.
 */
export async function upsertOrganization(row: {
    name: string;
    slug: string;
    type: string;
    parent_slug?: string;
    description?: string;
    logo_url?: string;
    email?: string;
    founded_year?: number;
    is_active?: boolean;
}): Promise<Organization | null> {
    const { data: org, error } = await db
        .rpc('admin_upsert_organization', {
            p_name: row.name,
            p_slug: row.slug,
            p_type: row.type,
            p_parent_slug: row.parent_slug ?? null,
            p_description: row.description ?? null,
            p_logo_url: row.logo_url ?? null,
            p_email: row.email ?? null,
            p_founded_year: row.founded_year ?? null,
            p_is_active: row.is_active ?? true,
        });

    if (error) throw new Error(`[upsertOrganization:${row.slug}] ${error.message}`);
    return org ? mapOrganization(org) : null;
}

/**
 * Get ALL members across all orgs (Admin only) — used for bulk CSV export.
 * Joins user and org info so the download includes full names, emails, org slugs.
 */
export async function getAllOrgMembers(): Promise<OrgMember[]> {
    const { data, error } = await db
        .from('org_members')
        .select(`
            id, org_id, user_id, status, joined_at,
            user:users!org_members_user_id_fkey(id, email, full_name, role, profile_picture_url),
            org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
        `)
        .eq('status', 'approved')
        .order('joined_at', { ascending: false });

    if (error) throw new Error(`[getAllOrgMembers] ${error.message}`);
    return (data ?? []).map(mapOrgMember);
}

/**
 * Get ALL positions (PORs) across all orgs (Admin only) — used for bulk CSV export.
 */
export async function getAllOrgPositions(): Promise<UserPosition[]> {
    const { data, error } = await db
        .from('user_positions')
        .select(`
            id, user_id, org_id, title, por_type, valid_from, valid_until, is_active, created_at,
            user:users!user_positions_user_id_fkey(id, email, full_name, role, profile_picture_url),
            org:organizations(id, name, slug, type, parent_id, logo_url, is_active)
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`[getAllOrgPositions] ${error.message}`);
    return (data ?? []).map(mapUserPosition);
}

/**
 * Upsert an org member by user email + org slug (Admin only — CSV bulk import).
 * NOTE: All params sent as explicit null to prevent PostgREST signature mismatch.
 */
export async function upsertMemberByEmail(row: {
    user_email: string;
    org_slug: string;
    status?: string;
}): Promise<boolean> {
    const { error } = await db
        .rpc('admin_upsert_member', {
            p_user_email: row.user_email,
            p_org_slug: row.org_slug,
            p_status: row.status ?? 'approved',
        });

    if (error) throw new Error(`[upsertMemberByEmail:${row.user_email}@${row.org_slug}] ${error.message}`);
    return true;
}

/**
 * Upsert a POR by user email + org slug + title (Admin only — CSV bulk import).
 * NOTE: All params sent as explicit null to prevent PostgREST signature mismatch.
 */
export async function upsertPORByEmail(row: {
    user_email: string;
    org_slug: string;
    title: string;
    por_type?: string;
    valid_from?: string;
    valid_until?: string;
    is_active?: boolean;
}): Promise<boolean> {
    const { error } = await db
        .rpc('admin_upsert_por', {
            p_user_email: row.user_email,
            p_org_slug: row.org_slug,
            p_title: row.title,
            p_por_type: row.por_type ?? 'custom',
            p_valid_from: row.valid_from ? row.valid_from.substring(0, 10) : null,
            p_valid_until: row.valid_until ? row.valid_until.substring(0, 10) : null,
            p_is_active: row.is_active ?? true,
        });

    if (error) throw new Error(`[upsertPORByEmail:${row.user_email}] ${error.message}`);
    return true;
}

/**
 * Add a member to an organization (Admin only)
 */
export async function addOrgMember(orgId: string, userId: string): Promise<OrgMember | null> {
    const { data, error } = await db
        .from('org_members')
        .insert({
            org_id: orgId,
            user_id: userId,
            status: 'approved',
        })
        .select(`
            id, org_id, user_id, status, joined_at,
            user:users!org_members_user_id_fkey(id, email, full_name, role, profile_picture_url)
        `)
        .single();

    if (error) throw new Error(`[addOrgMember] ${error.message}`);
    return data ? mapOrgMember(data) : null;
}

/**
 * Remove a member from an organization (Admin only)
 */
export async function removeOrgMember(orgId: string, userId: string): Promise<boolean> {
    const { error } = await db
        .from('org_members')
        .update({
            status: 'removed',
        })
        .eq('org_id', orgId)
        .eq('user_id', userId);

    if (error) throw new Error(`[removeOrgMember] ${error.message}`);
    return true;
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

