# Software Requirements Specification (SRS)
## IIT Ropar Institute Community Platform

**Version:** 2.0  
**Date:** March 2026  
**Project Name:** `dep-anti` (Internal Codename)  
**Institution:** Indian Institute of Technology Ropar (IIT Ropar), Punjab, India  

---

---

## Table of Contents

1. [Project Overview & Purpose](#1-project-overview--purpose)
2. [Technology Stack](#2-technology-stack)
3. [IIT Ropar Institutional Structure](#3-iit-ropar-institutional-structure)
4. [User Roles & Access Levels](#4-user-roles--access-levels)
5. [System Architecture & Auth Flow](#5-system-architecture--auth-flow)
6. [Module 1: Authentication](#6-module-1-authentication)
7. [Module 2: Activity Feed](#7-module-2-activity-feed-dashboard-home)
8. [Module 3: Blogs](#8-module-3-blogs)
9. [Module 4: Campus Marketplace](#9-module-4-campus-marketplace)
10. [Module 5: Events](#10-module-5-events)
11. [Module 6: Communities](#11-module-6-communities)
12. [Module 7: Lost & Found](#12-module-7-lost--found)
13. [Module 8: Direct Messages](#13-module-8-direct-messages)
14. [Module 9: Notices](#14-module-9-notices)
15. [Module 10: Clubs & Bodies](#15-module-10-clubs--bodies)
16. [Module 11: Campus Map (3D)](#16-module-11-campus-map-3d-explorer)
17. [Module 12: Quick Links](#17-module-12-quick-links)
18. [Module 13: Notifications](#18-module-13-notifications)
19. [Module 14: User Profile & Posting Identity](#19-module-14-user-profile--posting-identity)
20. [Module 15: Admin & Governance Portal](#20-module-15-admin--governance-portal)
21. [Data Models (Database Schema)](#21-data-models-database-schema)
22. [Non-Functional Requirements](#22-non-functional-requirements)
23. [IIT Ropar Terminology Glossary](#23-iit-ropar-terminology-glossary)

---

## 1. Project Overview & Purpose

### 1.1 What It Is

The IIT Ropar Community Platform is a **unified, web-based Progressive Web Application** exclusively designed for the IIT Ropar community. It serves as a **single digital hub** for all campus stakeholders — students, faculty, staff, alumni, and guest visitors — to connect, communicate, access information, and participate in campus life.

### 1.2 Problem Being Solved

IIT Ropar's community information is fragmented across multiple channels: WhatsApp groups, departmental emails, physical notice boards, and separate portals for placements, hostel, library, etc. New students and faculty find it difficult to orient themselves. Alumni have no maintained social connection to the institute. Club and governance management happens offline with no digital trail. This platform unifies all these touchpoints into one cohesive, always-accessible experience. 

### 1.3 Core Goals

- **Campus Connectivity**: Connect students, faculty, staff, and alumni in one community space.
- **Information Hub**: Centralize announcements, event information, club details, and academic notices.
- **Governance & Club Management**: Digitize the Students' Gymkhana structure — boards, clubs, PORs (Positions of Responsibility), and membership — with admin tooling.
- **Commerce & Utility**: Peer-to-peer marketplace and lost-and-found services.
- **3D Campus Navigation**: Interactive 3D explorable campus model.
- **Posting Identity**: Let members post under their chosen role/title (e.g., as "Student" or as "President, Students' Gymkhana").
- **Peer Knowledge Sharing**: Placement/internship experiences, research insights, and alumni journeys, faculty posts.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **React Version** | React 19 |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Styling** | Tailwind CSS v3 + CSS Custom Properties (dark theme, glassmorphism) |
| **Icons** | Lucide React |
| **Date Formatting** | date-fns |
| **3D Rendering** | Three.js (via CDN, served from `public/3d-campus/`) |
| **Routing** | Next.js App Router (`src/app/`) |
| **Auth** | Supabase SSR Auth with server-side cookie sessions |
| **Middleware** | Next.js Middleware for route protection |

### 2.1 Key Architecture Decisions

- **Route Groups**: `(auth)` for login/signup pages; `(dashboard)` for all protected pages.
- **Auth Guard**: `src/middleware.ts` intercepts every request. Unauthenticated users → `/login`. Authenticated users on `/login` or `/signup` → `/`.
- **Supabase Client**: Two clients — browser-side and SSR server-side for middleware.
- **Auth Context**: `src/contexts/AuthContext.tsx` provides `user`, `session`, `signIn`, `signUp`, `signOut` globally.
- **DB Abstraction Layer**: All database queries live in `src/lib/db/` — Supabase is only imported in `src/lib/db/client.ts` for portability.

---

## 3. IIT Ropar Institutional Structure

> This section documents the real organizational structure. The platform must model this hierarchy accurately.

### 3.1 Academic Departments

**Engineering:**
- Artificial Intelligence and Data Engineering
- Biomedical Engineering
- Chemical Engineering
- Civil Engineering
- Computer Science & Engineering
- Electrical Engineering
- Mechanical Engineering
- Metallurgical and Materials Engineering

**Sciences:** Chemistry, Physics, Mathematics

**Humanities:** Humanities and Social Sciences

### 3.2 B.Tech Branches (for student `branch` field)

1. Artificial Intelligence and Data Engineering
2. Chemical Engineering
3. Civil Engineering
4. Computer Science and Engineering
5. Digital Agriculture
6. Electrical Engineering
7. Electrical Engineering (Integrated Circuit Design and Technology)
8. Engineering Physics
9. Mathematics and Computing
10. Mechanical Engineering
11. Metallurgical and Materials Engineering

### 3.3 Students' Gymkhana (Governance Hierarchy)

The **Students' Gymkhana** is the apex student body. It operates through:

**Student Legislative Council (SLC)** — the policy-making body:
- **Executive Members**: President, 7 General Secretaries (one per Board), Research Secretary
- **Advisory Council**: Batch/programme representatives (PhD, B.Tech yr 1–4, M.Tech, M.Sc./MS)
- **Convenor**: Elected from SLC (non-executive), leads SLC meetings

**Executive Council** — the action arm:
- **President**: Leads overall student governance
- **7 General Secretaries**, each heading a Board (see § 3.4)
- **Research Secretary**: Represents PhD scholars across all departments

**Advisory Board (Student Affairs)**: Dean/Associate Dean SA (Chair), Chief Warden, Faculty Advisors of all 6 Boards, Registrar

### 3.4 Boards & Clubs

Each board is led by a General Secretary and governs multiple clubs. Every club follows a standard **POR (Position of Responsibility)** structure:
- **Secretary** (max 1 per club)
- **Representative** (max 1 per club)
- **Mentors** (multiple)
- **Coordinators** (multiple)

---

#### Board of Science and Technology (BOST)
Clubs: Aeromodelling, Automotive, CIM, Coding Club, Esportz, FinCOM, Iota Cluster, Monochrome, Robotics, Softcom, Zenith (Astronomy)

#### Board of Cultural Activities (BOCA)
Clubs: Dance Club, Dramatics Club (Undekha), Epicure, Fine Arts (Vibgyor), Music Club (Alankar), Photography (Arturo), Dcypher, Panache

#### Board of Literary Activities (BOLA)
Clubs: Debating (Debsoc), Enarators, Alpha (Movie Making), Filmski, Enigma, Alfaaz (Creative Writing), MUN Club

#### Board of Sports Affairs (BOSA)
Clubs: Aquatics, Athletics, Badminton, Basketball, Chess, Cricket, Football, Hockey, Lawn Tennis, Table Tennis, Volleyball, Weightlifting

#### Board of Hostel Affairs (BOHA)
Manages hostel governance, mess committees, and hostel-level cultural/sports events.

#### Board of Academic Affairs (BOAA)
Branch Representatives per batch per year. Covers: AI, Civil, Chemical, CSE, Digital Agriculture, EE, Engineering Physics, ICDT, Math & Computing, ME, MME.

### 3.5 Independent Societies & Organizations
- ACE (Association of Civil Engineers)
- E-Cell (Entrepreneurship)
- ENACTUS (Social Entrepreneurship)
- Pehchaan-Ek Safar (Social Welfare)
- SME (Society of Mechanical Engineers)
- Women's Forum / SWE
- BloodConnect
- ISMP Body

### 3.6 Annual Festivals

| Festival | Type | Duration |
|---|---|---|
| **Advitiya** | Technical Fest | 3 days |
| **Zeitgeist** | Cultural Fest (October) | 3 days |
| **Aarohan** | Sports Fest | 3 days |
| **Revanche** | E-sports/Gaming (BGMI, Valorant, FIFA, etc.) | 2 days |
| **Malhar** | Literature Fest / Book Fair | 3 days |

### 3.7 Campus Infrastructure

**Hostels:**
- Boys: Satluj, Beas, Chenab, Brahmaputra
- Girls: Raavi, Brahmaputra
- Common amenities: RO water, Gyms (Sutlej & Raavi), TV rooms, Laundry, Wi-Fi/LAN, Elevators (some)

**Central Facilities:**
- **Nalanda Library**: 24/7 reference access, Koha system, 13,000+ print books, 22,000+ total resources
- **Medical Centre**: 24/7 aid, ambulance, allopathic + ayurvedic
- **Utility Block**: General Store (10 AM–8 PM), Stationery (8 AM–8 PM), Salon, SBI Branch & ATM (24/7), Post Office
- **Student Activity Centre (SAC)**: Club rooms for Alankar, BOST, Arturo, Vibgyor

**Dining & Food Court:**
- Dubey Cafe (till 3 AM), Maggie Hotspot (till 2 AM), Coffee Day
- Kerala Canteen, Burger House, Juice Corner, Desi Urban Chai, Cafeteria

---

## 4. User Roles & Access Levels

| Role | Who They Are | Key Capabilities |
|---|---|---|
| `student` | Currently enrolled UG/PG/PhD | Full access. Can create blogs, marketplace listings, lost/found reports, join communities and clubs. |
| `faculty` | Professors and teaching staff | Post notices, create events, author blogs, view all sections. |
| `staff` | Non-teaching administrative staff | Post notices, access view-only content. |
| `alumni` | IIT Ropar graduates | Alumni blogs, marketplace, placement stories. Profile has `current_organization`/`current_position`. |
| `guest` | Visiting faculty, speakers, industry visitors | Limited access. Profile tracks `guest_purpose` and `guest_valid_until`. |

### 4.1 Positions of Responsibility (POR) — Context-Based Roles

Beyond the base `role`, users can hold **PORs** — Positions of Responsibility within the Gymkhana, boards, or clubs. A single user can hold multiple PORs.

**POR examples:**
- President, Students' Gymkhana
- General Secretary, BOST
- Secretary, Coding Club
- Representative, Dance Club
- Coordinator, Advitiya
- Branch Representative, CSE 2024

**How PORs work in the system:**
- PORs are stored in a `user_positions` table (many-to-many: one user → many positions)
- Each POR links to an `organization` (a board, club, society, or governance body)
- PORs have a `valid_from` / `valid_until` date — they expire on role handover
- The admin portal manages POR assignment (see Module 15)

### 4.2 Posting Identity System

When creating **any content** (feed post, blog, event, notice), the author chooses a **posting identity**:

| Scenario | Posting Identity Options |
|---|---|
| A regular student with no PORs | Posts as "Student" (base role only) |
| President of Students' Gymkhana | Can post as "Student" OR "President, Students' Gymkhana" |
| Secretary, Coding Club + Coordinator, Advitiya | Can post as "Student" OR "Secretary, Coding Club" OR "Coordinator, Advitiya" |
| Faculty member + Faculty Advisor, BOST | Can post as "Faculty" OR "Faculty Advisor, BOST" |

**Use cases:**
- **UC-PI01**: The Gymkhana President writes a general post about campus life → posts as "Student" (personal opinion, not official).
- **UC-PI02**: The same President posts an official announcement about elections → posts as "President, Students' Gymkhana" (official capacity).
- **UC-PI03**: The Coding Club Secretary posts an event → posts as "Secretary, Coding Club" so it shows the club's authority.
- **UC-PI04**: A club member with no POR posts about a club activity → posts as "Student" (cannot use the club's name officially).

**Implementation:**
- Every content creation form includes a "Post as" dropdown populated from the user's current active PORs + their base role
- The selected identity is stored as `posting_identity_id` (FK to `user_positions`, or `null` for base role)
- Display: author card shows the chosen title and the organization badge

---

## 5. System Architecture & Auth Flow

```
Browser Request
     │
     ▼
Next.js Middleware (src/middleware.ts)
  - Reads Supabase session from cookies
  - Unauthenticated + Protected Path → redirect /login
  - Authenticated + Auth Page → redirect /
     │
     ▼
Route Groups
  (auth)/login     → Login form
  (auth)/signup    → Signup form
  (dashboard)/      → Protected Dashboard Layout
     │
     ▼
DashboardLayout
  - AuthProvider (global auth state + POR state)
  - Sidebar (navigation)
  - Header (search, notifications, posting identity selector)
  - main-content (page children)
     │
     ▼
Individual Page Components
  - useAuth() for user identity + active PORs
  - DB queries via src/lib/db/ abstraction layer
```

---

## 6. Module 1: Authentication

### 6.1 Purpose
Securely authenticate IIT Ropar community members via email + password (Supabase Auth), with session persistence via server-side cookies.

### 6.2 Login Flow
- Route: `/login`
- Email + password. Session cookie set on success, redirect to `/`.
- Password visibility toggle. Inline error display on failure.

### 6.3 Sign Up Flow
- Route: `/signup`
- Fields: **Full Name**, **Email**, **Password**, **Role** (student/faculty/alumni/staff)
- Role-specific fields:
  - **Student**: Department (from official list), Branch, Batch (graduation year), Enrollment Number
  - **Faculty/Staff**: Department, Employee ID, Designation
  - **Alumni**: Department, Batch, Current Organization, Current Position
- On success: Supabase Auth entry + `users` table row created

### 6.4 Sign Out
- From Sidebar footer. Session invalidated, redirect to `/login`.

---

## 7. Module 2: Activity Feed (Dashboard Home)

### 7.1 Purpose
Landing page post-login. Real-time activity stream showing posts, events, blogs, and notices from the community.

### 7.2 Use Cases
- **UC-F01**: Student sees 20 most recent posts sorted by `created_at` descending.
- **UC-F02**: Each feed item shows author name, **posting identity badge** (e.g., "Secretary, Coding Club" vs just "Student"), source type icon, and like + comment count.
- **UC-F03**: Quick Actions: Write Blog, Sell Item, Events, Communities.
- **UC-F04**: Student creates a feed post and chooses which identity to post under from the "Post as" dropdown.

### 7.3 Key Data
- Source table: `feed_posts`
- `posting_identity_id` — FK to `user_positions` (null = base role)
- `source_type`: `blog`, `event`, `notice`, or `post`
- `media_urls[]`: attached images

---

## 8. Module 3: Blogs

### 8.1 Purpose
IIT Ropar's collective knowledge base — placement/internship reports, faculty insights, alumni stories, research documentation.

### 8.2 Blog Categories

| Category | Description |
|---|---|
| `placement` | Interview reports. Includes company, role, round details. Peak: Oct–Nov. |
| `internship` | SIP/summer/winter internship reports. |
| `faculty_insight` | Faculty writing about courses, research, or academic guidance. |
| `alumni_experience` | Alumni stories post-graduation. |
| `research` | Research projects, lab work, paper publications. |
| `general` | Campus life, opinion pieces. |

### 8.3 Use Cases
- **UC-B01**: 4th-year student writes a Google placement blog → category = `placement`, company = "Google", role = "SDE".
- **UC-B02**: Student filters by `placement` and searches "Microsoft".
- **UC-B03**: The blog author chooses posting identity — could post as "Student" or as "Coordinator, Coding Club" if relevant.

### 8.4 Features
- Category tab filters, text search by title/company, card display with featured badge
- Sub-routes: `/blogs`, `/blogs/create`, `/blogs/[slug]`

---

## 9. Module 4: Campus Marketplace

### 9.1 Purpose
Peer-to-peer buy/sell board. Most active during semester-end move-outs and freshers joining in July/August.

### 9.2 Categories & Conditions
- **Categories**: `Books` | `Electronics` | `Furniture` | `Clothing` | `Cycle` | `Stationery` | `Sports` | `Other`
- **Conditions**: `New` | `Like New` | `Good` | `Fair` | `Poor`

> **IIT Ropar Context**: Bicycles top-traded (campus cycling required). Textbooks trade between batches. Furniture sold by graduating students. Prices in ₹.

### 9.3 Use Cases
- **UC-M01**: 4th-year lists cycle for ₹1,500, `is_negotiable = true`.
- **UC-M02**: Fresher filters `Books` for 2nd-hand textbooks.
- **UC-M03**: Buyer navigates to `/marketplace/[id]` for seller info.

### 9.4 Features
- Category pills, search, item cards (image, condition/negotiable badges, price, seller), status filtering
- Sub-routes: `/marketplace`, `/marketplace/create`, `/marketplace/[id]`

---

## 10. Module 5: Events

### 10.1 Purpose
Aggregates all campus events. Distinguishes IIT Ropar specific event types. Clubs and governance bodies can post events under their official identity.

### 10.2 Event Types

| Type | Description |
|---|---|
| `ismp` | ISMP events — batch orientation, mentor-mentee interactions. Organized by ISMP body. |
| `workshop` | AI/ML, CAD, PCB, hackathons. |
| `seminar` | Guest lectures, Alumni Talks, Research Seminars. |
| `competition` | Coding contests, Robocon, Design Fiesta. |
| `cultural` | Zeitgeist (Cultural Fest), cultural nights, open mics. |
| `sports` | IHL (Inter-Hostel League), Aarohan (Sports Fest), inter-IIT prep. |
| `esports` | Revanche (E-sports Fest) — BGMI, Valorant, FIFA, Clash Royale, COD. |
| `literary` | Malhar (Literature Fest), debates, MUN. |
| `club_activity` | Events by registered clubs. |
| `fest` | Multi-day annual fests: Advitiya, Zeitgeist, Aarohan, Revanche, Malhar. |
| `general` | Other events. |

### 10.3 Use Cases
- **UC-E01**: ISMP body creates "ISMP Freshers Meet" targeting `target_batches = ['2028']`.
- **UC-E02**: Coding Club Secretary creates a hackathon event, posting as "Secretary, Coding Club".
- **UC-E03**: Student browses `cultural` events for Zeitgeist lineup.
- **UC-E04**: Faculty creates a `seminar` with `meeting_link` for an online guest lecture.

### 10.4 Targeting System
Events support targeted delivery: `target_roles[]`, `target_departments[]`, `target_batches[]`.

---

## 11. Module 6: Communities

### 11.1 Purpose
Interest-based groups, self-organized. Public or private with approval flow.

### 11.2 Use Cases
- **UC-C01**: CP Society community for competitive programmers.
- **UC-C02**: Faculty creates private research lab community.
- **UC-C03**: Fresher browses and joins public communities.

### 11.3 Features
- Public/Private toggle, `requires_approval`, member/post counts
- Community detail page with inner feed at `/communities/[slug]`

---

## 12. Module 7: Lost & Found

### 12.1 Purpose
Report missing or found items on campus. Common locations: Nalanda Library, SAC, Sports Complex, hostels.

### 12.2 Categories
`Electronics` | `Documents` | `Accessories` | `Clothing` | `Keys` | `Wallet` | `Bottle` | `Other`

> **IIT Ropar Context**: Most common: water bottles, ID cards, laptop chargers, hostel room keys, earphones.

### 12.3 Status Flow
`lost` → `found` → `claimed` → `returned`

### 12.4 Use Cases
- **UC-LF01**: Student loses ID card near SAC → reports with location, date, contact.
- **UC-LF02**: Hostel warden finds keys near Chenab → reports under "Found Items".

---

## 13. Module 8: Direct Messages

### 13.1 Purpose
Private one-on-one messaging. Use cases: buyer↔seller, mentee↔ISMP mentor, general contact.

### 13.2 Features
- Two-panel layout: conversation list + active chat
- Message bubbles: sent (right, gold tint) / received (left, neutral)
- Supabase Realtime subscription for live message delivery (Phase 2)

---

## 14. Module 9: Notices

### 14.1 Purpose
Official institute communications and announcements posted by faculty, staff, or authorized governance members.

### 14.2 Notice Categories

| Category | Description |
|---|---|
| `Academic` | Exams, grades, deadlines, academic calendar. |
| `Administrative` | Hostel, transport, facilities. |
| `Placement` | T&P / CDPC notices — PPTs, dress codes, company schedules. |
| `Hostel` | Warden/HMC notices — hostel nights, room swapping. |
| `Sports` | IHL, gym timings, sports events. |
| `Wellness` | Snehita Wellbeing Cell notices. |
| `General` | Campus-wide. |

### 14.3 Priority Levels
- `urgent` (Red) → `high` (Gold) → `medium` (Blue) → `low` (Green)

### 14.4 Features
- Pinned notices (`is_pinned`) always at top
- Validity (`valid_until`) hides expired notices
- Targeting: `target_roles[]`, `target_departments[]`, `target_batches[]`
- Attachments (PDF links), free-form tags
- **Posting identity**: Faculty or governance member selects identity when posting

---

## 15. Module 10: Clubs & Bodies

### 15.1 Purpose
A comprehensive directory of all registered clubs, boards, and independent organizations at IIT Ropar. Reflects the real governance hierarchy from § 3.

### 15.2 Organization Hierarchy

The `organizations` table models the full hierarchy:

```
Students' Gymkhana
  ├── BOST (Board of Science & Technology)
  │   ├── Aeromodelling Club
  │   ├── Coding Club
  │   ├── Robotics Club
  │   └── ... (11 clubs)
  ├── BOCA (Board of Cultural Activities)
  │   ├── Dance Club
  │   ├── Dramatics Club (Undekha)
  │   ├── Music Club (Alankar)
  │   └── ... (8 clubs)
  ├── BOLA (Board of Literary Activities)
  │   ├── Debsoc
  │   ├── MUN Club
  │   └── ... (7 clubs)
  ├── BOSA (Board of Sports Affairs)
  │   ├── Cricket
  │   ├── Football
  │   └── ... (12 clubs)
  ├── BOHA (Board of Hostel Affairs)
  ├── BOAA (Board of Academic Affairs)
  └── Independent Societies
      ├── E-Cell, ENACTUS, BloodConnect, etc.
      └── ISMP Body
```

### 15.3 Club Card Information
- Logo/initial, Name, Parent Board badge, Category badge
- Description, member count, event count
- Contact email, social links (Instagram, etc.)
- Founded year, `is_active` status

### 15.4 Club Detail Page (`/clubs/[slug]`)
- Full description, member list (with POR titles)
- Events hosted by this club
- Posts made under this club's identity
- "Request to Join" button → triggers admin approval flow

### 15.5 Use Cases
- **UC-CL01**: Fresher browses clubs page, filters by Board (BOST, BOCA...) to find clubs to join.
- **UC-CL02**: Club Secretary posts an event using their "Secretary, Coding Club" identity → event shows the club badge.
- **UC-CL03**: Only verified club members with PORs can post content on behalf of the club. Regular members cannot.
- **UC-CL04**: Admin assigns a POR to a new student for a club.

---

## 16. Module 11: Campus Map (2D / 3D Explorer)

### 16.1 Purpose
Interactive campus map with **two viewing modes** the user can toggle between based on their needs. Serves as a navigation tool for new students, visitors, and anyone locating buildings or facilities.

### 16.2 Two View Modes (Toggle)

Users switch between modes via a toggle button in the map UI overlay.

| Mode | What It Shows | Best For | Technology |
|---|---|---|---|
| **2D Map** | Flat satellite/blueprint-style map with labelled buildings, paths, and markers | Quick lookup, directions, location pinning | Leaflet.js or Mapbox GL with custom tile layer / campus blueprint image overlay |
| **3D Model** | Full 3D explorable campus model — rotate, pan, zoom | Immersive exploration, freshers orientation, virtual tours | Three.js (iframe from `public/3d-campus/`) |

**Default mode**: 2D (faster to load, more practical for daily use). Users can toggle to 3D when they want the immersive view.

### 16.3 Architecture

Both modes share the same **DB-driven UI overlay** (search bar, category filters, location detail panel). Only the background layer changes on toggle:

```
┌──────────────────────────────────┐
│  Toggle: [2D] [3D]               │ ← User switches here
├──────────────────────────────────┤
│  Background Layer                │
│    Mode 2D: Leaflet/Mapbox       │
│    Mode 3D: Three.js iframe      │
├──────────────────────────────────┤
│  UI Overlay (shared)             │
│    Left: search + category filter│
│    Right: location detail card   │
└──────────────────────────────────┘
```

- **2D mode**: Renders a `<div>` with Leaflet.js. Campus blueprint or satellite tiles as the base layer. Buildings shown as interactive markers/polygons. Clicking a marker opens the detail panel.
- **3D mode**: Renders the existing Three.js iframe (`/public/3d-campus/index.html`) in headless mode as a full-screen background.

### 16.4 Notable Locations (to be seeded)
- **LTC** (Lecture Theatre Complex)
- **Nalanda Library** — 24/7 reference access, 22,000+ resources
- **SAC** (Student Activity Centre) — club rooms (Alankar, BOST, Arturo, Vibgyor)
- **Hostels**: Satluj, Beas, Chenab, Brahmaputra (Boys); Raavi, Brahmaputra (Girls)
- **Medical Centre** — 24/7 with ambulance
- **Utility Block** — General Store, Stationery, Salon, SBI ATM, Post Office
- **Food Court** — Kerala Canteen, Burger House, Juice Corner, Desi Urban Chai, Cafeteria
- **Sports Complex**, **Administrative Block**

### 16.5 Use Cases
- **UC-MAP01**: A fresher toggles to 3D mode to get a virtual tour of the campus on Day 1.
- **UC-MAP02**: A student in 2D mode quickly searches "library" to see Nalanda Library's location and opening hours.
- **UC-MAP03**: A faculty member uses 2D mode to find the nearest building with a projector.
- **UC-MAP04**: A visitor attending a seminar uses 2D mode to get a quick directions-style view to LTC.

---

## 17. Module 12: Quick Links

### 17.1 Purpose
Curated directory of official portals. Featured links appear in gold-bordered section at top.

### 17.2 Link Categories
- `Academic` — ERP, Moodle, attendance
- `Administrative` — Fee payment, hostel, transport
- `Library` — Nalanda OPAC, IEEE Xplore, Shodhganga
- `Placement` — CDPC portal, company schedules
- `Wellness` — Snehita Wellbeing Cell
- `Hostel` — Room change, maintenance complaint
- `General` — Official website, IRCC, IPR Cell

---

## 18. Module 13: Notifications

### 18.1 Purpose
Personal notification centre. Tracks likes, comments, event reminders, notice alerts, marketplace inquiries.

### 18.2 Types
`comment` | `like` | `event` | `notice` | `marketplace` | `club` | `governance` | `general`

### 18.3 Features
- Unread count in header, mark-as-read, mark-all-read
- Auto-generation via PostgreSQL triggers (Phase 2)
- New type `club`: notifies when POR is assigned/removed, club membership approved
- New type `governance`: notifies on election announcements, SLC decisions

---

## 19. Module 14: User Profile & Posting Identity

### 19.1 Purpose
Personalized profile page. Role-adaptive fields. Displays all active PORs held by the user.

### 19.2 Role-Adaptive Fields
- **Student**: Name, Email, Phone, Department, Branch, Batch, Enrollment No., Bio, LinkedIn
- **Faculty/Staff**: Name, Email, Dept, Designation, Employee ID, Bio, LinkedIn
- **Alumni**: Name, Dept, Batch, Current Org, Current Position, LinkedIn

### 19.3 POR Display
Profile header shows primary role badge + all active POR badges (e.g., "Secretary, Coding Club · Coordinator, Advitiya"). Expired PORs show in a "Past Positions" section.

### 19.4 Posting Identity Selector
Available on every content creation form. Dropdown lists: base role + all active PORs. Selected identity determines:
- What badge appears next to the author's name
- Whether the content appears under a club/body's page
- What authority the post carries (official vs. personal)

---

## 20. Module 15: Admin & Governance Portal

### 20.1 Purpose
A management interface for authorized administrators to manage the organizational structure, club memberships, POR assignments, and content moderation. Designed to be **extensible** — as new clubs, boards, or governance bodies are created, they can be added through this portal without code changes.

### 20.2 Who Can Access
- **Platform Admin** (superuser): Full access to all admin functions
- **Board General Secretaries**: Can manage clubs under their board
- **Club Secretaries**: Can manage members within their own club
- **Faculty Advisors**: Can oversee their assigned board

### 20.3 Admin Features

#### 20.3.1 Organization Management
- Create, edit, archive organizations (boards, clubs, societies, fest committees)
- Set parent organization (e.g., "Coding Club" parent = "BOST")
- Organization types: `board`, `club`, `society`, `fest_committee`, `governance_body`
- Each organization has: name, slug, description, type, parent_id, logo, email, social_links, is_active

#### 20.3.2 Membership Management
- Add/remove students from a club's membership roster
- Approved members can be assigned PORs
- Membership statuses: `pending` → `approved` → (optionally) `removed`
- Membership table: `org_id`, `user_id`, `status`, `joined_at`

#### 20.3.3 POR (Position of Responsibility) Management
- Assign PORs to members: Secretary, Representative, Mentor, Coordinator, or custom title
- Set `valid_from` and `valid_until` dates
- When `valid_until` passes, POR becomes inactive (past position)
- POR table: `user_id`, `org_id`, `title`, `por_type`, `valid_from`, `valid_until`, `is_active`

#### 20.3.4 Content Authority Rules
- **Club-level posting**: Only users with an active POR in that club can post on behalf of the club. Regular members cannot.
- **Board-level posting**: Board General Secretary can post on behalf of the board.
- **Gymkhana-level posting**: President can post on behalf of the Students' Gymkhana.
- **Personal posting**: Any user can always post under their base role (student/faculty/etc.)

#### 20.3.5 Content Moderation
- View, flag, hide, or delete inappropriate content across all modules
- Manage user status: active, suspended, archived

#### 20.3.6 Extensibility
The portal is **data-driven, not hardcoded**. Adding a new club, board, or governance body:
1. Admin creates the organization entry in the portal (name, type, parent)
2. Admin adds members and assigns PORs
3. The new organization immediately appears in the Clubs directory, and its POR holders can post on its behalf

No code changes required for structural changes to the governance hierarchy.

### 20.4 Use Cases
- **UC-ADMIN01**: Platform admin adds new club "AI Society" under BOST. Assigns a Secretary and 3 Coordinators.
- **UC-ADMIN02**: BOST Gen Sec onboards new club members at the start of the semester.
- **UC-ADMIN03**: At year-end, old PORs expire via `valid_until` date. New PORs are assigned to newly elected members.
- **UC-ADMIN04**: Admin suspends a user for violating community guidelines.
- **UC-ADMIN05**: A new annual fest committee is created (e.g., "Revanche 2025 Organizing Committee") as a `fest_committee` type org, with PORs for Convenor, Co-convenors, and Coordinators.

---

## 21. Data Models (Database Schema)

### 21.1 `users` Table
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Matches Supabase Auth user ID |
| `email` | text | |
| `full_name` | text | |
| `role` | enum | `student`, `faculty`, `staff`, `alumni`, `guest` |
| `status` | enum | `active`, `inactive`, `suspended`, `archived` |
| `department` | text? | From official department list |
| `branch` | text? | B.Tech branch (from § 3.2 list). Students only. |
| `batch` | text? | Graduation year, e.g., "2025" |
| `enrollment_number` | text? | Students only |
| `employee_id` | text? | Faculty/staff only |
| `designation` | text? | Faculty/staff |
| `current_organization` | text? | Alumni |
| `current_position` | text? | Alumni |
| `phone_number`, `bio`, `linkedin_url`, `profile_picture_url` | text? | |
| `is_verified` | bool | Institutional email verification |
| `is_admin` | bool | Platform admin flag |

### 21.2 `organizations` Table (NEW)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `name` | text | E.g., "Coding Club", "BOST", "Students' Gymkhana" |
| `slug` | text UNIQUE | URL-safe identifier |
| `type` | enum | `governance_body`, `board`, `club`, `society`, `fest_committee` |
| `parent_id` | UUID? (FK → organizations) | Hierarchy link. Coding Club → BOST → Gymkhana |
| `description` | text? | |
| `logo_url` | text? | |
| `email` | text? | |
| `social_links` | JSONB? | `{instagram, website, linkedin}` |
| `is_active` | bool | |
| `founded_year` | int? | |

### 21.3 `org_members` Table (NEW)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `org_id` | UUID (FK → organizations) | |
| `user_id` | UUID (FK → users) | |
| `status` | enum | `pending`, `approved`, `removed` |
| `joined_at` | timestamptz | |

### 21.4 `user_positions` Table (NEW — POR tracking)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users) | |
| `org_id` | UUID (FK → organizations) | |
| `title` | text | "Secretary", "President", "Coordinator", "Branch Rep CSE 2024" |
| `por_type` | enum | `secretary`, `representative`, `mentor`, `coordinator`, `custom` |
| `valid_from` | date | When this POR starts |
| `valid_until` | date? | When it expires (null = indefinite) |
| `is_active` | bool | Computed or manual; false once expired |

### 21.5 `blog_posts` Table
Key columns: `author_id`, `posting_identity_id` (FK → user_positions, nullable), `title`, `slug`, `content`, `excerpt`, `featured_image_url`, `category`, `tags[]`, `company_name`, `role_applied`, `interview_round`, `status`, `is_featured`, `view_count`, `like_count`, `comment_count`, `published_at`.

### 21.6 `marketplace_items` Table
Key columns: `seller_id`, `title`, `description`, `category`, `price`, `is_negotiable`, `condition`, `status`, `images[]`, `pickup_location`, `view_count`, `expires_at`.

### 21.7 `events` Table
Key columns: `organizer_id`, `posting_identity_id`, `title`, `slug`, `description`, `type`, `start_time`, `end_time`, `location_id`, `venue_name`, `poster_url`, `requires_registration`, `max_participants`, `registration_fee`, `target_roles[]`, `target_departments[]`, `target_batches[]`, `registration_link`, `meeting_link`, `interested_count`, `is_published`, `organizing_body`.

### 21.8 `communities` Table
Key columns: `creator_id`, `name`, `slug`, `description`, `is_public`, `requires_approval`, `member_count`, `post_count`.

### 21.9 `community_members` / `community_posts` Tables
Same as before — `community_id` + `user_id`/`author_id` with role/content fields.

### 21.10 `notices` Table
Key columns: `posted_by`, `posting_identity_id`, `title`, `content`, `category`, `priority`, `tags[]`, `target_roles[]`, `target_departments[]`, `target_batches[]`, `attachments[]`, `is_active`, `is_pinned`, `valid_from`, `valid_until`.

### 21.11 `locations` Table
Key columns: `name`, `code`, `type`, `latitude`, `longitude`, `floor_count`, `has_indoor_map`, `facilities[]`, `is_accessible`, `opening_time`, `closing_time`.

### 21.12 `lost_found_items` Table
Key columns: `reporter_id`, `claimer_id?`, `item_name`, `category`, `status`, `location_lost_found`, `date_lost_found`, `contact_info?`, `images[]`.

### 21.13 `conversations` / `messages` Tables
Conversations: `participant1_id`, `participant2_id`, `last_message`, `last_message_at`, `unread_count`.
Messages: `conversation_id`, `sender_id`, `receiver_id`, `content`, `is_read`.

### 21.14 `quick_links` Table
Key columns: `created_by`, `title`, `description`, `url`, `category`, `target_roles[]`, `display_order`, `is_featured`, `click_count`.

### 21.15 `feed_posts` Table
Key columns: `author_id`, `posting_identity_id`, `content`, `media_urls[]`, `source_type`, `source_id`, `like_count`, `comment_count`, `is_public`, `target_roles[]`.

### 21.16 `notifications` Table
Key columns: `user_id`, `title`, `message`, `type`, `entity_type`, `entity_id`, `action_url`, `is_read`, `read_at`.

---

## 22. Non-Functional Requirements

### 22.1 Performance
- All list pages paginated (`.limit(20–50)`). Skeleton loaders during fetch.
- Next.js `<Image>` for auto-optimization. SWR for client-side caching (Phase 2).

### 22.2 Authentication Security
- Supabase SSR cookies (no localStorage tokens). Route-level protection via middleware.
- Row Level Security (RLS) on all tables. Content authority enforced by POR validation.

### 22.3 Responsiveness
- Tailwind responsive utilities. Mobile: sidebar collapses, cards stack, map panels stack.

### 22.4 Theming
- Dark theme only. Background `#0a0a0f`, glass cards, accent: IIT Ropar Gold (`#f59e0b`) + Blue (`#3b82f6`).
- Glassmorphism with `backdrop-blur`.

### 22.5 Extensibility
- Governance structure is fully data-driven (stored in `organizations` + `user_positions` tables)
- Adding new clubs, boards, or fest committees requires zero code changes — only admin portal entries
- Department and branch lists should be configurable (not hardcoded in frontend components)

---

## 23. IIT Ropar Terminology Glossary

| Term / Acronym | Explanation |
|---|---|
| **IIT Ropar** | Indian Institute of Technology Ropar, Rupnagar, Punjab. Premier tech institution under MoE. |
| **Students' Gymkhana** | Apex student body overseeing all clubs, councils, and extracurricular activities. |
| **SLC** | Student Legislative Council — policy-making body of the student community. |
| **POR** | Position of Responsibility — official title within a club/board/governance body (Secretary, Rep, Coordinator, etc.). |
| **BOST** | Board of Science and Technology — governs all technical clubs. |
| **BOCA** | Board of Cultural Activities — governs all cultural clubs. |
| **BOLA** | Board of Literary Activities — governs all literary/debate/media clubs. |
| **BOSA** | Board of Sports Affairs — governs all sports clubs. |
| **BOHA** | Board of Hostel Affairs — manages hostel governance. |
| **BOAA** | Board of Academic Affairs — branch representatives per batch. |
| **ISMP** | Institute Student Mentorship Programme — formalized senior-junior mentorship. |
| **Advitiya** | Annual Technical Fest (3 days). |
| **Zeitgeist** | Annual Cultural Fest, October (3 days). |
| **Aarohan** | Annual Sports Fest (3 days). |
| **Revanche** | Annual E-sports/Gaming Fest (2 days). |
| **Malhar** | Annual Literature Fest / Book Fair (3 days). |
| **IHL** | Inter-Hostel League — annual inter-hostel sports tournament. |
| **T&P Cell / CDPC** | Career Development & Placement Cell. Manages campus placements. |
| **Nalanda Library** | Central library, 24/7 reference access, 22,000+ resources, Koha system. |
| **SAC** | Student Activity Centre — houses club rooms. |
| **Snehita** | Wellbeing Cell — mental health and counselling support. |
| **Satluj, Beas, Chenab, Brahmaputra** | Boys' hostels. |
| **Raavi** | Girls' hostel. |
| **HMC** | Hall Management Committee — student body managing hostel affairs. |
| **NSS** | National Service Scheme — social service unit. |
| **E-Cell** | Entrepreneurship Cell. |
| **ENACTUS** | Social entrepreneurship society. |
| **Placement Season** | Oct–Nov (full-time), Dec–Jan (internships). Day-1 = most prestigious companies. |
| **Freshers** | Newly joining UG students, typically late July/early August. |
