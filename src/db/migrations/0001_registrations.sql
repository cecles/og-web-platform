-- Initial OG WEB registration schema
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  registration_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  city TEXT,
  age_range TEXT,
  courses_interested TEXT NOT NULL,
  training_goals TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  previous_skills TEXT,
  learning_mode TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  training_plan TEXT NOT NULL,
  additional_goals TEXT,
  status TEXT NOT NULL DEFAULT 'registered',
  notes TEXT,
  contacted_at TEXT,
  enrolled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  source TEXT NOT NULL DEFAULT 'web'
);

CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_city ON registrations(city);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
