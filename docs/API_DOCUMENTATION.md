# API Documentation

*(This document will be populated as API endpoints and Server Actions are developed.)*

## Authentication Flow
- Handled by NextAuth.js (`/api/auth/[...nextauth]`).
- Supports session-based authentication for server components and JWT for client components.

## Server Actions Overview
Instead of traditional API routes, we primarily use Next.js Server Actions for:
- Creating reservations.
- Submitting orders.
- Updating user profiles.
- Admin/Cashier management tasks.

*More details to follow.*
