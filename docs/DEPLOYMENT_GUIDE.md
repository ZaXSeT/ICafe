# Deployment Guide

## Production Checklist
1. **Environment Variables**: Ensure all production secrets (Database URL, NextAuth Secret) are set securely in the hosting provider.
2. **Database Migration**: Run `npx prisma migrate deploy` during the build step.
3. **Build Script**: Use standard Next.js `npm run build`.
4. **Performance**: Verify bundle sizes and ensure server components are used optimally.

## Environment Variables
Required variables (see `.env.example` when created):
- `DATABASE_URL`: PostgreSQL connection string.
- `NEXTAUTH_SECRET`: Random string for session encryption.
- `NEXTAUTH_URL`: Canonical URL of the application.

## Vercel Setup
This project is optimized for Vercel deployment:
- Connect the GitHub repository to Vercel.
- Configure Environment Variables in Vercel settings.
- The build command `npm run build` will automatically run Next.js build.
