# CoreClip.ai - Generate Ads via AI

Create professional marketing product imagery in seconds using AI. Simply upload sample and product images, and CoreClip.ai generates high-quality AD content optimized for social media, commercials, and personal branding.

## ✨ Features

- **AI Image Generation**: Combine product and model images to create professional product shots
- **Credit-Based System**: Flexible pricing with credit consumption (5 credits for images, 10 for videos)
- **Community Gallery**: Share and discover AI-generated content
- **User Dashboard**: Manage your generations with download and publish options
- **Instant Generation**: Results ready in seconds to minutes

## 🛠 Tech Stack

- React 19 with TypeScript
- NEXT.js 16 with TypeScript
- Tailwind CSS for styling
- Clerk for authentication
- Framer Motion for animations
- MongoDB for smooth experience
- Cloudinary as assets storage
- Pollinations.ai image generator model

### Database

- MongoDB Atlas (recommended for production)
- MongoDB local (for development)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Clerk account
- Cloudinary account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd core-clip
   ```

2. **Initialization**

   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Server Setup**

   ```bash
   npm run dev
   # or
   npm run build
   # or
   npm run start
   ```

   Frontend runs at `http://localhost:3000`

## 📁 Project Structure

```cmd
├── 📄 eslint.config.mjs
├── 🟨 next-env.d.ts
├── 🟨 next.config.ts
├── 🗂️ package-lock.json
├── 🗂️ package.json
├── 📄 postcss.config.mjs
├── 📁 public
│ ├── 📄 favicon.ico
│ ├── 🖼️ file.svg
│ ├── 🖼️ globe.svg
│ ├── 🖼️ logo.svg
│ ├── 🖼️ next.svg
│ ├── 🖼️ vercel.svg
│ ├── 🖼️ window.svg
├── 📜 README.md
├── 📁 src
│ ├── 📁 app
│ │ ├── 📁 (marketing)
│ │ │ ├── 🟦 page.tsx
│ │ ├── 📁 api
│ │ │ ├── 📁 project
│ │ │ │ ├── 📁 create
│ │ │ │ │ ├── 🟨 route.ts
│ │ │ │ ├── 📁 published
│ │ │ │ │ ├── 🟨 route.ts
│ │ │ │ ├── 📁 [projectId]
│ │ │ │ │ ├── 🟨 route.ts
│ │ │ ├── 📁 user
│ │ │ │ ├── 📁 credits
│ │ │ │ │ ├── 🟨 route.ts
│ │ │ │ ├── 📁 projects
│ │ │ │ │ ├── 🟨 route.ts
│ │ │ │ │ ├── 📁 [projectId]
│ │ │ │ │ │ ├── 🟨 route.ts
│ │ │ │ ├── 📁 publish
│ │ │ │ │ ├── 📁 [projectId]
│ │ │ │ │ │ ├── 🟨 route.ts
│ │ │ ├── 📁 webhooks
│ │ │ │ ├── 📁 clerk
│ │ │ │ │ ├── 🟨 route.ts
│ │ ├── 📁 community
│ │ │ ├── 🟦 page.tsx
│ │ ├── 📄 favicon.ico
│ │ ├── 📁 generate
│ │ │ ├── 🟦 page.tsx
│ │ ├── 🎨 globals.css
│ │ ├── 🟦 layout.tsx
│ │ ├── 📁 my-generations
│ │ │ ├── 🟦 page.tsx
│ │ ├── 🟦 page.tsx
│ │ ├── 📁 plans
│ │ │ ├── 🟦 page.tsx
│ │ ├── 📁 profile
│ │ │ ├── 🟦 page.tsx
│ │ ├── 📁 result
│ │ │ ├── 📁 [projectId]
│ │ │ │ ├── 🟦 page.tsx
│ │ ├── 📁 sign-in
│ │ │ ├── 📁 [[...sign-in]]
│ │ │ │ ├── 🟦 page.tsx
│ │ ├── 📁 sign-up
│ │ │ ├── 📁 [[...sign-up]]
│ │ │ │ ├── 🟦 page.tsx
│ ├── 📁 components
│ │ ├── 🟦 Buttons.tsx
│ │ ├── 🟦 CTA.tsx
│ │ ├── 🟦 Faq.tsx
│ │ ├── 🟦 Features.tsx
│ │ ├── 🟦 Footer.tsx
│ │ ├── 🟦 Hero.tsx
│ │ ├── 🟦 Navbar.tsx
│ │ ├── 🟦 Pricing.tsx
│ │ ├── 🟦 Title.tsx
│ ├── 📁 lib
│ │ ├── 🟨 credits.ts
│ │ ├── 🟦 mock-data.tsx
│ │ ├── 🟨 mongodb.ts
│ ├── 📁 models
│ │ ├── 🟨 Project.ts
│ │ ├── 🟨 User.ts
│ ├── 🟨 proxy.ts
│ ├── 📁 types
│ │ ├── 🟨 index.ts
├── 🗂️ tsconfig.json

```

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[MIGRATION.md](./MIGRATION.md)** - Database migration details
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Complete technical documentation

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster/coreclip
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SIGNING_SECRET=your_webhook_secret
CLOUDINARY_URL=cloudinary://key:secret@cloud
```

See `.env.example` in each directory for complete details.

## 📊 Database Schema

### User Model

- `id`: Clerk user ID (unique index)
- `email`: User email (indexed)
- `name`: User full name
- `image`: Profile image URL
- `credits`: User balance (min: 0, default: 20)
- `createdAt`, `updatedAt`: Timestamps

### Project Model

- `userId`: Owner ID (indexed)
- `name`, `productName`, `productDescription`
- `userPrompt`: Custom generation prompt
- `aspectRatio`: "9:16" or "16:9" (enum)
- `uploadedImages`: Source image URLs
- `generatedImage`: Generated image URL
- `isGenerating`: Processing state (indexed)
- `isPublished`: Community visibility (indexed)
- `error`: Generation error message
- `createdAt`, `updatedAt`: Timestamps

## 🔌 API Endpoints

All endpoints require Clerk authentication (except public endpoints).

### User Routes

- `GET /api/user/credits` - Get user credit balance
- `GET /api/user/projects` - Get all user projects
- `GET /api/user/projects/:projectId` - Get single project
- `GET /api/user/publish/:projectId` - Toggle project visibility

### Project Routes

- `POST /api/project/create` - Create and generate image (5 credits)
- `GET /api/project/published` - Get published projects (public)
- `DELETE /api/project/:projectId` - Delete project

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#6-api-routes) for full details.

## 🎬 Generation Flow

1. **User uploads images** → Product and model images
2. **Backend validates** → Checks credits and files
3. **Google GenAI generates** → Creates composite product image
4. **Cloudinary stores** → Image uploaded and URL saved
5. **Database updates** → Project marked complete

## 💳 Pricing Model

- **Image Generation**: 5 credits
- **Starting Credits**: 20 free credits per user
- **Upgrade Plans**:
  - Pro: +80 credits
  - Premium: +240 credits

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- MongoDB setup instructions
- Clerk webhook configuration
- Vercel + Railway deployment
- Docker containerization

## 🔐 Security

- Clerk handles user authentication
- Protected API routes via auth middleware
- MongoDB connection with SSL/TLS
- Environment variables for sensitive data
- CORS configured for authorized origins

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## 📝 License

ISC

## 🆘 Troubleshooting

### MongoDB Connection Issues

- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Test with: `mongodb://localhost:27017/coreclip` (local dev)

### Clerk Webhook Issues

- Verify webhook secret in `.env`
- Check Clerk dashboard for webhook logs
- Ensure webhook endpoint is accessible

### AI Generation Timeouts

- Content generation takes 2-5 minutes
- Verify Google Cloud API quota
- Check network connectivity

### Port Already in Use

- CoreClip: `lsof -i :3000` then `kill <PID>`

## 📞 Support

For issues or questions:

1. Check [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for detailed docs
2. Review error messages in server/browser console
3. Check MongoDB/Clerk/Cloudinary dashboards
4. Open an issue on GitHub

---

**CoreClip.ai** - Transform product images into viral video content with AI.
