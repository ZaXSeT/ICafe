# Coding Standards

## TypeScript
- Use strict typing for all components, functions, and API responses.
- Avoid `any`. Use `unknown` if absolutely necessary, but prefer defining interfaces/types in `src/types`.

## React Components
- Default to Server Components (`React Server Components`).
- Add `"use client"` only when necessary (hooks like `useState`, `useEffect`, or event listeners like `onClick`).
- Use concise functional component syntax with arrow functions.

## Naming Conventions
- **Components**: PascalCase (e.g., `ReservationCard.tsx`).
- **Files/Folders**: kebab-case for routes (e.g., `app/menu-items`), PascalCase for component files, camelCase for utility files.
- **Functions/Variables**: camelCase (e.g., `calculateTotal`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_CAPACITY`).

## Data Fetching & Mutations
- Use Server Components to fetch data directly from the database using Prisma.
- Use Server Actions for mutations (form submissions, state changes).
- Avoid `useEffect` for data fetching unless absolutely necessary for client-side only data.

## Styling
- Use Tailwind CSS exclusively.
- Use `clsx` and `tailwind-merge` (via a `cn` utility) for dynamic class names.
