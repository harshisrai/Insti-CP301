// ============================================================
// lib/db/blogs.ts
// Blog posts queries
// ============================================================

import { db } from './client';
import { mapUser } from './users';
import type { BlogPost, BlogCategory, ContentStatus } from '@/lib/types';

/**
 * Get all published blogs with pagination
 */
export async function getPublishedBlogs(
  category?: BlogCategory,
  limit = 20,
  offset = 0
): Promise<BlogPost[]> {
  let query = db
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== 'general') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) {
    console.warn(`[getPublishedBlogs] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapBlogPost);
}

/**
 * Get blog by slug
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await db
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getBlogBySlug] ${error.message}`);
  }

  return data ? mapBlogPost(data) : null;
}

/**
 * Get featured blogs
 */
export async function getFeaturedBlogs(limit = 6): Promise<BlogPost[]> {
  const { data, error } = await db
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[getFeaturedBlogs] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapBlogPost);
}

/**
 * Create blog post
 */
export async function createBlogPost(
  authorId: string,
  title: string,
  slug: string,
  content: string,
  category: BlogCategory,
  excerpt?: string,
  featuredImageUrl?: string,
  companyName?: string,
  roleApplied?: string,
  interviewRound?: string,
  publishNow = false
): Promise<BlogPost> {
  const { data, error } = await db
    .from('blog_posts')
    .insert({
      author_id: authorId,
      title,
      slug,
      content,
      excerpt,
      featured_image_url: featuredImageUrl,
      category,
      company_name: companyName,
      role_applied: roleApplied,
      interview_round: interviewRound,
      status: publishNow ? 'published' : 'draft',
      published_at: publishNow ? new Date().toISOString() : null,
    })
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[createBlogPost] ${error.message}`);
  return mapBlogPost(data);
}

/**
 * Publish blog post
 */
export async function publishBlogPost(blogId: string): Promise<BlogPost> {
  const { data, error } = await db
    .from('blog_posts')
    .update({
      status: 'published' as ContentStatus,
      published_at: new Date().toISOString(),
    })
    .eq('id', blogId)
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[publishBlogPost] ${error.message}`);
  return mapBlogPost(data);
}

/**
 * Update blog post
 */
export async function updateBlogPost(
  blogId: string,
  updates: {
    title?: string;
    slug?: string;
    content?: string;
    category?: BlogCategory;
    excerpt?: string;
    featuredImageUrl?: string;
    companyName?: string;
    roleApplied?: string;
    interviewRound?: string;
    status?: ContentStatus;
  }
): Promise<BlogPost> {
  const { data, error } = await db
    .from('blog_posts')
    .update({
      title: updates.title,
      slug: updates.slug,
      content: updates.content,
      category: updates.category,
      excerpt: updates.excerpt,
      featured_image_url: updates.featuredImageUrl,
      company_name: updates.companyName,
      role_applied: updates.roleApplied,
      interview_round: updates.interviewRound,
      status: updates.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blogId)
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .single();

  if (error) throw new Error(`[updateBlogPost] ${error.message}`);
  return mapBlogPost(data);
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(blogId: string): Promise<void> {
  const { error } = await db
    .from('blog_posts')
    .delete()
    .eq('id', blogId);

  if (error) throw new Error(`[deleteBlogPost] ${error.message}`);
}

/**
 * Map database row to BlogPost type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBlogPost(row: any): BlogPost {
  return {
    id: row.id,
    authorId: row.author_id,
    postingIdentityId: row.posting_identity_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    featuredImageUrl: row.featured_image_url,
    category: row.category,
    tags: row.tags || [],
    companyName: row.company_name,
    roleApplied: row.role_applied,
    interviewRound: row.interview_round,
    status: row.status,
    isFeatured: row.is_featured,
    allowComments: row.allow_comments,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: row.author ? mapUser(row.author) : undefined,
  };
}

/**
 * Increment blog view count
 */
export async function incrementBlogViews(blogId: string): Promise<void> {
  const { error } = await db.rpc('increment_blog_views', { blog_id: blogId });
  if (error) console.warn(`[incrementBlogViews] ${error.message}`);
}

/**
 * Get drafts for a specific user
 */
export async function getUserDrafts(userId: string): Promise<BlogPost[]> {
  const { data, error } = await db
    .from('blog_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image_url,
      category, company_name, role_applied, interview_round,
      status, is_featured, allow_comments,
      view_count, like_count, comment_count,
      published_at, created_at, updated_at,
      author_id, posting_identity_id,
      author:users(id, full_name, role, profile_picture_url)
    `)
    .eq('author_id', userId)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn(`[getUserDrafts] ${error.message}`);
    return [];
  }
  return (data ?? []).map(mapBlogPost);
}
