# Civic Issue Reporting System

Production-style full-stack web app for reporting civic issues with:
- Public user dashboard (anonymous reporting + tracking)
- Admin dashboard (auth-protected management, feedback monitoring, analytics)
- Next.js App Router + API routes
- PostgreSQL + Prisma ORM
- Optional Cloudinary image storage (local fallback)

## Tech Stack
- Frontend: Next.js + Tailwind CSS
- Backend: Next.js Route Handlers (`/api/...`)
- DB: PostgreSQL
- ORM: Prisma
- Auth: NextAuth credentials provider (admin only)
- Charts: `react-chartjs-2` / Chart.js
- Maps: Google Maps Embed API (API key driven)

## Project Structure
```text
src/
  app/
    page.tsx
    submit/page.tsx
    admin/page.tsx
    admin/login/page.tsx
    api/
      auth/[...nextauth]/route.ts
      issues/route.ts
      issues/[id]/route.ts
      feedback/route.ts
      admin/analytics/route.ts
  components/
    IssueForm.tsx
    IssueList.tsx
    AdminIssueTable.tsx
    AnalyticsCharts.tsx
    FeedbackForm.tsx
    GoogleMapView.tsx
    StatusBadge.tsx
  lib/
    prisma.ts
    db.ts
    auth.ts
    upload.ts
    utils.ts
    validations.ts
  types/
    next-auth.d.ts
prisma/
  schema.prisma
scripts/
  seed-admin.mjs
```

## Environment Variables
Copy `.env.example` to `.env` and fill values.

```bash
cp .env.example .env
```

Required:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (for maps display)

Optional (for Cloudinary storage):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

If Cloudinary vars are missing, uploads are saved in `public/uploads`.

## PostgreSQL + Prisma Setup
1. Create database (local/Postgres, Neon, or Supabase):
   - Example local DB: `civic_issues`
2. Set `DATABASE_URL` in `.env`
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run migrations:
   ```bash
   npm run prisma:migrate -- --name init
   ```
5. Seed admin user:
   ```bash
   npm run seed:admin
   ```

## Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## API Endpoints
- `POST /api/issues` - create issue (multipart form + image upload + duplicate detection)
- `GET /api/issues` - list issues with optional `category`, `severity`, `status`
- `PUT /api/issues/:id` - update status / duplicate link / merge duplicate refs (admin only)
- `POST /api/feedback` - submit feedback for resolved issue only
- `GET /api/admin/analytics` - admin metrics and aggregates

## Notes
- Duplicate detection combines:
  - Haversine distance under 100m
  - Same category
  - Description token similarity threshold
- Feedback is accepted only when issue status is `RESOLVED`.
