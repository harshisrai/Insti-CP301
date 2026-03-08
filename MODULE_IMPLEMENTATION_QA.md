# Clubs, Events, and Notices Implementation Q&A

This document outlines exactly what is currently implemented in the codebase, what is missing according to the SRS, and the critical questions that need your answers before we write the code. 

**Please write your answers directly under each question in the "YOUR ANSWER" sections.** Once you're done, let me know, and I will use this document to guide the development.

---

## 1. Clubs & Bodies

### What I Know Is Implemented:
* **Database**: `organizations` table exists with a hierarchical structure (Boards -> Clubs/Societies). `org_members` and `user_positions` tables exist for tracking members and roles (PORs).
* **API/Hooks**: `useOrganizations()` successfully fetches organizations and their basic metadata.
* **UI**: `/clubs` route exists with a basic filtering tab, and clicking a club shows a placeholder `/clubs/[slug]` detail page.

### What Is Missing (To Be Built):
* **Board Filter**: A secondary row in the UI to filter clubs by their parent board (e.g., BOST, BOCA, BSA).
* **Member & POR Display**: The club detail page needs to show a grid of members and their specific Positions of Responsibility.
* **Events & Posts Linking**: The club detail page needs to show feed posts and events created under this club's identity.

### Questions for You:
**Q1.1: The "Request to Join" workflow.**
The SRS mentions users can "Request to Join" a club/community. Should I build out the full database schema mutations for this right now (creating a `pending` status in `org_members`), or should I just create the UI button and wire it up to a simple "Request Sent" toast notification for now until the Admin Portal is built to handle approvals?
> **YOUR ANSWER:** 
> 

**Q1.2: Club logos and cover images.**
Currently we don't have image uploads configured for these. Should I just use the fallback avatar/initials for clubs, or do you want me to wire up Supabase Storage for uploading official club logos right now?
> **YOUR ANSWER:**
> 

---

## 2. Events

### What I Know Is Implemented:
* **Database**: `events` table exists with types (Cultural, Technical, etc.) and dates.
* **API/Hooks**: `useEvents()` fetches upcoming and past events.
* **UI**: `/events` route displays generic event cards, and `/events/create` has a basic form for Title, Description, Date, Location, and Type.

### What Is Missing (To Be Built):
* **Event Detail Page**: `/events/[slug]` needs to be fully built out to show all the details.
* **Targeting System UI**: The ability to select which Roles, Departments, and Batches this event is for.
* **Posting Identity Selector**: Allowing a student to post the event as "Secretary, Coding Club" rather than just themselves.

### Questions for You:
**Q2.1: The Registration/RSVP system.**
The SRS mentions registration fees, capacity limits, and tracking "interested" attendees. Do you want me to build out the full database table for `event_registrations` so people can actually click "Register" and be stored in the DB, or just track a simple `interested_count` integer for now?
> **YOUR ANSWER:**
> 

**Q2.2: Event Posters / Images.**
Do we need to add Supabase Storage integration for uploading an event poster/banner on the create form? 
> **YOUR ANSWER:**
> 

---

## 3. Notices

### What I Know Is Implemented:
* **Database**: `notices` table exists with priority levels, categories, and target audiences. It already correctly links to the author's Posting Identity.
* **UI**: `/notices` displays notices nicely with pins for important ones, and `/notices/create` successfully saves them to the DB.

### What Is Missing (To Be Built):
* **Notice Detail Page**: A dedicated page `/notices/[id]` for reading long notices.
* **Visual Priority Coding**: Adding colors to the UI cards (Red for Urgent, Gold for High, etc.).
* **Targeting Selection UI**: The create form needs the multi-select dropdowns for Target Roles, Target Departments, and Target Batches.

### Questions for You:
**Q3.1: Notice Attachments.** 
The SRS mentions attaching PDFs to official notices. Do you want me to build the Supabase Storage pipeline for uploading and downloading PDF attachments right now, or skip attachments for this phase?
> **YOUR ANSWER:**
> 

---

**When you have filled out your answers, just tell me "I've answered the questions" in the chat, and I will read this document and begin coding!**
