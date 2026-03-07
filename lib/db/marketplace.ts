// ============================================================
// lib/db/marketplace.ts
// Database queries for Marketplace items
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { MarketplaceItem, ItemCategory, ItemCondition, ListingStatus, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface GetMarketplaceFilters extends PaginationParams {
  category?: ItemCategory | 'all';
  condition?: ItemCondition | 'all';
  status?: ListingStatus | 'all';
  search?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Fetch marketplace items with pagination and filters
 */
export async function getMarketplaceItems(filters: GetMarketplaceFilters = {}): Promise<PaginatedResponse<MarketplaceItem>> {
  const { page = 1, limit = 20, category, condition, status = 'available', search, sellerId, minPrice, maxPrice } = filters;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = db
    .from('marketplace_items')
    .select(`
      id, seller_id, title, category, price, is_negotiable,
      condition, status, images, pickup_location,
      delivery_available, view_count, expires_at,
      created_at, updated_at,
      seller:users!marketplace_items_seller_id_fkey(id, full_name, role, profile_picture_url)
    `, { count: 'estimated' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (condition && condition !== 'all') {
    query = query.eq('condition', condition);
  }

  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (minPrice !== undefined) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(start, end);

  const { data, error, count } = await query;

  if (error) {
    console.warn(`[getMarketplaceItems] ${error.message}`);
    return { data: [], total: 0, page, limit, hasMore: false };
  }

  return {
    data: (data ?? []).map(mapMarketplaceItem),
    total: count ?? 0,
    page,
    limit,
    hasMore: count ? start + limit < count : false,
  };
}

/**
 * Get a single Marketplace item by ID
 */
export async function getMarketplaceItemById(id: string): Promise<MarketplaceItem | null> {
  const { data, error } = await db
    .from('marketplace_items')
    .select(`
      *,
      seller:users!marketplace_items_seller_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getMarketplaceItemById] ${error.message}`);
  }

  // View count increment would be done via a DB function or trigger in production

  return data ? mapMarketplaceItem(data) : null;
}

/**
 * Create a new Marketplace listing
 */
export async function createMarketplaceItem(
  itemData: Partial<MarketplaceItem> & { sellerId: string, title: string, category: ItemCategory, price: number, condition: ItemCondition }
): Promise<MarketplaceItem | null> {
  const { data, error } = await db
    .from('marketplace_items')
    .insert([{
      seller_id: itemData.sellerId,
      title: itemData.title,
      description: itemData.description || null,
      category: itemData.category,
      price: itemData.price,
      is_negotiable: itemData.isNegotiable ?? false,
      condition: itemData.condition,
      status: 'available',
      images: itemData.images || [],
      pickup_location: itemData.pickupLocation || null,
      delivery_available: itemData.deliveryAvailable ?? false,
      expires_at: itemData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry default
    }])
    .select(`
      *,
      seller:users!marketplace_items_seller_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[createMarketplaceItem] ${error.message}`);
  return data ? mapMarketplaceItem(data) : null;
}

/**
 * Update the status of a listing (e.g. from available to sold)
 */
export async function updateMarketplaceItemStatus(
  id: string,
  status: ListingStatus
): Promise<MarketplaceItem | null> {

  const { data, error } = await db
    .from('marketplace_items')
    .update({ status })
    .eq('id', id)
    .select(`
      *,
      seller:users!marketplace_items_seller_id_fkey(id, email, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[updateMarketplaceItemStatus] ${error.message}`);
  return data ? mapMarketplaceItem(data) : null;
}

/**
 * Map database row to MarketplaceItem type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMarketplaceItem(row: any): MarketplaceItem {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: parseFloat(row.price),
    isNegotiable: row.is_negotiable,
    condition: row.condition,
    status: row.status,
    images: row.images || [],
    pickupLocation: row.pickup_location,
    deliveryAvailable: row.delivery_available,
    viewCount: row.view_count || 0,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    seller: row.seller ? mapUser(row.seller) : undefined,
  };
}
