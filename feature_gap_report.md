# Feature Gap Report: SRS vs Current Implementation

**Project:** IIT Ropar Community Platform (`dep-anti`)
**Date:** March 8, 2026
**Methodology:** Compared all 15 SRS modules against the current codebase (routes, DB queries, hooks, components).

---

## Summary Table

| # | Module | SRS Section | Status | Completion |
|---|--------|-------------|--------|------------|
| 1 | Authentication | §6 | 🟢 Implemented | ~85% |
| 2 | Activity Feed | §7 | 🟡 Partial | ~40% |
| 3 | Blogs | §8 | 🟢 Implemented | ~80% |
| 4 | Campus Marketplace | §9 | 🟢 Implemented | ~80% |
| 5 | Events | §10 | 🟡 Partial | ~65% |
| 6 | Communities | §11 | 🟡 Partial | ~60% |
| 7 | Lost & Found | §12 | 🟢 Implemented | ~75% |
| 8 | Direct Messages | §13 | 🔴 Not Started | ~5% |
| 9 | Notices | §14 | 🟡 Partial | ~65% |
| 10 | Clubs & Bodies | §15 | 🟡 Partial | ~50% |
| 11 | Campus Map | §16 | 🟡 Partial | ~40% |
| 12 | Quick Links | §17 | 🔴 Not Started | ~5% |
| 13 | Notifications | §18 | 🔴 Not Started | ~5% |
| 14 | User Profile | §19 | 🟡 Partial | ~60% |
| 15 | Admin & Governance Portal | §20 | 🔴 Not Started | ~0% |

> **Overall:** ~8 modules partially/fully implemented, 4 modules not started, 3 modules with significant gaps.

---

## Module-by-Module Breakdown

---

### Module 1: Authentication (§6) — 🟢 ~85%

#### ✅ What's Implemented
- Login page at `/login` with email + password
- Signup page at `/signup` with full name, email, password, role selection
- [AuthContext.tsx](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/contexts/AuthContext.tsx) with [signIn](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/contexts/AuthContext.tsx#165-192), [signUp](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/contexts/AuthContext.tsx#121-164), [signOut](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/contexts/AuthContext.tsx#193-206), [updateProfile](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/contexts/AuthContext.tsx#207-228)
- SSR cookie sync via `/api/auth/set-cookie` and `/api/auth/clear-cookie`
- Session persistence via server-side cookies (`sb-auth-token`)
- Route protection (public paths array, redirect logic in AuthContext)
- Profile creation via Supabase RPC (`create_user_profile`)
- Sign out with redirect to `/login`

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Role-specific signup fields | Student: Department, Branch, Batch, Enrollment No. / Faculty: Dept, Employee ID, Designation / Alumni: Dept, Batch, Current Org, Current Position | **High** |
| `guest` role support | Guest signup with `guest_purpose` and `guest_valid_until` fields | Low |
| `middleware.ts` | SRS specifies route protection via Next.js Middleware file — currently handled in AuthContext client-side only | **Medium** |
| Password visibility toggle | Login/signup form password toggle | Low |

---

### Module 2: Activity Feed (§7) — 🟡 ~40%

#### ✅ What's Implemented
- Route: `/` (dashboard home page)
- DB layer: [getFeedPosts()](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/feed.ts#10-33), [createFeedPost()](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/feed.ts#34-62) in [feed.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/feed.ts)
- Hook: [useFeed.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useFeed.ts) for state management
- Dashboard widgets: `FeaturedBlogsWidget`, `RecentNoticesWidget`, `UpcomingEventsWidget`
- Basic feed display with author info

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Posting identity selector on feed post creation | UC-F04: "Post as" dropdown when creating feed posts | **High** |
| Source type icons | UC-F02: Each feed item shows source type icon (blog/event/notice/post) | Medium |
| Posting identity badge display | Author card should show chosen posting identity (e.g., "Secretary, Coding Club") | **High** |
| Quick Actions panel | UC-F03: Write Blog, Sell Item, Events, Communities quick action buttons | Medium |
| Like/comment counts display | UC-F02: Show like + comment count per item | Medium |
| Like/comment functionality | Actual like/comment CRUD operations | **High** |
| Cross-source aggregation | Feed should blend posts, events, blogs, notices from `source_type` | Medium |

---

### Module 3: Blogs (§8) — 🟢 ~80%

#### ✅ What's Implemented
- Routes: `/blogs`, `/blogs/create`, `/blogs/[slug]`
- DB layer: Full CRUD — [getPublishedBlogs](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#10-44), [getBlogBySlug](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#45-70), [getFeaturedBlogs](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#71-97), [createBlogPost](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#98-144), [publishBlogPost](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#145-170), [updateBlogPost](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#171-219), [deleteBlogPost](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#220-231), [incrementBlogViews](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#264-271), [getUserDrafts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/blogs.ts#272-297)
- Category filtering, text search, pagination
- Featured blog support (`is_featured`)
- Company name, role applied, interview round for placement blogs
- Components: `BlogList`, `BlogCard`, `CreateBlogForm`
- Hook: [useBlogs.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useBlogs.ts)

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Posting identity selector on blog creation | UC-B03: Author chooses posting identity when creating blog | **High** |
| Featured badge display | Card display with featured badge | Low |
| Company/role search for placement blogs | UC-B02: Search by company name within placement category | Medium |

---

### Module 4: Campus Marketplace (§9) — 🟢 ~80%

#### ✅ What's Implemented
- Routes: `/marketplace`, `/marketplace/create`, `/marketplace/[id]`
- DB layer: Full CRUD — [getMarketplaceItems](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/marketplace.ts#20-85), [getMarketplaceItemById](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/marketplace.ts#86-108), [createMarketplaceItem](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/marketplace.ts#109-140), [updateMarketplaceItemStatus](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/marketplace.ts#141-162)
- Filters: category, condition, status, search, price range, seller
- Category and condition enums match SRS
- Pagination support
- Components: `MarketplaceList`, `MarketplaceCard`, `CreateListingForm`, `MarketplaceDetail`
- Hook: [useMarketplace.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useMarketplace.ts)

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Price in ₹ formatting | SRS specifies prices in Indian Rupees display | Low |
| Category pills UI | §9.4: Category pills filter UI | Low |
| Negotiable/condition badges | Card badges for `is_negotiable` and condition | Medium |
| Image upload to Supabase Storage | Creating listings with actual image uploads | **High** |
| Seller contact info on detail page | UC-M03: Detail page shows seller info for contact | Medium |
| Edit/delete own listing | Seller should be able to manage their listings | Medium |

---

### Module 5: Events (§10) — 🟡 ~65%

#### ✅ What's Implemented
- Routes: `/events`, `/events/create`, `/events/[slug]`
- DB layer: [getUpcomingEvents](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/events.ts#16-54), [getEvents](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/events.ts#55-100), [getEventBySlug](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/events.ts#101-121), [getEventById](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/events.ts#122-142), [createEvent](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/events.ts#143-186)
- Type filter (all SRS event types defined in enums)
- Organization/organizer linkage
- Components: `EventList`, `EventCard`, `CreateEventForm`
- Hook: [useEvents.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useEvents.ts)
- Pagination, search by title

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Targeting system | §10.4: `target_roles[]`, `target_departments[]`, `target_batches[]` in UI | **High** |
| Posting identity selector | UC-E02: Post as "Secretary, Coding Club" | **High** |
| Registration management | `requires_registration`, `max_participants`, `registration_fee` in UI | Medium |
| Meeting link support | UC-E04: `meeting_link` for online events | Medium |
| Interested count / RSVP | `interested_count` tracking | Medium |
| Edit/delete events | Event management after creation | Medium |
| Past events filtering | Show past vs upcoming toggle | Low |

---

### Module 6: Communities (§11) — 🟡 ~60%

#### ✅ What's Implemented
- Routes: `/communities`, `/communities/create`, `/communities/[slug]`
- DB layer: [getCommunities](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/communities.ts#15-59), [getCommunityBySlug](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/communities.ts#60-79), [createCommunity](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/communities.ts#80-111), [getCommunityMembers](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/communities.ts#112-128), [getCommunityPosts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/communities.ts#129-162)
- Public/Private toggle, `requires_approval`
- Member count, post count tracking
- Inner feed at community detail page
- Components: `CommunityList`, `CommunityCard`, `CreateCommunityForm`, `CommunityDetail`
- Hook: [useCommunities.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useCommunities.ts)

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Join/Leave community | UC-C03: "Request to Join" / "Leave" button | **High** |
| Approval flow for private communities | `requires_approval` → admin manages join requests | **High** |
| Create post within community | Inner feed post creation inside community | **High** |
| Community admin/moderator roles | Community-level role management | Medium |
| Community search/browse for freshers | UC-C03: Browsable directory | Low (partially done) |

---

### Module 7: Lost & Found (§12) — 🟢 ~75%

#### ✅ What's Implemented
- Routes: `/lost-found`, `/lost-found/[id]`, `/lost-found/report`
- DB layer: Full CRUD — [getLFItems](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/lost-found.ts#17-71), [getLFItemById](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/lost-found.ts#72-92), [createLFItem](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/lost-found.ts#93-121), [updateLFItemStatus](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/lost-found.ts#122-153)
- Status flow: lost → found → claimed → returned (with `claimer_id`, `claimed_at`, `returned_at`)
- Category filtering, search, pagination
- Components: `LFItemList`, `LFItemCard`, `CreateLFItemForm`, `LFItemDetail`
- Hook: [useLostFound.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useLostFound.ts)

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Contact info display | UC-LF01: Show contact info for reporter | Medium |
| Image upload | Report with images of lost/found items | **High** |
| Status transition UI | Buttons to claim/return items by users | **High** |
| Location autocomplete | Common campus locations (SAC, Library, hostels) | Low |

---

### Module 8: Direct Messages (§13) — 🔴 ~5%

#### ✅ What's Implemented
- TypeScript types defined: [Conversation](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts#287-299), [Message](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts#300-311) in [types.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts)
- Sidebar link to `/messages` exists
- Schema has `conversations` and `messages` tables

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Route page `/messages` | No route page exists at all | **Critical** |
| DB query layer | No `lib/db/messages.ts` file | **Critical** |
| Hook layer | No `useMessages.ts` hook | **Critical** |
| Components | No message components (ConversationList, ChatView, MessageBubble) | **Critical** |
| Two-panel layout | Conversation list + active chat panels | **High** |
| Message bubble styling | Sent (right, gold) / received (left, neutral) | Medium |
| Supabase Realtime | Live message delivery subscription (Phase 2) | Low |

---

### Module 9: Notices (§14) — 🟡 ~65%

#### ✅ What's Implemented
- Routes: `/notices`, `/notices/create`
- DB layer: [getNotices](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/notices.ts#17-77), [createNotice](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/notices.ts#78-116), [toggleNoticePin](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/notices.ts#117-129)
- Posting identity integration (fetches + maps `postingIdentity` from `user_positions`)
- Category and priority filtering
- Pinned notices at top ordering
- Validity filtering (`valid_until`)
- Targeting fields stored: `target_roles[]`, `target_departments[]`, `target_batches[]`
- Components: `NoticeList`, `NoticeCard`, `CreateNoticeForm`
- Hook: [useNotices.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useNotices.ts)

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Notice detail page `/notices/[id]` | No detail view for individual notices | **High** |
| Priority color coding | Urgent=Red, High=Gold, Medium=Blue, Low=Green | Medium |
| Attachment support in UI | PDF attachments display/upload | **High** |
| Targeting UI in create form | UI for selecting target roles/departments/batches | **High** |
| Role-based filtering (reader side) | Only show notices targeting the reader's role/dept/batch | Medium |
| Edit/archive notices | Post-creation management | Medium |

---

### Module 10: Clubs & Bodies (§15) — 🟡 ~50%

#### ✅ What's Implemented
- Routes: `/clubs`, `/clubs/[slug]`
- DB layer: [getOrganizations](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/organizations.ts#47-65), [getOrganizationBySlug](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/organizations.ts#66-82), [getOrgMembers](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/organizations.ts#83-100), [getOrgPositions](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/organizations.ts#101-118), [getUserPositions](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/organizations.ts#10-26), [getPositionById](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/organizations.ts#27-46)
- Organization hierarchy modeled (parent_id, types: board/club/society/etc.)
- Components: `ClubList`, `ClubCard`, `ClubDetail`
- Hook: [useOrganizations.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useOrganizations.ts)
- Seed data: [01_organizations.sql](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/db/seeds/01_organizations.sql) with full hierarchy

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Board filter UI | UC-CL01: Filter by Board (BOST, BOCA, etc.) | **High** |
| Member list with POR titles | §15.4: Club detail shows members with their POR titles | **High** |
| Events hosted by club | §15.4: Club detail shows events by this club | Medium |
| Posts under club identity | §15.4: Posts made under this club's identity | Medium |
| "Request to Join" button | §15.4: Join request → admin approval flow | **High** |
| Club logo/initial display | §15.3: Logo/initial, category badge on card | Medium |
| Contact email / social links | §15.3: Instagram, email on card and detail page | Medium |
| Founded year / is_active display | §15.3: Metadata display | Low |
| Event count / member count on card | §15.3: Counts displayed on club card | Medium |

---

### Module 11: Campus Map (§16) — 🟡 ~40%

#### ✅ What's Implemented
- Route: `/map`
- 2D/3D toggle with iframe rendering
- Fullscreen mode toggle
- Iframes point to `/maps/2d/index.html` and `/maps/3d/index.html`

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| DB-driven UI overlay | §16.3: Search bar, category filters, location detail panel over the map | **High** |
| Location search | UC-MAP02: Search "library" → shows Nalanda Library | **High** |
| Category filters | Academic, Hostel, Food, Sports, etc. | **High** |
| Location detail card | Right panel with location info (name, type, hours, facilities) | **High** |
| Locations seed data | §16.4: Notable locations seeded (LTC, Library, SAC, Hostels, etc.) | Medium |
| DB integration | `locations` table queries — no `lib/db/locations.ts` exists | **High** |
| Building markers on 2D map | Interactive markers/polygons on Leaflet map | **High** |

---

### Module 12: Quick Links (§17) — 🔴 ~5%

#### ✅ What's Implemented
- TypeScript type defined: [QuickLink](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts#330-345) in [types.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts)
- Sidebar link to `/quick-links` exists
- Seed data: [03_quick_links.sql](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/db/seeds/03_quick_links.sql)
- Schema has `quick_links` table

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Route page `/quick-links` | No route page exists | **Critical** |
| DB query layer | No `lib/db/quick-links.ts` | **Critical** |
| Hook layer | No `useQuickLinks.ts` hook | **Critical** |
| Components | No QuickLinkCard, QuickLinkList components | **Critical** |
| Featured links section | Gold-bordered featured section at top | Medium |
| Category tabs | Academic, Administrative, Library, Placement, etc. | Medium |
| Click count tracking | `click_count` increment on link click | Low |
| Role-based visibility | `target_roles[]` filtering | Low |

---

### Module 13: Notifications (§18) — 🔴 ~5%

#### ✅ What's Implemented
- TypeScript type defined: [Notification](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts#346-360) in [types.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts)
- [NotificationType](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/types.ts#25-26) enum defined (comment, like, event, notice, marketplace, club, governance, general)
- Schema has `notifications` table

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Route page `/notifications` | No route page exists | **Critical** |
| DB query layer | No `lib/db/notifications.ts` | **Critical** |
| Hook layer | No `useNotifications.ts` hook | **Critical** |
| Components | No notification list, notification item components | **Critical** |
| Unread count in header | §18.3: Badge with unread count in Header component | **High** |
| Mark as read / mark all read | §18.3: Read state management | **High** |
| PostgreSQL trigger auto-generation | §18.3: Auto-create notifications on likes/comments/events (Phase 2) | Low |

---

### Module 14: User Profile (§19) — 🟡 ~60%

#### ✅ What's Implemented
- Route: `/profile`
- DB layer: [getUserById](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/users.ts#9-26), [getUserByEmail](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/users.ts#27-44), [updateUserProfile](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/users.ts#45-74) in [users.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/db/users.ts)
- Components: [ProfileForm.tsx](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/components/features/profile/ProfileForm.tsx) (18KB — comprehensive form), [PostingIdentitySelector.tsx](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/components/features/profile/PostingIdentitySelector.tsx), [PositionBadge.tsx](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/components/features/profile/PositionBadge.tsx)
- Hook: [useProfile.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useProfile.ts), [useIdentities.ts](file:///c:/Users/hrai1/WORK-DRIVE/DEP/Insti-CP301/lib/hooks/useIdentities.ts)
- Role-adaptive fields in User type
- Profile update via AuthContext
- POR display components exist

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| POR badges in profile header | §19.3: Primary role badge + all active POR badges displayed | **High** |
| "Past Positions" section | §19.3: Expired PORs shown in separate section | Medium |
| Profile picture upload | Upload to Supabase Storage | **High** |
| View other users' profiles | `/profile/[userId]` public profile view | Medium |
| Content by this user | Show user's blogs, posts, events on their profile | Medium |

---

### Module 15: Admin & Governance Portal (§20) — 🔴 ~0%

#### ✅ What's Implemented
- `is_admin` flag exists on User type
- Organization and POR DB queries exist (read-only)
- `organizations`, `org_members`, `user_positions` tables exist in schema

#### ❌ What's Missing to Fully Satisfy SRS
| Gap | SRS Requirement | Priority |
|-----|----------------|----------|
| Admin route `/admin` | No admin route page exists | **Critical** |
| Organization CRUD | §20.3.1: Create, edit, archive organizations via UI | **Critical** |
| Membership management UI | §20.3.2: Add/remove members, approve join requests | **Critical** |
| POR assignment UI | §20.3.3: Assign/revoke PORs with date ranges | **Critical** |
| Content moderation | §20.3.5: View, flag, hide, delete content | **High** |
| User status management | §20.3.5: Active/suspended/archived user controls | **High** |
| Access control | §20.2: Role-based access (Admin, Gen Sec, Club Sec, Faculty Advisor) | **High** |
| DB write operations | No create/update/delete functions for orgs, members, PORs in DB layer | **Critical** |

---

## Cross-Cutting Concerns (§22 Non-Functional Requirements)

| Requirement | SRS Section | Status | Notes |
|-------------|-------------|--------|-------|
| Pagination / skeleton loaders | §22.1 | 🟡 Partial | Pagination implemented in most modules; skeleton loaders not verified |
| Supabase SSR cookies | §22.2 | 🟢 Done | Cookie sync implemented |
| Row Level Security (RLS) | §22.2 | 🟢 Done | Schema includes RLS policies |
| Content authority via POR | §22.2 | 🔴 Not done | POR validation on content creation not enforced |
| Responsive design | §22.3 | 🟡 Partial | Sidebar collapses; not fully verified on mobile |
| Dark/Light theme toggle | §22.4 | 🟢 Done | Theme provider exists |
| Glassmorphism | §22.4 | 🟢 Done | `GlassSurface` component implemented |
| Data-driven governance | §22.5 | 🟡 Partial | DB tables exist but no admin UI to manage them |
| Posting Identity system | §4.2 | 🟡 Partial | Components exist (`PostingIdentitySelector`) but not integrated into all create forms |

---

## Posting Identity Integration Audit

SRS requires the "Post as" dropdown on **every** content creation form. Current status:

| Module | Has Posting Identity Selector | SRS Requires It |
|--------|------------------------------|-----------------|
| Feed Post | ❌ No | ✅ Yes (UC-F04) |
| Blog Create | ❌ No | ✅ Yes (UC-B03) |
| Event Create | ❌ No | ✅ Yes (UC-E02) |
| Notice Create | ✅ Stored in DB layer | ✅ Yes (§14.5) |
| Community Post | ❌ No | ❌ No |

> [!IMPORTANT]
> The `PostingIdentitySelector` component exists in `components/features/profile/` but is **not integrated** into blog, event, or feed creation forms. This is a high-priority gap affecting 3+ modules.

---

## Priority Recommendations

### 🔴 Critical (Unstarted modules — build from scratch)
1. **Direct Messages** — Full module needed (DB, hook, components, route)
2. **Quick Links** — Full module needed (DB, hook, components, route; seed data exists)
3. **Notifications** — Full module needed + header badge integration
4. **Admin Portal** — Full module needed (most complex; unlocks POR management)

### 🟠 High Priority (Significant gaps in existing modules)
5. **Posting Identity** — Integrate `PostingIdentitySelector` into Feed, Blog, Event create forms
6. **Campus Map** — Add DB-driven overlay (search, category filter, detail card)
7. **Clubs & Bodies** — Board filter, member+POR display, join request
8. **Communities** — Join/leave, approval flow, inner post creation
9. **Image upload** — Supabase Storage integration for Marketplace, Lost & Found, Profile

### 🟡 Medium Priority (Polish existing features)
10. **Events targeting system** — UI for `target_roles/departments/batches`
11. **Notices detail page** — Individual notice view + attachment support
12. **Like/comment system** — Cross-module social interactions
13. **Auth signup** — Role-specific fields during registration
14. **Profile** — POR badges, past positions, public profile view
