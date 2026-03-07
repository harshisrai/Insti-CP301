// ============================================================
// lib/types.ts
// All TypeScript interfaces for the IIT Ropar Community Platform
// ============================================================

// ========================
// ENUMS
// ========================
export type UserRole = 'student' | 'faculty' | 'staff' | 'alumni' | 'guest';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'archived';
export type BlogCategory = 'placement' | 'internship' | 'faculty_insight' | 'alumni_experience' | 'research' | 'general';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ItemCategory = 'books' | 'electronics' | 'furniture' | 'clothing' | 'cycle' | 'stationery' | 'sports' | 'other';
export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'available' | 'reserved' | 'sold' | 'cancelled';
export type EventType = 'ismp' | 'workshop' | 'seminar' | 'competition' | 'cultural' | 'sports' | 'esports' | 'literary' | 'club_activity' | 'club_event' | 'fest' | 'general' | 'other';
export type LFCategory = 'electronics' | 'documents' | 'accessories' | 'clothing' | 'keys' | 'wallet' | 'bottle' | 'other';
export type LFStatus = 'lost' | 'found' | 'claimed' | 'returned';
export type NoticeCategory = 'academic' | 'administrative' | 'placement' | 'hostel' | 'sports' | 'wellness' | 'general';
export type NoticePriority = 'urgent' | 'high' | 'medium' | 'low';
export type LocationType = 'academic' | 'hostel' | 'administrative' | 'recreational' | 'mess' | 'medical' | 'sports' | 'other';
export type OrgType = 'governance_body' | 'board' | 'club' | 'society' | 'fest_committee';
export type MembershipStatus = 'pending' | 'approved' | 'removed';
export type PORType = 'secretary' | 'representative' | 'mentor' | 'coordinator' | 'custom';
export type NotificationType = 'comment' | 'like' | 'event' | 'notice' | 'marketplace' | 'club' | 'governance' | 'general';
export type LinkCategory = 'academic' | 'administrative' | 'library' | 'placement' | 'wellness' | 'hostel' | 'general';

// ========================
// MAIN ENTITIES
// ========================

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  branch?: string;
  batch?: string;
  enrollmentNumber?: string;
  employeeId?: string;
  designation?: string;
  currentOrganization?: string;
  currentPosition?: string;
  phoneNumber?: string;
  bio?: string;
  linkedinUrl?: string;
  profilePictureUrl?: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  parentId?: string;
  description?: string;
  logoUrl?: string;
  email?: string;
  socialLinks?: Record<string, string>;
  isActive: boolean;
  foundedYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  status: MembershipStatus;
  joinedAt: string;
  user?: User;
  org?: Organization;
}

export interface UserPosition {
  id: string;
  userId: string;
  orgId: string;
  title: string;
  porType: PORType;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  user?: User;
  org?: Organization;
}

export interface BlogPost {
  id: string;
  authorId: string;
  postingIdentityId?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  category: BlogCategory;
  tags: string[];
  companyName?: string;
  roleApplied?: string;
  interviewRound?: string;
  status: ContentStatus;
  isFeatured: boolean;
  allowComments: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  postingIdentity?: UserPosition;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  category: ItemCategory;
  price: number;
  isNegotiable: boolean;
  condition: ItemCondition;
  status: ListingStatus;
  images: string[];
  pickupLocation?: string;
  deliveryAvailable: boolean;
  viewCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  seller?: User;
}

export interface Location {
  id: string;
  name: string;
  code?: string;
  type: LocationType;
  latitude?: number;
  longitude?: number;
  floorCount?: number;
  hasIndoorMap: boolean;
  facilities: string[];
  isAccessible: boolean;
  openingTime?: string;
  closingTime?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  postedBy: string;
  organizerId?: string;
  postingIdentityId?: string;
  title: string;
  slug: string;
  description?: string;
  type: EventType;
  startTime?: string;
  endTime?: string;
  registrationStart?: string;
  registrationEnd?: string;
  locationId?: string;
  venueName?: string;
  posterUrl?: string;
  requiresRegistration?: boolean;
  maxAttendees?: number;
  registrationFee?: number;
  registrationLink?: string;
  meetingLink?: string;
  meetingUrl?: string;
  targetRoles?: string[];
  targetDepartments?: string[];
  targetBatches?: string[];
  targetBatchesList?: string[]; // Adding as optional if needed
  interestedCount?: number;
  isPublished: boolean;
  isCancelled?: boolean;
  organizingBody?: string;
  isOnline?: boolean;
  tags: string[];
  coverImageUrl?: string;
  venueMapUrl?: string;
  registrationUrl?: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
  organizer?: Organization;
  poster?: User;
  location?: Location;
}

export interface Community {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  requiresApproval: boolean;
  allowPosts: boolean;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
  creator?: User;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'member' | 'admin' | 'moderator';
  joinedAt: string;
  user?: User;
  community?: Community;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  title?: string;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
  author?: User;
  community?: Community;
}

export interface Notice {
  id: string;
  postedBy: string;
  postingIdentityId?: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  tags: string[];
  targetRoles: string[];
  targetDepartments: string[];
  targetBatches: string[];
  attachments: string[];
  isActive: boolean;
  isPinned: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  poster?: User;
  postingIdentity?: UserPosition;
}

export interface LostFoundItem {
  id: string;
  reporterId: string;
  claimerId?: string;
  itemName: string;
  category: LFCategory;
  status: LFStatus;
  description?: string;
  locationLostFound?: string;
  dateLostFound?: string;
  contactInfo?: string;
  images: string[];
  claimedAt?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: User;
  claimer?: User;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  participant1?: User;
  participant2?: User;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface FeedPost {
  id: string;
  authorId: string;
  postingIdentityId?: string;
  content: string;
  mediaUrls: string[];
  sourceType: 'post' | 'blog' | 'event' | 'notice';
  sourceId?: string;
  likeCount: number;
  commentCount: number;
  isPublic: boolean;
  targetRoles: string[];
  createdAt: string;
  updatedAt: string;
  author?: User;
  postingIdentity?: UserPosition;
}

export interface QuickLink {
  id: string;
  createdBy?: string;
  title: string;
  description?: string;
  url: string;
  category: LinkCategory;
  targetRoles: string[];
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
  creator?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: NotificationType;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  user?: User;
}

// ========================
// REQUEST/RESPONSE TYPES
// ========================

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  department?: string;
  branch?: string;
  batch?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  department?: string;
  branch?: string;
  batch?: string;
  phoneNumber?: string;
  bio?: string;
  linkedinUrl?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ========================
// UI STATE TYPES
// ========================

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface FeedState {
  posts: FeedPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

export interface FilterState {
  category?: string;
  status?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
  searchQuery?: string;
}
