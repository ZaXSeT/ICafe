# AI Context

## Current Architecture Decisions
- Next.js 15 App Router is the core framework.
- Prisma ORM is used for database interactions.
- We are using NextAuth v5 for authentication, utilizing Email/Password and potentially OAuth providers.
- Zustand will be used for global state (e.g., cart).
- Styling heavily relies on Tailwind CSS, configured with a custom design system emphasizing premium feel and soft shadows.

## Business Logic
- Reservations must check real-time table availability.
- Orders have statuses (PENDING, PREPARING, READY, SERVED, CANCELLED).
- Tables have capacities and statuses.
- Only Admins can modify the menu. Cashiers handle day-to-day operations.

## Completed Systems
- Phase 1 (Foundation): In Progress (Next.js init).

## Coding Standards & Patterns
- We use absolute imports (`@/components`, `@/lib`).
- Components are Server Components by default unless interactivity is needed (`"use client"`).
- We maintain clean architecture, separating UI, business logic (Server Actions), and database calls (Prisma).

## Current Implementation Status
- Next.js setup is running.
- Documentation files are being created.

## Pending Improvements
- Set up PostgreSQL and Prisma.
- Set up shadcn/ui.
