# OG WEB Platform - Complete Architecture & Roadmap

**Version:** 1.0  
**Last Updated:** 2026-09-29  
**Status:** Planning Phase

---

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Tech Stack](#tech-stack)
3. [Phase 1: Registration & Onboarding](#phase-1-registration--onboarding)
4. [Phase 2: Course Management](#phase-2-course-management)
5. [Phase 3: Learning Hub](#phase-3-learning-hub)
6. [Phase 4: Assessments & Progress](#phase-4-assessments--progress)
7. [Phase 5: Community & Admin](#phase-5-community--admin)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [Deployment Strategy](#deployment-strategy)

---

## Platform Overview

**OG WEB** is a comprehensive learning platform for the 3-Day Webinar, built entirely on Cloudflare's infrastructure. The platform enables:

- **Students:** Self-paced course enrollment, progress tracking, interactive assessments, community polls
- **Teachers:** Content management, live/recorded lecture delivery, grading, student feedback
- **Admins:** Registration management, analytics, reporting, user lifecycle management
- **Parents:** Student progress visibility (if applicable)

**Core Differentiators:**
- Zero third-party dependencies (Cloudflare-first)
- Multi-platform (Web, iOS, Android with React Native)
- Email/password + OAuth ready
- Serverless, cost-effective, globally distributed

---

## Tech Stack

```
Frontend (Web)
├── React 19 + TypeScript
├── Vite (build & dev server)
├── Tailwind CSS + Kumo UI (Cloudflare design system)
└── React Query (data fetching)

Frontend (Mobile)
├── React Native 0.76+
├── TypeScript
├── React Native Paper or Kumo Native
└── Redux or Zustand (state management)

Backend
├── Cloudflare Workers (serverless compute)
├── Durable Objects (stateful agents)
├── Cloudflare D1 (SQLite database)
├── Cloudflare R2 (object storage for uploads)
└── Cloudflare AI (inference, embeddings)

Real-time
├── WebSocket via Durable Objects
├── Server-sent Events (SSE) fallback

DevOps
├── GitHub Actions (CI/CD)
├── Wrangler CLI (Cloudflare deployment)
└── GitHub as source of truth
```

---

## Phase 1: Registration & Onboarding

**Timeline:** Week 1 (Starting today)  
**Deliverables:** Live registration form, D1 schema, admin export

### 1.1 Registration Form Flow

**14-step student questionnaire** (one per page, progressive disclosure):

```
Step 1: Full Name
Step 2: WhatsApp Number (or alternative contact)
Step 3: Email Address
Step 4: City/Location
Step 5: Age Range (buttons: 18-24, 25-34, 35-44, 45+, Prefer not to say)
Step 6: Courses Interested In (multi-select)
       - Web Development
       - Mobile Development
       - UI/UX Design
       - Digital Marketing
       - AI & Productivity
       - Graphics Design
       - Video Editing
       - Cybersecurity
Step 7: Training Goals (multi-select)
       - Get a job
       - Start a business
       - Freelance
       - Build websites/apps
       - Make money online
       - Start a tech career
       - Personal development
       - Other
Step 8: Experience Level (buttons: Absolute Beginner, Beginner, Intermediate, Advanced)
Step 9: Previous Skills? (conditional → if Yes, multi-select)
       - HTML/CSS
       - JavaScript/Python
       - UI Design
       - Marketing
       - Graphics
       - Video Production
       - Other
Step 10: Learning Mode (buttons: Online, Offline, Hybrid)
Step 11: Preferred Time (buttons: Morning, Afternoon, Evening, Flexible)
Step 12: Training Plan (buttons: Single Course, Multiple Courses, Full Stack)
Step 13: Additional Goals/Comments (text area)
Step 14: Review & Confirm
```

### 1.2 Form UX Features

- **One question per page** (clean, distraction-free)
- **Progress bar:** "Step X of 14"
- **Navigation buttons:**
  - `← Back` — Go to previous step
  - `Edit` — Modify a completed step
  - `Skip` (where applicable) — For optional fields
  - `Next` — Proceed to next step
  - `Restart` — Clear all and begin over
  - `Confirm & Submit` — Final submission (step 14 only)
- **Session persistence:** Auto-save to localStorage every step
- **Resume capability:** If user leaves, return to last completed step
- **Offline-first:** Works without connection; syncs on reconnect
- **Mobile-optimized:** Touch-friendly buttons, readable on small screens

### 1.3 Submission & Confirmation

After confirmation:

```
Success Screen:
🎉 Registration Successful!

Thank you for registering for the OG WEB 3-Day Webinar.

Your Registration ID: OGW-000124
Confirmation email sent to: john@email.com

📋 Your Registration:
  Name: John Doe
  Courses: Web Development, AI Tools
  Goal: Freelancing
  Experience: Beginner
  Preferred Time: Evening

Next Steps:
1. Check your email for webinar details
2. Join our community group
3. Prepare your learning environment

[← Back to Home] [Download Confirmation]
```

- Confirmation email sent immediately
- Registration ID stored in user profile
- Redirect to dashboard or home

### 1.4 Admin Dashboard - Phase 1

**Minimal viable admin interface:**

| Feature | Details |
|---------|---------|
| **Search** | By name, email, course, city |
| **Filter** | Date range, experience level, status |
| **List view** | Table with 50 registrations per page |
| **Export** | CSV with all fields (Excel-compatible) |
| **Quick view** | Click row to see full details |
| **Bulk actions** | Mark as contacted, archive (5-50 at once) |

**Admin metrics (dashboard overview):**
- Total registrations (today, this week, total)
- Registrations by course
- Registrations by experience level
- Registrations by city (top 10)
- Registration completion rate

### 1.5 Database Schema - Phase 1

```sql
-- Registrations table
CREATE TABLE registrations (
  id TEXT PRIMARY KEY,  -- UUID
  registration_id TEXT UNIQUE NOT NULL,  -- OGW-000001
  
  -- Personal Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  city TEXT,
  age_range TEXT,  -- '18-24', '25-34', etc.
  
  -- Course & Learning Preferences
  courses_interested TEXT NOT NULL,  -- JSON array
  training_goals TEXT NOT NULL,      -- JSON array
  experience_level TEXT NOT NULL,    -- 'absolute-beginner', 'beginner', etc.
  previous_skills TEXT,              -- JSON array or NULL
  learning_mode TEXT NOT NULL,       -- 'online', 'offline', 'hybrid'
  preferred_time TEXT NOT NULL,      -- 'morning', 'afternoon', 'evening'
  training_plan TEXT NOT NULL,       -- 'single', 'multiple', 'full-stack'
  additional_goals TEXT,             -- Free text, nullable
  
  -- Admin & Status
  status TEXT DEFAULT 'registered',  -- 'registered', 'contacted', 'enrolled', 'dropped', 'completed'
  notes TEXT,                        -- Admin notes
  contacted_at TIMESTAMP,
  enrolled_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'web'  -- 'web', 'mobile', 'api'
);

-- Indexes for fast queries
CREATE INDEX idx_email ON registrations(email);
CREATE INDEX idx_city ON registrations(city);
CREATE INDEX idx_experience ON registrations(experience_level);
CREATE INDEX idx_created_at ON registrations(created_at DESC);
CREATE INDEX idx_status ON registrations(status);
CREATE INDEX idx_courses ON registrations(courses_interested);
```

### 1.6 API Endpoints - Phase 1

All endpoints are **server-side tools** (Zod-validated):

```typescript
// Registration Submission
POST /api/registrations/submit
  Input: RegistrationFormData (14 fields)
  Output: { registration_id: 'OGW-000124', email_sent: true }

// Session Recovery (for form resume)
GET /api/registrations/session/:sessionId
  Input: sessionId (from localStorage)
  Output: { step: 5, data: { /* completed form data */ } }

// Email Verification (before submit)
POST /api/registrations/verify-email
  Input: { email: string }
  Output: { exists: false, available: true }

// Admin: List Registrations
GET /api/admin/registrations
  Query: { page: 1, limit: 50, filter: {...}, search: 'john' }
  Output: { total: 1234, data: [...], page: 1 }

// Admin: Export CSV
POST /api/admin/registrations/export
  Input: { filter: {...}, format: 'csv' }
  Output: File stream (CSV)

// Admin: Bulk Update Status
PATCH /api/admin/registrations/bulk
  Input: { ids: [...], status: 'contacted' }
  Output: { updated: 45, failed: 0 }

// Admin: Get Dashboard Metrics
GET /api/admin/metrics
  Output: { total: 1234, by_course: {...}, by_city: {...} }
```

### 1.7 Directory Structure - Phase 1

```
src/
├── pages/
│   └── Registration/
│       ├── Registration.tsx          # Main form shell
│       ├── steps/
│       │   ├── Step1_Name.tsx
│       │   ├── Step2_Contact.tsx
│       │   ├── Step3_Email.tsx
│       │   ├── ...Step14_Review.tsx
│       ├── context/
│       │   └── FormContext.tsx       # State + persistence
│       └── hooks/
│           ├── useFormStep.ts        # Step navigation
│           └── useSessionPersist.ts  # localStorage management
├── components/
│   ├── FormStep/
│   │   ├── StepContainer.tsx         # Layout wrapper
│   │   ├── StepButtons.tsx           # Back, Next, Skip, etc.
│   │   └── ProgressBar.tsx
│   ├── FormInputs/
│   │   ├── TextInput.tsx
│   │   ├── MultiSelect.tsx
│   │   ├── ButtonGroup.tsx
│   │   └── TextArea.tsx
│   └── Confirmation/
│       └── RegistrationReview.tsx
├── db/
│   ├── schema.sql                   # D1 table definitions
│   └── queries.ts                   # Helper functions
├── types/
│   └── registration.ts              # Zod schemas
├── utils/
│   ├── validation.ts                # Field validators
│   └── formState.ts                 # localStorage helpers
└── admin/
    └── RegistrationDashboard.tsx    # Admin UI
```

---

## Phase 2: Course Management

**Timeline:** Week 2-3  
**Deliverables:** Teacher CMS, course catalog, enrollment system

### 2.1 Teacher Course Management

**Features:**
- Create/edit/publish courses
- Upload course materials (PDFs, images, videos via R2)
- Organize lessons into modules
- Set prerequisites and access rules
- Publish on schedule or immediately

### 2.2 Course Catalog

**Student view:**
- Browse all available courses
- Filter by level, duration, instructor
- Course details (description, syllabus, reviews)
- Enroll with one click

### 2.3 Database Additions

```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  level TEXT,  -- 'beginner', 'intermediate', 'advanced'
  instructor_id TEXT NOT NULL,
  category TEXT,
  duration_hours INT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT,
  order INT,
  content TEXT,  -- Markdown
  video_url TEXT,  -- R2 or YouTube
  created_at TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress REAL DEFAULT 0.0,  -- 0-100
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

---

## Phase 3: Learning Hub

**Timeline:** Week 3-4  
**Deliverables:** Video lectures, progress tracking, interactive content

### 3.1 Lecture Delivery

**Features:**
- Stream video lectures (live + recorded)
- Chapter markers (jump to timestamp)
- Auto-play next lesson
- Playback speed controls (0.75x, 1x, 1.5x, 2x)
- Transcript/captions (auto-generated via Cloudflare AI)

### 3.2 Progress Tracking

**Student view:**
- Course progress bar (% complete)
- Lesson completion status
- Time spent tracking
- Last watched timestamp
- Estimated time to completion

### 3.3 Interactive Content

**Features:**
- Embedded polls (show during lecture)
- Polls → live feedback for instructors
- Downloadable materials (PDFs, code files)
- Bookmarks/notes on lessons

### 3.4 Database Additions

```sql
CREATE TABLE lesson_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  watched_seconds INT DEFAULT 0,
  total_seconds INT,
  completed BOOLEAN DEFAULT FALSE,
  last_position INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE polls (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT,  -- JSON array
  created_at TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE poll_responses (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  selected_option TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Phase 4: Assessments & Progress

**Timeline:** Week 4-5  
**Deliverables:** Quiz system, grading, certificates

### 4.1 Quiz & Assessments

**Features:**
- Multiple choice, short answer, essay questions
- Auto-grading for MC
- Timer-based tests (timed exams)
- Instant feedback on completion
- Retake policies (configurable per quiz)
- Question bank (randomize for different students)

### 4.2 Grading & Scoring

**Teacher view:**
- Grade submissions (essays, projects)
- Provide feedback comments
- Bulk export grades

**Student view:**
- View score immediately
- See correct answers (if enabled)
- Download grade report

### 4.3 Certificates

**Features:**
- Auto-generate on course completion
- PDF download
- Shareable link
- Verified certificate (validate on ogreserved.com)

### 4.4 Database Additions

```sql
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  title TEXT,
  passing_score INT DEFAULT 70,
  time_limit_minutes INT,
  show_answers BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_text TEXT,
  question_type TEXT,  -- 'multiple_choice', 'short_answer', 'essay'
  options TEXT,  -- JSON for MC
  correct_answer TEXT,  -- For auto-grade
  points INT DEFAULT 1,
  order INT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE quiz_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  score INT,
  passed BOOLEAN,
  submitted_at TIMESTAMP,
  graded_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_number TEXT UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

---

## Phase 5: Community & Admin

**Timeline:** Week 5-6  
**Deliverables:** Discussion forums, messaging, analytics

### 5.1 Community Features

**Discussion Forums:**
- Per-course Q&A sections
- Thread-based conversations
- Teacher-marked answers
- Reputation system (upvotes)
- Moderation (pin, lock, delete)

**Messaging:**
- Direct messages between students & teachers
- Group announcements from instructors
- Notifications (email + in-app)

### 5.2 Admin Analytics

**Dashboard metrics:**
- Active students (daily, weekly, monthly)
- Course completion rates
- Most-watched lessons
- Average quiz scores
- Student engagement heatmap
- Revenue (if paid courses)

**Reports:**
- Attendance reports
- Grade distribution
- Performance by course
- Learner demographics
- Export to Excel

### 5.3 Admin User Management

**Features:**
- Add/edit/remove teachers
- Manage course access
- View user activity logs
- Suspend/delete accounts
- Bulk email students
- Set access rules per course

### 5.4 Database Additions

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- Only if using email/password
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',  -- 'student', 'teacher', 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE TABLE forum_threads (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE forum_replies (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT,
  is_answer BOOLEAN DEFAULT FALSE,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES forum_threads(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT,  -- 'message', 'grade', 'announcement'
  title TEXT,
  content TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,  -- 'login', 'enroll', 'submit_quiz', etc.
  resource_type TEXT,
  resource_id TEXT,
  created_at TIMESTAMP
);
```

---

## Database Schema (Complete)

All tables created in **Cloudflare D1 SQLite**.

**Key relationships:**
```
users (id) ←→ registrations (no FK, historical)
users (id) ←→ enrollments (user_id)
users (id) ←→ courses (instructor_id)
users (id) ←→ quiz_submissions (user_id)
users (id) ←→ forum_threads (user_id)

courses (id) ←→ enrollments (course_id)
courses (id) ←→ lessons (course_id)
courses (id) ←→ quizzes (via lesson_id)
courses (id) ←→ certificates (course_id)

lessons (id) ←→ lesson_progress (lesson_id)
lessons (id) ←→ polls (lesson_id)
lessons (id) ←→ quizzes (lesson_id)

quizzes (id) ←→ quiz_questions (quiz_id)
quizzes (id) ←→ quiz_submissions (quiz_id)

poll (id) ←→ poll_responses (poll_id)
```

---

## API Reference

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
```

### Registrations (Public)
```
POST   /api/registrations/submit
GET    /api/registrations/verify-email
GET    /api/registrations/session/:sessionId
```

### Courses (Public read, Teacher write)
```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses (teacher)
PATCH  /api/courses/:id (teacher)
GET    /api/courses/:id/enrollments (teacher)
```

### Enrollments
```
POST   /api/enrollments (student)
GET    /api/enrollments (student/teacher)
GET    /api/enrollments/:id/progress
```

### Lessons & Content
```
GET    /api/lessons/:id
POST   /api/lessons/:id/complete
GET    /api/lessons/:id/progress
```

### Quizzes
```
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submit
GET    /api/quizzes/:id/results (student or teacher)
POST   /api/quizzes/:id/grade (teacher)
```

### Community
```
GET    /api/forums/:courseId
POST   /api/forums/:courseId/threads
POST   /api/forums/:threadId/replies
POST   /api/forums/:replyId/upvote
```

### Admin
```
GET    /api/admin/registrations
PATCH  /api/admin/registrations/:id
POST   /api/admin/registrations/export
GET    /api/admin/users
POST   /api/admin/users
PATCH  /api/admin/users/:id
POST   /api/admin/users/:id/suspend
GET    /api/admin/analytics/dashboard
GET    /api/admin/analytics/report
POST   /api/admin/announcements/send
```

---

## Deployment Strategy

### Local Development
```bash
npm install
npm run dev          # Vite + Wrangler dev
# Open http://localhost:5173
```

### Staging
```bash
git push origin feature/branch
# GitHub Actions runs tests, lint, type-check
# On PR approval, deploy to staging.ogweb.workers.dev
```

### Production
```bash
npm run deploy       # Wrangler deploy
# Creates D1 migration if needed
# Deploys Workers + frontend assets
# Live at ogweb.dev
```

### Database Migrations
```bash
# Create migration
wrangler d1 migrations create registrations --local

# Run locally
wrangler d1 execute ogweb --file migrations/001_registrations.sql --local

# Deploy
npm run deploy  # Runs migrations automatically
```

### Environment Variables
```bash
# .dev.vars (local)
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx
DATABASE_URL=file:./db.sqlite

# wrangler.toml (production)
[env.production]
vars = { API_URL = "https://ogweb.dev/api" }
```

---

## Timeline & Milestones

| Phase | Features | Duration | Start Date | Status |
|-------|----------|----------|-----------|--------|
| **1** | Registration, Admin Export | 1 week | Week 1 | 🔴 Not started |
| **2** | Course Management, Catalog | 2 weeks | Week 2 | ⏳ Planned |
| **3** | Learning Hub, Video, Polls | 2 weeks | Week 4 | ⏳ Planned |
| **4** | Quizzes, Grading, Certificates | 1 week | Week 6 | ⏳ Planned |
| **5** | Forums, Analytics, User Mgmt | 1 week | Week 7 | ⏳ Planned |
| **Mobile** | React Native apps (iOS/Android) | 2 weeks | Week 8 | ⏳ Planned |

**Total:** 8 weeks to full platform (web MVP by week 5)

---

## Success Criteria

✅ **Phase 1 (Registration):**
- 100+ registrations captured on day 1
- Form loads in <2s on 4G
- CSV export works for all fields
- Admin can filter by course/city/experience

✅ **Phase 2-5:**
- 80%+ student enrollment rate
- <1s lesson load time
- 95%+ uptime
- <100ms API response times

✅ **Mobile:**
- App available on iOS App Store & Google Play
- 4.5+ star ratings
- Offline mode working

---

## Key Decisions Made

1. **No WhatsApp:** All interactions within the app (in-app messaging)
2. **Cloudflare-first:** No external services; keep everything in the ecosystem
3. **D1 SQLite:** Simpler than PostgreSQL, perfect for this scale
4. **React for web, React Native for mobile:** Shared component logic
5. **Email/password auth:** Simple for students; OAuth can be added later
6. **Progressive phases:** Get registration + admin working first, then build learning features
7. **Offline-first form:** Students can fill registration without network

---

## Next Steps

1. ✅ Review & approve this architecture
2. ⏳ Create GitHub issues for Phase 1 (Form UI, DB Schema, Admin Dashboard)
3. ⏳ Set up GitHub Projects board for task tracking
4. ⏳ Initialize D1 database with schema
5. ⏳ Start building Phase 1 components

---

**Document Status:** Final (Ready for Development)  
**Approved By:** [Pending]  
**Last Review:** 2026-09-29
