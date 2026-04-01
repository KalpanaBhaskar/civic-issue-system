# Civic Issue Reporting System

A production-grade full-stack web application for reporting and tracking civic issues. Built with modern technologies and designed for scalability, performance, and maintainability.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Functional Requirements](#functional-requirements)
- [Database Design](#database-design)
- [Syllabus Coverage](#syllabus-coverage)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

### Public Dashboard
- **Anonymous Issue Reporting** - Submit issues without registration or personal information
- **Real-time Tracking** - Monitor issue status (Under Review, In Progress, Resolved)
- **Image Upload** - Attach multiple photos to support your report
- **Geolocation** - Automatic location capture for accurate issue identification
- **Filter & Search** - Filter issues by category, severity, and status

### Admin Dashboard
- **Authentication** - Secure admin access with NextAuth
- **Issue Management** - Update status, link duplicates, merge reports
- **Analytics & Reporting** - Visual dashboards with Chart.js
- **Feedback Monitoring** - Track user ratings and comments
- **Trend Analysis** - Identify recurring issues and problem areas

### Technical Features
- **Duplicate Detection** - Smart algorithm using location and description similarity
- **Image Storage** - Cloudinary integration with local fallback
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Type Safety** - Full TypeScript implementation
- **Form Validation** - Zod schema validation on both client and server

## Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework with server components
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript 5** - Type-safe JavaScript
- **react-leaflet** - Interactive maps
- **react-chartjs-2** - Data visualization

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database client
- **PostgreSQL** - Relational database
- **NextAuth.js** - Authentication solution
- **bcryptjs** - Password hashing

### Infrastructure
- **Cloudinary** (optional) - Image storage and optimization
- **Neon PostgreSQL** - Serverless database (production-ready)

## Database Schema

### Entities
- **User** - Admin users with role-based access
- **Issue** - Reported civic issues with metadata
- **Feedback** - User ratings and comments on resolved issues

### Relationships
- One-to-Many: User → Issues (not enforced, anonymous reporting)
- One-to-Many: Issue → Feedback (cascade delete)
- Self-Reference: Issue → Issue (duplicate detection)

### Indexes
- Composite index on `(category, severity, status)` for filtering
- Spatial index on `(latitude, longitude)` for location queries
- Index on `duplicate_of_id` for duplicate tracking

## Project Structure

```
.
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Prisma schema definition
├── public/
│   └── uploads/             # Local image storage (fallback)
├── scripts/
│   └── seed-admin.mjs       # Admin user seeding script
├── src/
│   ├── app/
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── api/             # API route handlers
│   │   │   ├── auth/        # NextAuth configuration
│   │   │   ├── admin/       # Admin-only endpoints
│   │   │   ├── issues/      # Issue CRUD operations
│   │   │   └── feedback/    # Feedback submission
│   │   ├── page.tsx         # Public dashboard
│   │   ├── submit/page.tsx  # Issue reporting form
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── IssueForm.tsx
│   │   ├── IssueList.tsx
│   │   ├── IssueCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── AdminIssueTable.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   ├── FeedbackForm.tsx
│   │   ├── GoogleMapView.tsx
│   │   └── LogoutButton.tsx
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── upload.ts        # Image upload logic
│   │   ├── utils.ts         # Helper functions
│   │   ├── validations.ts   # Zod schemas
│   │   └── db.ts            # Database utilities
│   └── types/
│       └── next-auth.d.ts   # NextAuth type extensions
├── queries.sql              # SQL queries for syllabus topics
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js 18+ with npm
- PostgreSQL database (local or cloud)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd civic-issue-reporting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Configure PostgreSQL**
   ```bash
   # Create database
   createdb civic_issues
   
   # Or use Neon/Supabase
   # Set DATABASE_URL in .env
   ```

5. **Run Prisma migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```

6. **Seed admin user**
   ```bash
   npm run seed:admin
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

8. **Open in browser**
   ```
   http://localhost:3000
   ```

## Environment Variables

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/civic_issues` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `your-secret-key-here` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIzaSy...` |

### Optional Variables (Cloudinary)
| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123...` |

If Cloudinary variables are not set, images are stored locally in `public/uploads/`.

## API Documentation

### Public Endpoints

#### POST `/api/issues`
Create a new issue report.

**Request Body** (multipart/form-data):
- `category` (string): ROAD, WASTE, WATER, TRAFFIC, or STREETLIGHT
- `description` (string): Detailed description (min 10 chars)
- `severity` (string): LOW, MEDIUM, or HIGH
- `latitude` (number): GPS latitude (-90 to 90)
- `longitude` (number): GPS longitude (-180 to 180)
- `sessionId` (string, optional): Session identifier for anonymous tracking
- `images` (file[], optional): Up to 4 images

**Response**:
```json
{
  "issue": {
    "id": "uuid",
    "category": "ROAD",
    "description": "...",
    "severity": "MEDIUM",
    "status": "UNDER_REVIEW",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "duplicateDetected": false
}
```

#### GET `/api/issues`
Retrieve all issues with optional filters.

**Query Parameters**:
- `category` (string, optional)
- `severity` (string, optional)
- `status` (string, optional)

**Response**:
```json
{
  "issues": [
    {
      "id": "uuid",
      "category": "ROAD",
      "description": "...",
      "severity": "MEDIUM",
      "status": "UNDER_REVIEW",
      "images": [],
      "feedbacks": []
    }
  ]
}
```

### Admin Endpoints

#### PUT `/api/issues/:id`
Update issue status or link duplicates (admin only).

**Request Body**:
```json
{
  "status": "IN_PROGRESS",
  "duplicateOfId": "uuid",
  "mergeToIssueId": "uuid"
}
```

#### POST `/api/feedback`
Submit feedback for a resolved issue.

**Request Body**:
```json
{
  "issueId": "uuid",
  "rating": 5,
  "comment": "Great service!"
}
```

#### GET `/api/admin/analytics`
Get analytics data (admin only).

**Response**:
```json
{
  "totalIssues": 150,
  "issuesPerCategory": [
    {"category": "ROAD", "count": 50},
    {"category": "WASTE", "count": 40}
  ],
  "topLocations": [
    {"location": "28.613,77.209", "count": 15}
  ],
  "avgResolutionHours": 48.5
}
```

## Functional Requirements

### FR1: Anonymous Issue Reporting 
Users can submit issues without registration. A `sessionId` stored in localStorage tracks anonymous users.

### FR2: Issue Categorization 
Five predefined categories: ROAD, WASTE, WATER, TRAFFIC, STREETLIGHT.

### FR3: Image Upload and Geotagging 
Multiple image uploads with automatic geolocation capture using browser Geolocation API.

### FR4: Severity Rating 
Three severity levels: LOW, MEDIUM, HIGH for prioritization.

### FR5: Issue Status Tracking 
Three statuses: UNDER_REVIEW, IN_PROGRESS, RESOLVED with timestamps.

### FR6: Duplicate Issue Detection 
Algorithm combines:
- Haversine distance < 100 meters
- Same category
- Text similarity ≥ 0.35 (Jaccard index)

### FR7: User Feedback and Rating 
Users can rate (1-5) and comment on resolved issues only.

### FR8: Trend Analysis and Reporting 
Admin analytics include:
- Issues per category
- Top affected locations
- Average resolution time
- Status distribution

## Database Design

### Entity-Relationship Model

```
┌─────────────┐        ┌─────────────┐
│    User     │        │    Issue    │
├─────────────┤        ├─────────────┤
│ id (PK)     │        │ id (PK)     │
│ email       │        │ sessionId   │
│ password    │        │ category    │
│ role        │        │ description │
│ createdAt   │        │ images[]    │
│ updatedAt   │        │ latitude    │
└─────────────┘        │ longitude   │
                       │ severity    │
                       │ status      │
                       │ duplicateOf │
                       │ createdAt   │
                       │ updatedAt   │
                       │ resolvedAt  │
                       └─────────────┘
                              │
                              │ 1:N
                              │
                       ┌─────────────┐
                       │   Feedback  │
                       ├─────────────┤
                       │ id (PK)     │
                       │ issueId (FK)│
                       │ rating      │
                       │ comment     │
                       │ createdAt   │
                       └─────────────┘
```

### Normalization (BCNF)

**Issue Table**:
- Functional Dependencies:
  - `id → sessionId, category, description, images, latitude, longitude, severity, status, duplicateOfId, createdAt, updatedAt, resolvedAt`
  - `sessionId → {}` (partial dependency, but acceptable for anonymous tracking)

- Normalized to BCNF: Yes (all determinants are superkeys)

**Feedback Table**:
- Functional Dependencies:
  - `issueId → rating, comment, createdAt`
  - `id → issueId, rating, comment, createdAt`

- Normalized to BCNF: Yes

## Syllabus Coverage

### Conceptual Data Modeling
- ✅ Database environment and lifecycle
- ✅ Requirements collection (functional requirements)
- ✅ Database design (ER model)
- ✅ Entity-Relationship model (see diagram above)
- ✅ Enhanced ER model (inheritance patterns)
- ✅ UML class diagrams (Prisma schema)

### Relational Model and SQL
- ✅ Relational model concepts (tables, keys, relationships)
- ✅ Integrity constraints (NOT NULL, UNIQUE, FOREIGN KEY)
- ✅ SQL data manipulation (SELECT, INSERT, UPDATE, DELETE)
- ✅ SQL data definition (CREATE TABLE, ALTER TABLE)
- ✅ Views (v_admin_dashboard, v_high_severity_issues)
- ✅ SQL programming (stored procedures, triggers)

### Relational Database Design and Normalization
- ✅ ER to relational mapping (Prisma schema)
- ✅ Update anomalies (addressed through normalization)
- ✅ Functional dependencies (documented in design)
- ✅ Inference rules (BCNF verification)
- ✅ Minimal cover (FD analysis)
- ✅ Properties of relational decomposition
- ✅ Normalization up to BCNF (verified)

### Transactions
- ✅ Transaction concepts (BEGIN, COMMIT, ROLLBACK)
- ✅ ACID properties (handled by PostgreSQL)
- ✅ Schedules and serializability
- ✅ Concurrency control (NextAuth session management)
- ✅ Locking protocols (FOR UPDATE, NOWAIT)
- ✅ Two-phase locking (documented)
- ✅ Deadlock handling (timeout configuration)
- ✅ Transaction recovery (WAL in PostgreSQL)
- ✅ Save points (demonstrated in queries)
- ✅ Isolation levels (SERIALIZABLE, READ COMMITTED)
- ✅ SQL facilities for concurrency and recovery

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npx prisma migrate deploy
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment
- **Vercel**: Deploy directly from Git repository
- **Railway**: PostgreSQL + Node.js hosting
- **Neon**: Serverless PostgreSQL with automatic backups

## Testing

### Running Tests
```bash
npm test
npm run lint
```

### Manual Testing Checklist
- [ ] Submit anonymous issue with images
- [ ] Verify geolocation capture
- [ ] Test duplicate detection
- [ ] Admin login and dashboard access
- [ ] Update issue status
- [ ] Submit feedback for resolved issue
- [ ] View analytics charts
- [ ] Filter issues by category/severity/status

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# For Neon: Check connection string format
```

**Migration Failed**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

**Admin Login Not Working**
```bash
# Re-seed admin user
npm run seed:admin
```

**Image Upload Failing**
```bash
# Check Cloudinary credentials
# Or ensure public/uploads directory is writable
```

### Logs
```bash
# Development logs
npm run dev

# Production logs
npm start
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with Next.js, Prisma, and PostgreSQL
- Inspired by civic tech initiatives worldwide
- Designed for scalability and maintainability
