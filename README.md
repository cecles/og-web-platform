# OG WEB Platform - Phase 1: Registration & Admin Dashboard

**Status:** ✅ Phase 1 Complete  
**Version:** 1.0.0  
**Built with:** React + TypeScript + Cloudflare Workers + D1

---

## What's Included in Phase 1

✅ **Student Registration Form**
- 14-step progressive questionnaire
- Dark/light theme toggle
- Mobile-first responsive design
- Session persistence (localStorage resume)
- Form validation with Zod
- Success confirmation screen

✅ **Admin Dashboard**
- Registration management table (sortable, filterable)
- Search by name, email, city, course
- Filter by status, experience, age range, city
- Bulk status updates (mark as contacted, enrolled, etc.)
- Dashboard metrics (total, by course, by city, by experience)
- Multi-format export: **CSV, JSON, Excel**

✅ **Backend API** (Cloudflare Worker)
- POST `/api/registrations/submit` — Student registration
- GET `/api/registrations/check-email` — Duplicate email check
- GET `/api/admin/registrations` — List registrations (paginated, searchable)
- GET `/api/admin/registrations/stats` — Dashboard metrics
- GET `/api/admin/registrations/export` — Export (format: csv, json, xlsx)
- PATCH `/api/admin/registrations/:id` — Update single registration
- PATCH `/api/admin/registrations/bulk` — Bulk status update

✅ **Database** (Cloudflare D1)
- SQLite registrations table with indexes
- Full-text search on name, email, city
- Status tracking (registered, contacted, enrolled, dropped)
- Admin activity logging ready

---

## Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare Account (free tier works)
- Git

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/cecles/og-web-platform.git
cd og-web-platform

# 2. Install dependencies
npm install

# 3. Start dev server (React + Wrangler)
npm run dev
```

Open `http://localhost:5173` in your browser.

**Student form:** Fill out the 14-step registration (test mode, no DB submission)  
**Admin dashboard:** Access at `/admin` (protected by admin key)

### Environment Setup

Create a `.dev.vars` file for local development:

```bash
ADMIN_API_KEY=your-secure-admin-key-here
```

This key is required for all `/api/admin/*` endpoints.

---

## Deployment to Cloudflare

### Step 1: Set Up D1 Database

```bash
# Create the D1 database
wrangler d1 create og-web-platform

# Apply migrations (creates tables)
wrangler d1 execute og-web-platform --file src/db/migrations/0001_registrations.sql
```

Update `wrangler.jsonc` with your database ID (provided in output above).

### Step 2: Deploy Worker + Static Assets

```bash
# Build React app
npm run build

# Deploy to Cloudflare
npm run deploy
```

Your app will be live at `https://og-web-platform.your-account.workers.dev`

### Step 3: Configure Admin Authentication

Set your admin API key as a Cloudflare Workers secret:

```bash
wrangler secret put ADMIN_API_KEY
# Enter your secure admin key when prompted
```

**To use the admin API:**
- Add header: `X-Admin-Key: your-admin-key-here`
- Or use: `Authorization: Bearer your-admin-key-here`

---

## API Documentation

### Student Registration (Public)

**POST `/api/registrations/submit`**

Request body:
```json
{
  "fullName": "John Doe",
  "whatsapp": "+234 800 000 0000",
  "email": "john@example.com",
  "city": "Lagos",
  "ageRange": "25-34",
  "courses": ["Web Development", "AI & Productivity"],
  "goals": ["Freelance", "Build websites/apps"],
  "experience": "Beginner",
  "previousSkills": ["HTML/CSS"],
  "learningMode": "Online",
  "preferredTime": "Evening",
  "trainingPlan": "Multiple Courses",
  "additionalGoals": "Want to become a full-stack developer"
}
```

Response:
```json
{
  "registration": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "registrationId": "OGW-000001",
    "status": "registered",
    "createdAt": "2026-09-29T12:00:00Z",
    ...
  }
}
```

**GET `/api/registrations/check-email?email=john@example.com`**

Response: `{ "exists": false }`

---

### Admin API (Protected)

**All admin endpoints require:** `X-Admin-Key: your-admin-key-here` header

**GET `/api/admin/registrations`**

Query parameters:
- `search` — Search by name, email, city
- `status` — Filter: registered, contacted, enrolled, dropped
- `city` — Filter by city
- `experience` — Filter by experience level
- `limit` — Results per page (default: 50, max: 5000)
- `offset` — Pagination offset (default: 0)

Example: `/api/admin/registrations?search=john&status=registered&limit=10&offset=0`

Response:
```json
{
  "registrations": [...],
  "total": 245
}
```

**GET `/api/admin/registrations/stats`**

Response:
```json
{
  "total": 245,
  "registered": 180,
  "contacted": 45,
  "enrolled": 15,
  "dropped": 5,
  "byCourse": {
    "Web Development": 120,
    "AI & Productivity": 89,
    ...
  },
  "byCity": {
    "Lagos": 89,
    "Abuja": 45,
    ...
  },
  "byExperience": {
    "Beginner": 160,
    "Intermediate": 70,
    ...
  }
}
```

**GET `/api/admin/registrations/export?format=csv|json|xlsx`**

Downloads file in specified format. All registrations in database.

Example: `/api/admin/registrations/export?format=csv`

Returns: `og-web-registrations-2026-09-29.csv`

**PATCH `/api/admin/registrations/:id`**

Update a single registration status/notes.

Request body:
```json
{
  "status": "contacted",
  "notes": "Called on 2026-09-29"
}
```

**PATCH `/api/admin/registrations/bulk`**

Update multiple registrations at once.

Request body:
```json
{
  "ids": ["OGW-000001", "OGW-000002"],
  "status": "contacted"
}
```

---

## Admin Dashboard Access

### Local Development
```
http://localhost:5173/admin
```

**Note:** Admin dashboard is client-side and requires valid admin key in request headers.

### Production
```
https://og-web-platform.your-account.workers.dev/admin
```

### Features
- 📊 Dashboard metrics cards (total, by status)
- 🔍 Search & multi-filter registrations
- ✅ Bulk select & status update
- 📥 Export to CSV, JSON, or Excel
- 📱 Mobile-responsive table
- 🎨 Dark/light theme

---

## File Structure

```
og-web-platform/
├── src/
│   ├── App.tsx                      # Student registration form
│   ├── server.ts                    # Cloudflare Worker API
│   ├── main.tsx                     # React entry point
│   ├── styles.css                   # Global theme + styles
│   ├── db/
│   │   ├── schema.sql              # DB schema (reference only)
│   │   ├── migrations/
│   │   │   └── 0001_registrations.sql
│   │   └── queries.ts              # D1 query helpers
│   ├── types/
│   │   └── registration.ts         # TypeScript types & Zod schemas
│   ├── utils/
│   │   └── export.ts               # CSV, JSON, Excel export
│   └── pages/
│       └── Admin/
│           ├── RegistrationDashboard.tsx
│           └── AdminDashboard.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.jsonc                   # Cloudflare config
└── ARCHITECTURE.md                  # Full platform roadmap
```

---

## Themes & Styling

The platform includes a professional dark/light theme:

**Dark Mode** (default)
- Background: Deep navy (#10151a)
- Accent colors: Green (#8be9a2), Blue (#7ea7ff), Orange (#f1bd7c)
- Perfect for low-light study environments

**Light Mode**
- Background: Light purple (#e6e5f9)
- Maintains all accent colors with adjusted opacity
- Clean, modern aesthetic

Toggle theme with the button in the top-right corner.

---

## Known Limitations (Phase 1)

- Admin authentication is header-based (no login UI yet — Phase 2)
- No email confirmations sent yet (Phase 2 feature)
- Form data in localStorage only (session-based, not cloud-persisted on frontend)
- No student dashboard or progress tracking (Phase 2)
- No course catalog yet (Phase 2)

---

## Next Steps (Phase 2+)

After Phase 1 is stable, Phase 2 will add:

- **Admin Login UI** (email/password, OAuth)
- **Email Confirmations** (send links to students)
- **Student Dashboard** (track registration status, receive updates)
- **Course Catalog** (browse, enroll, view syllabus)
- **Learning Hub** (video lectures, progress tracking)
- **Quizzes & Assessments** (auto-graded, with feedback)
- **Community Forums** (Q&A, peer support)
- **Certificates** (auto-generated on course completion)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full 8-week roadmap.

---

## Support & Issues

- **Questions?** Check [ARCHITECTURE.md](./ARCHITECTURE.md) for full platform design
- **Found a bug?** Open an issue on GitHub
- **Want to contribute?** Submit a pull request

---

## License

All rights reserved © OG WEB LLC SERVICES

---

**Last Updated:** 2026-09-29  
**Phase 1 Status:** ✅ Complete and ready for deployment
