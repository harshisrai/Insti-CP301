// ============================================================
// lib/db/events.ts
// Events database queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import { mapUserPosition, mapOrganization } from './organizations';
import type { Event, EventType, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface GetEventsFilters extends PaginationParams {
  type?: EventType | 'all';
  search?: string;
}

/**
 * Fetch events with pagination and optional filters
 */
export async function getUpcomingEvents(
  type?: EventType | 'all',
  limit: number = 20,
  page: number = 1
): Promise<Event[]> {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  const now = new Date().toISOString();

  let query = db
    .from('events')
    .select(`
      id, title, slug, type, start_time, end_time,
      venue_name, is_online, cover_image_url,
      registration_url, max_attendees, tags,
      is_published, created_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, full_name, role, profile_picture_url)
    `)
    .eq('is_published', true)
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .range(start, end);

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) {
    console.warn(`[getUpcomingEvents] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapEvent);
}

export async function getEvents(filters: GetEventsFilters = {}): Promise<PaginatedResponse<Event>> {
  const { page = 1, limit = 20, type, search } = filters;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = db
    .from('events')
    .select(`
      id, title, slug, type, start_time, end_time,
      venue_name, is_online, cover_image_url,
      registration_url, max_attendees, tags,
      is_published, created_at,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, full_name, role, profile_picture_url)
    `, { count: 'estimated' });

  query = query.eq('is_published', true);

  if (type && type !== 'all') {
    query = query.eq('type', type);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  query = query
    .order('start_time', { ascending: true })
    .range(start, end);

  const { data, error, count } = await query;

  if (error) {
    console.warn(`[getEvents] ${error.message}`);
    return { data: [], total: 0, page, limit, hasMore: false };
  }

  return {
    data: (data ?? []).map(mapEvent),
    total: count ?? 0,
    page,
    limit,
    hasMore: count ? start + limit < count : false,
  };
}

/**
 * Get a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await db
    .from('events')
    .select(`
      *,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getEventBySlug] ${error.message}`);
  }
  return data ? mapEvent(data) : null;
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await db
    .from('events')
    .select(`
      *,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getEventById] ${error.message}`);
  }
  return data ? mapEvent(data) : null;
}

/**
 * Create a new event
 */
export async function createEvent(
  eventData: Partial<Event> & { postedBy: string }
): Promise<Event | null> {
  // Generate slug
  const slug = eventData.title
    ? eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
    : `event-${Date.now()}`;

  const { data, error } = await db
    .from('events')
    .insert([{
      title: eventData.title,
      slug: slug,
      description: eventData.description,
      organizer_id: eventData.organizerId || null,
      posted_by: eventData.postedBy,
      type: eventData.type || 'other',
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      venue_name: eventData.venueName,
      venue_map_url: eventData.venueMapUrl || null,
      is_online: eventData.isOnline || false,
      meeting_url: eventData.meetingUrl || null,
      cover_image_url: eventData.coverImageUrl || null,
      registration_url: eventData.registrationUrl || null,
      registration_deadline: eventData.registrationDeadline || null,
      max_attendees: eventData.maxAttendees || null,
      tags: eventData.tags || [],
      is_published: eventData.isPublished !== false,
    }])
    .select(`
      *,
      organizer:organizations!events_organizer_id_fkey(id, name, slug, type, logo_url),
      postedBy:users!events_posted_by_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[createEvent] ${error.message}`);
  return data ? mapEvent(data) : null;
}

/**
 * Map database row to Event type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapEvent(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    organizerId: row.organizer_id,
    postedBy: row.posted_by,
    type: row.type,
    startTime: row.start_time,
    endTime: row.end_time,
    venueName: row.venue_name,
    venueMapUrl: row.venue_map_url,
    isOnline: row.is_online,
    meetingUrl: row.meeting_url,
    coverImageUrl: row.cover_image_url,
    registrationUrl: row.registration_url,
    registrationDeadline: row.registration_deadline,
    maxAttendees: row.max_attendees,
    tags: row.tags || [],
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizer: row.organizer ? mapOrganization(row.organizer) : undefined,
    // Note: Event interface expects `poster` to be populated for the ui
    poster: row.postedBy ? mapUser(row.postedBy) : undefined,
  };
}
