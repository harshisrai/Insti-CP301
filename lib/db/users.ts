// ============================================================
// lib/db/users.ts
// User-related database queries
// ============================================================

import { db } from './client';
import type { User } from '@/lib/types';

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getUserById] ${error.message}`);
  }

  return data ? mapUser(data) : null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getUserByEmail] ${error.message}`);
  }

  return data ? mapUser(data) : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .update({
      full_name: updates.fullName,
      department: updates.department,
      branch: updates.branch,
      batch: updates.batch,
      enrollment_number: updates.enrollmentNumber,
      employee_id: updates.employeeId,
      designation: updates.designation,
      current_organization: updates.currentOrganization,
      current_position: updates.currentPosition,
      phone_number: updates.phoneNumber,
      bio: updates.bio,
      linkedin_url: updates.linkedinUrl,
      profile_picture_url: updates.profilePictureUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new Error(`[updateUserProfile] ${error.message}`);
  return data ? mapUser(data) : null;
}

/**
 * Map database row to User type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    status: row.status,
    department: row.department,
    branch: row.branch,
    batch: row.batch,
    enrollmentNumber: row.enrollment_number,
    employeeId: row.employee_id,
    designation: row.designation,
    currentOrganization: row.current_organization,
    currentPosition: row.current_position,
    phoneNumber: row.phone_number,
    bio: row.bio,
    linkedinUrl: row.linkedin_url,
    profilePictureUrl: row.profile_picture_url,
    isVerified: row.is_verified,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
