# CoreClip Next.js Migration

This project now runs as a unified Next.js 16 + TypeScript application with App Router, Clerk auth, Mongoose, Cloudinary, and Google AI integration.

## Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run lint` – run ESLint

## Environment

Copy `.env.local.example` to `.env.local` and fill in the required values for Clerk, MongoDB, Cloudinary, and Google AI.

## Notes

- The app preserves the original marketing experience and core generator flow.
- Video generation currently uses a free-tier-compatible placeholder flow and should be replaced with a provider-specific implementation when a paid or quota-backed service is available.

## Environment Variables

MONGODB_URI=mongodb://localhost:27017/coreclip

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=
