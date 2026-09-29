-- Registrations table for OG WEB 3-Day Webinar
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  registration_id TEXT UNIQUE NOT NULL,
  
  -- Personal Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  city TEXT,
  age_range TEXT,
  
  -- Course & Learning Preferences
  courses_interested TEXT NOT NULL,
  training_goals TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  previous_skills TEXT,
  learning_mode TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  training_plan TEXT NOT NULL,
  additional_goals TEXT,
  
  -- Admin & Status
  status TEXT DEFAULT 'registered',
  notes TEXT,
  contacted_at TIMESTAMP,
  enrolled_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'web'
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_city ON registrations(city);
CREATE INDEX IF NOT EXISTS idx_experience ON registrations(experience_level);
CREATE INDEX IF NOT EXISTS idx_created_at ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status ON registrations(status);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activities (
  id TEXT PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_id TEXT,
  resource_type TEXT,
  changes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_activities_created ON admin_activities(created_at DESC);
