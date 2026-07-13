# CoreClip: Generate Short Video Ads via AI — Technical Documentation

## 1. Project Overview

CoreClip is a Next.js web application that allows authenticated users to upload two sample images, provide a product description and prompt, and generate a polished product-style image for short-form advertising campaigns. The application is designed for creators, marketers, and small businesses that need a lightweight way to prototype ad visuals without manually building complex promotional assets. The system replaces a largely manual workflow of assembling product imagery and ad concepts by combining image upload, AI image generation, project persistence, and a community gallery for published outputs.

### Problem statement

The application automates the early-stage creation of promotional visuals by reducing the need for manual image compositing, repeated asset preparation, and ad concept prototyping. In its current implementation, it focuses on generating a single commercial-style image from two uploaded images and later offering a video variant workflow.

### Core value proposition

CoreClip offers a simple end-to-end flow for turning uploaded product/model images into AI-generated ad assets, backed by user accounts, credit-based usage, and a publishable gallery for community sharing.

## 2. Objectives

- Provide a secure authenticated workflow for generating ad-style images from uploaded images.
- Persist user projects in a database so generation results can be reviewed later.
- Implement a credit-based usage model to gate generation requests.
- Support publishing selected projects to a community gallery.
- Provide a marketing landing experience alongside the main generator experience.
- Integrate AI image generation using an external generative model and cloud storage for generated assets.
- Offer a basic video-generation pathway that can be extended later.

## 3. Tech Stack

| Layer              | Technology                                                            | Purpose                                                 |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------------- |
| Frontend           | Next.js 16.2.9, React 19.2.4                                          | App Router-based web application and UI rendering       |
| Language           | TypeScript                                                            | Type-safe application logic and component development   |
| Backend/API        | Next.js Route Handlers                                                | REST-like API endpoints under the App Router            |
| Database           | MongoDB with Mongoose 9.7.3                                           | Persistence of users and projects                       |
| Authentication     | Clerk (@clerk/nextjs)                                                 | User sign-in, sign-up, protected routes, user identity  |
| AI/ML              | Google GenAI (@google/genai)                                          | Image generation from uploaded images and prompts       |
| Media storage      | Cloudinary                                                            | Uploading source images and generated images            |
| Webhooks           | Svix                                                                  | Verifying Clerk webhook events                          |
| Styling            | Tailwind CSS 4, custom CSS                                            | UI styling and layout                                   |
| UI enhancement     | Framer Motion, Lucide React, react-hot-toast                          | Animations, icons, and toast notifications              |
| Hosting/deployment | Generic Next.js deployment target; no deployment config found in repo | Build and run the app in a standard Next.js environment |

## 4. System Architecture

The application uses the Next.js App Router architecture. Client-side pages are rendered inside the App Router structure under src/app, while API logic is implemented as Route Handlers under src/app/api. A typical request flow is:

1. A user signs in with Clerk and accesses a protected route.
2. The client page collects form data and uploads images.
3. The frontend sends a request to a Route Handler such as /api/project/create.
4. The route handler authenticates the user, checks credits, connects to MongoDB, uploads assets to Cloudinary, and calls the Gemini image generation API.
5. The generated image is uploaded back to Cloudinary and stored in MongoDB as part of the project record.
6. The result page fetches the project from the database and presents the generated asset to the user.

### AI generation pipeline

1. User submits project metadata, a prompt, and two uploaded images.
2. The backend converts the uploaded image files to base64 and uploads them to Cloudinary.
3. The backend calls the Gemini image-generation model with two inline image inputs and a text prompt.
4. The model returns image data as base64.
5. The backend uploads the returned image to Cloudinary and saves the public URL to the project record.
6. The frontend loads the image from the result page.

### Video generation pipeline

1. The user opens a project result page and clicks “Generate video”.
2. The frontend calls /api/project/video with the project ID.
3. The backend verifies the project belongs to the authenticated user and that a generated image exists.
4. The current implementation does not invoke a real video-generation model; it waits briefly and returns a demo Cloudinary video URL.

### Folder structure

```text
src/
  app/                  # App Router pages and API route handlers
  components/           # Reusable UI components for marketing and app pages
  lib/                  # Shared utilities for auth credits, Gemini, MongoDB, mock data
  models/               # Mongoose schemas for User and Project
  types/                # Shared TypeScript interfaces
  middleware.ts         # Clerk route protection middleware
```

## 5. Database Design

The application uses MongoDB through Mongoose. There is no Prisma or Drizzle schema file in the repository.

### User model

File: src/models/User.ts

Fields:

- id: String, required, unique, indexed
- email: String, indexed
- name: String, default "Clerk User"
- image: String, default ""
- credits: Number, default 20, min 0
- timestamps: createdAt, updatedAt

### Project model

File: src/models/Project.ts

Fields:

- userId: String, required, indexed
- name: String, default "New Project"
- productName: String, required
- productDescription: String
- userPrompt: String
- aspectRatio: String, enum ["9:16", "16:9", "1:1"], default "9:16"
- targetLength: Number, default 5
- uploadedImages: Array of Strings
- generatedImage: String
- generatedVideo: String
- isGenerating: Boolean, default false, indexed
- isPublished: Boolean, default false, indexed
- error: String
- timestamps: createdAt, updatedAt

### Relationship design

The system implements a logical one-to-many relationship between users and projects:

- One user can own many projects.
- Each project stores a userId string that identifies the owner.
- Relationships are not modeled with Mongoose refs; they are enforced through query filters by userId.

## 6. API Endpoints

| Method | Route                          | Purpose                                                                        | Auth Required              | Key Request/Response Fields                                                                                         |
| ------ | ------------------------------ | ------------------------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| POST   | /api/project/create            | Create a new project, upload images, generate an image, store project metadata | Yes                        | FormData with images, productName, productDescription, userPrompt, aspectRatio, name; returns projectId and message |
| POST   | /api/project/video             | Trigger a video-generation workflow for an existing project                    | Yes                        | JSON body with projectId; returns success message and videoUrl                                                      |
| DELETE | /api/project/[projectId]       | Delete a project owned by the current user                                     | Yes                        | Path parameter projectId; returns confirmation message                                                              |
| GET    | /api/project/published         | List all published projects for the community gallery                          | No                         | Returns array of projects with user summary                                                                         |
| GET    | /api/user/projects             | List projects belonging to the current user                                    | Yes                        | Returns array of projects                                                                                           |
| GET    | /api/user/projects/[projectId] | Fetch one project by ID for the current user                                   | Yes                        | Returns a single project                                                                                            |
| GET    | /api/user/publish/[projectId]  | Toggle the published state of a project                                        | Yes                        | Returns isPublished and project payload                                                                             |
| GET    | /api/user/credits              | Retrieve the current user’s credit balance                                     | Yes                        | Returns credits                                                                                                     |
| POST   | /api/webhooks/clerk            | Receive and process Clerk webhook events                                       | No, but signature-verified | Verifies webhook payload and syncs user data or updates credits                                                     |

## 7. Core Modules / Features

### Project creation and AI image generation

Implemented primarily in src/app/api/project/create/route.ts and src/app/generate/page.tsx.

This feature collects project metadata, validates that at least two images are supplied, checks the user’s credit balance, uploads images to Cloudinary, creates a project document in MongoDB, calls the Gemini image-generation model, uploads the generated image to Cloudinary, and updates the project record with the resulting asset.

### Result review and video generation

Implemented in src/app/result/[projectId]/page.tsx and src/app/api/project/video/route.ts.

After generation, the project result page displays the generated image and provides a button to trigger a video-generation request. In the current codebase, this action is a placeholder that returns a demo video URL after a short delay.

### User project management

Implemented in src/app/my-generations/page.tsx, src/app/api/user/projects/route.ts, and src/app/api/user/projects/[projectId]/route.ts.

Users can view their generated projects, open a project result page, and toggle publication status. Projects can also be deleted through the dedicated delete route.

### Community gallery

Implemented in src/app/community/page.tsx and src/app/api/project/published/route.ts.

Published projects are retrieved from MongoDB and displayed in a gallery view, enriched with the publishing user’s name and image.

### Credit management

Implemented in src/lib/credits.ts and src/app/api/user/credits/route.ts.

The system maintains a credit balance for each user. Specific actions cost credits: image generation costs 5, video generation costs 10, signup grants 20, and plan-specific credit amounts are defined in the code.

### Authentication and account sync

Implemented through Clerk integration and the webhook route.

User accounts are created or updated from Clerk events, and credit balances can be adjusted after payment-related events if the webhook payload indicates a paid subscription or checkout.

## 8. AI Integration Details

The application uses Google’s GenAI SDK via the @google/genai package.

### Model and API usage

- The backend initializes a client from the GOOGLE_CLOUD_API_KEY environment variable in src/lib/gemini.ts.
- The image-generation call is executed using the model name: gemini-2.0-flash-preview-image-generation.
- The request sends two image inputs (inline data) and a text prompt to the model.
- The model is configured to return image output with a 9:16 aspect ratio by default, and the response is parsed for inline image data.

### AI workflow sequence

1. The backend reads the first two uploaded images from the request.
2. It converts them to base64 and constructs a prompt that combines product description and user prompt.
3. The Gemini model receives both images and the prompt.
4. The backend extracts the generated image from the response and uploads it to Cloudinary.
5. The generated image URL is written into the project document.

### Important limitation

The current implementation does not call a dedicated video-generation model. The video endpoint uses a static demo URL and a short delay, so the “video generation” path is a placeholder rather than a fully implemented AI rendering pipeline.

## 9. Authentication & Authorization

Authentication is handled by Clerk through the @clerk/nextjs package.

- The root layout wraps the app in ClerkProvider.
- The middleware in src/middleware.ts protects all routes except the public landing page, sign-in/sign-up pages, the Clerk webhook route, and the published-projects route.
- Protected API routes call auth() from Clerk and return 401 Unauthorized when no user identity is available.
- The frontend uses useAuth and useUser hooks to determine whether the current visitor is signed in and to fetch user-specific data.
- The webhook route verifies incoming Clerk events using Svix signatures before updating or deleting user documents.

## 10. Frontend Structure

### Main pages and routes

- / — Marketing landing page with hero, feature highlights, pricing, FAQ, and CTA.
- /generate — Authenticated page for creating a new project and submitting images for AI generation.
- /result/[projectId] — Project detail page showing the generated image and providing a video-generation action.
- /my-generations — Authenticated dashboard for listing and managing user projects.
- /community — Public gallery of published projects.
- /plans — Static pricing page with plan cards.
- /profile — Clerk-hosted user profile/settings page.
- /sign-in and /sign-up — Clerk authentication routes.

### Reusable UI components

- src/components/Navbar.tsx — Navigation bar with auth-aware actions and credit display.
- src/components/Hero.tsx — Marketing hero section.
- src/components/Features.tsx — Feature cards.
- src/components/Pricing.tsx — Pricing section.
- src/components/CTA.tsx, Faq.tsx, Footer.tsx — Supporting marketing sections.
- src/components/Buttons.tsx — Shared button styles.
- src/components/Title.tsx — Reusable section heading component.

### State management approach

The project does not use a global state library such as Redux, Zustand, or React Query. It relies on local component state via React useState/useEffect and direct fetch calls to API routes.

## 11. Environment Configuration

No .env.example or .env.local.example file is present in the repository. The following environment variables are referenced directly in source code:

| Variable                     | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| MONGODB_URI                  | Connection string for the MongoDB database     |
| GOOGLE_CLOUD_API_KEY         | API key used by the Google GenAI client        |
| CLOUDINARY_CLOUD_NAME        | Cloudinary account cloud name                  |
| CLOUDINARY_API_KEY           | Cloudinary API key                             |
| CLOUDINARY_API_SECRET        | Cloudinary API secret                          |
| CLERK_WEBHOOK_SIGNING_SECRET | Secret used to verify Clerk webhook signatures |

Additional Clerk environment variables are expected by the @clerk/nextjs integration, but they are not explicitly referenced in the repository source files.

## 12. Testing & Quality

No dedicated test suite, Playwright setup, or Cypress configuration is present in the repository.

Available quality checks:

- npm run lint — runs ESLint for the codebase.

There are no visible unit or integration tests for API routes, UI components, or AI-generation flows.

## 13. Deployment

The repository contains standard Next.js build and start scripts:

- npm run dev
- npm run build
- npm run start

There is no Dockerfile, Vercel config, GitHub Actions workflow, or other deployment automation file in the repository. The project appears to target a standard Next.js hosting environment and is likely compatible with Vercel-style deployment, but this is not explicitly configured in the codebase.

## 14. Limitations & Known Issues

- The video-generation endpoint is a placeholder and does not invoke a real video synthesis model.
- Error handling is present at the route level, but there is no comprehensive validation layer such as Zod or Yup.
- There is no rate limiting or queueing system for generation requests.
- The app relies on a single MongoDB document model without explicit relationships or indexes beyond those declared in the schemas.
- The code uses hardcoded credit prices and a placeholder demo video URL.
- There are no automated tests for frontend or backend behavior.
- The public-facing marketing content includes placeholder-style copy such as “Trusted by 10k+ creators,” which is not backed by evidence in the repository.

## 15. Suggested Future Enhancements

- Replace the placeholder video-generation logic with a real AI video rendering service or pipeline.
- Add background job processing for long-running generation tasks instead of handling generation inline in the API route.
- Introduce formal validation using Zod or similar libraries for request payloads and form inputs.
- Add automated tests for route handlers, frontend pages, and critical AI-generation workflows.
- Expand the database model to support richer media assets, statuses, and generation logs.
- Add real billing integration rather than relying on webhook-based credit adjustments.
- Improve observability with structured logging and error tracking.

## 16. File/Folder Reference Index

- Project entry point: src/app/page.tsx
- Marketing landing page: src/app/(marketing)/page.tsx
- Generation page: src/app/generate/page.tsx
- Result page: src/app/result/[projectId]/page.tsx
- My generations page: src/app/my-generations/page.tsx
- Community gallery: src/app/community/page.tsx
- Plans page: src/app/plans/page.tsx
- Profile page: src/app/profile/page.tsx
- App layout: src/app/layout.tsx
- Clerk middleware: src/middleware.ts
- Project creation API: src/app/api/project/create/route.ts
- Project video API: src/app/api/project/video/route.ts
- Project delete API: src/app/api/project/[projectId]/route.ts
- Published-projects API: src/app/api/project/published/route.ts
- User project list API: src/app/api/user/projects/route.ts
- User project detail API: src/app/api/user/projects/[projectId]/route.ts
- User publish toggle API: src/app/api/user/publish/[projectId]/route.ts
- User credits API: src/app/api/user/credits/route.ts
- Clerk webhook API: src/app/api/webhooks/clerk/route.ts
- Gemini integration: src/lib/gemini.ts
- Credit logic: src/lib/credits.ts
- MongoDB connection: src/lib/mongodb.ts
- Project model: src/models/Project.ts
- User model: src/models/User.ts
- Shared types: src/types/index.ts
- Global styling: src/app/globals.css
- Application configuration: next.config.ts
- Package manifest: package.json
- Project readme: README.md

Not present in codebase — to be filled manually: detailed project timeline, team roles, supervisor details, and formal academic evaluation criteria.
