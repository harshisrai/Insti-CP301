// ============================================================
// lib/constants.ts
// Enums and constants for the application
// ============================================================

export const USER_ROLES = ['student', 'faculty', 'staff', 'alumni', 'guest'] as const;
export const USER_STATUSES = ['active', 'inactive', 'suspended', 'archived'] as const;

export const BLOG_CATEGORIES = [
  'placement',
  'internship',
  'faculty_insight',
  'alumni_experience',
  'research',
  'general',
] as const;

export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;

export const ITEM_CATEGORIES = [
  'books',
  'electronics',
  'furniture',
  'clothing',
  'cycle',
  'stationery',
  'sports',
  'other',
] as const;

export const ITEM_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const;

export const LISTING_STATUSES = ['available', 'reserved', 'sold', 'cancelled'] as const;

export const EVENT_TYPES = [
  'ismp',
  'workshop',
  'seminar',
  'competition',
  'cultural',
  'sports',
  'esports',
  'literary',
  'club_activity',
  'fest',
  'general',
] as const;

export const LF_CATEGORIES = [
  'electronics',
  'documents',
  'accessories',
  'clothing',
  'keys',
  'wallet',
  'bottle',
  'other',
] as const;

export const LF_STATUSES = ['lost', 'found', 'claimed', 'returned'] as const;

export const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Mathematics and Computing',
  'Physics',
  'Chemistry',
  'Humanities and Social Sciences',
  'Biomedical Engineering',
] as const;

export const BATCHES = [
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
] as const;
