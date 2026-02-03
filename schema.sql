-- ============================================================
-- TalentBridge — Database Schema (SQLite)
-- ============================================================

PRAGMA foreign_keys = ON;

-- ── Users (auth) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('freelancer','client','admin')) DEFAULT 'freelancer',
  full_name     TEXT NOT NULL,
  avatar_initials TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- ── Freelancer Profiles ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio           TEXT,
  availability  TEXT CHECK (availability IN ('This Week','Next Week','Next 2 Weeks','Next Month')) DEFAULT 'Next Week',
  hourly_rate   REAL DEFAULT 0,
  location      TEXT,
  portfolio_url TEXT,
  success_count INTEGER DEFAULT 0,
  total_applied INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- ── Freelancer Skills (many-to-many via junction) ───────────
CREATE TABLE IF NOT EXISTS freelancer_skills (
  id            TEXT PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES freelancer_profiles(id) ON DELETE CASCADE,
  skill_name    TEXT NOT NULL,
  proficiency   TEXT CHECK (proficiency IN ('Beginner','Intermediate','Expert')) DEFAULT 'Intermediate',
  UNIQUE(freelancer_id, skill_name)
);

-- ── Gig Postings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gigs (
  id            TEXT PRIMARY KEY,
  client_id     TEXT NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  budget_min    REAL NOT NULL,
  budget_max    REAL NOT NULL,
  deadline_days INTEGER NOT NULL,
  status        TEXT CHECK (status IN ('open','in_progress','completed','cancelled')) DEFAULT 'open',
  badge         TEXT CHECK (badge IN ('Top Rated','Pro','Best Seller','New')) DEFAULT 'New',
  gradient      TEXT DEFAULT '135deg, #8b5cf6 0%, #6366f1 100%',
  glow          TEXT DEFAULT 'rgba(139,92,246,0.45)',
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- ── Gig Tags / Required Skills ──────────────────────────────
CREATE TABLE IF NOT EXISTS gig_tags (
  id     TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  tag    TEXT NOT NULL,
  UNIQUE(gig_id, tag)
);

-- ── Gig Pricing Tiers ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS gig_tiers (
  id     TEXT PRIMARY KEY,
  gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  tier   TEXT NOT NULL CHECK (tier IN ('basic','standard','premium')),
  price  REAL NOT NULL,
  days   INTEGER NOT NULL,
  desc   TEXT NOT NULL,
  UNIQUE(gig_id, tier)
);

-- ── Applications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            TEXT PRIMARY KEY,
  gig_id        TEXT NOT NULL REFERENCES gigs(id),
  freelancer_id TEXT NOT NULL REFERENCES freelancer_profiles(id),
  tier_chosen   TEXT NOT NULL CHECK (tier_chosen IN ('basic','standard','premium')),
  cover_letter  TEXT,
  status        TEXT CHECK (status IN ('pending','accepted','rejected','completed')) DEFAULT 'pending',
  match_score   INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(gig_id, freelancer_id)
);

-- ── Messages (gig-scoped chat) ──────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id        TEXT PRIMARY KEY,
  app_id    TEXT NOT NULL REFERENCES applications(id),
  sender_id TEXT NOT NULL REFERENCES users(id),
  body      TEXT NOT NULL,
  read      INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Reviews ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id),
  reviewer_id   TEXT NOT NULL REFERENCES users(id),
  reviewee_id   TEXT NOT NULL REFERENCES users(id),
  rating        REAL NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(application_id, reviewer_id)
);

-- ── Saved / Bookmarked Gigs ─────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_gigs (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  gig_id        TEXT NOT NULL REFERENCES gigs(id),
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, gig_id)
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gigs_category    ON gigs(category);
CREATE INDEX IF NOT EXISTS idx_gigs_status      ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gig_tags_tag     ON gig_tags(tag);
CREATE INDEX IF NOT EXISTS idx_apps_gig         ON applications(gig_id);
CREATE INDEX IF NOT EXISTS idx_apps_freelancer  ON applications(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_messages_app     ON messages(app_id);
CREATE INDEX IF NOT EXISTS idx_saved_user       ON saved_gigs(user_id);
