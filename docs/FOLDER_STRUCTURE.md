# Folder Structure

This project follows a feature-driven, clean architecture approach within the Next.js App Router paradigm.

## `src/` Overview

- **`app/`**: Next.js App Router (Pages, Layouts, API Routes).
  - `(auth)/`: Authentication pages (Login, Register).
  - `(customer)/`: Public-facing pages (Menu, Reservation).
  - `(cashier)/`: Cashier POS interface.
  - `(admin)/`: Admin dashboard.
- **`components/`**: Reusable React components.
  - `ui/`: shadcn/ui components (Buttons, Inputs, Dialogs).
  - `layout/`: Navbar, Footer, Sidebar.
  - `features/`: Feature-specific components (e.g., `MenuCard`, `TableMap`).
- **`lib/`**: Utility functions, Prisma client setup, Zod schemas.
- **`server/`**: Server Actions and core business logic.
- **`types/`**: Global TypeScript definitions.
- **`store/`**: Zustand state management (e.g., Cart store).

## `prisma/`
- Contains `schema.prisma` and seed scripts.

## `docs/`
- Project documentation files (this folder).
