import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency (INR)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get user initials from full name
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate relative time (e.g., "2 days ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Generate URL slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get color for user role badge
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    student: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    faculty: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    staff: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
    alumni: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
    guest: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60',
  };
  return colors[role] || colors.guest;
}

/**
 * Get label for blog category
 */
export function getBlogCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    placement: 'Placement',
    internship: 'Internship',
    faculty_insight: 'Faculty Insight',
    alumni_experience: 'Alumni Experience',
    research: 'Research',
    general: 'General',
  };
  return labels[category] || category;
}

/**
 * Get label for event type
 */
export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ismp: 'ISMP',
    workshop: 'Workshop',
    seminar: 'Seminar',
    competition: 'Competition',
    cultural: 'Cultural',
    sports: 'Sports',
    esports: 'E-Sports',
    literary: 'Literary',
    club_activity: 'Club Activity',
    fest: 'Fest',
    general: 'General',
  };
  return labels[type] || type;
}

/**
 * Get color for item condition
 */
export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    new: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
    like_new: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    good: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
    fair: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    poor: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  };
  return colors[condition] || colors.good;
}
