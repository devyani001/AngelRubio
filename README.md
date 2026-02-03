# 🌉 TalentBridge — Freelance Gig Matching Platform

A full-stack freelance gig matching platform with AI-powered matching, real-time messaging, reviews, and a premium dark-mode UI.

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────────┐
│                  FRONTEND (React)                     │
│  Auth · Browse · AI Match · Apply · Chat · Profile   │
└────────────────────┬─────────────────────────────────┘
                     │  REST (JSON)
┌────────────────────▼─────────────────────────────────┐
│              EXPRESS API  (server.js)                 │
│                                                      │
│  Routes          │  Middleware       │  Services     │
│  ─────────────   │  ─────────────    │  ───────────  │
│  /auth           │  JWT verify       │  Matching     │
│  /profiles       │  Role guard       │    Engine     │
│  /gigs           │  CORS             │               │
│  /applications   │  JSON body        │               │
│  /messages       │                   │               │
│  /reviews        │                   │               │
│  /saved          │                   │               │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│              SQLite  (better-sqlite3)                 │
│                                                      │
│  users · freelancer_profiles · freelancer_skills     │
│  gigs · gig_tags · gig_tiers                        │
│  applications · messages · reviews · saved_gigs     │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the API server
```bash
npm start          # production
npm run dev        # with auto-reload (nodemon)
```
Server starts on **http://localhost:5000**. The SQLite DB (`talentbridge.db`) is created and seeded automatically on first run.

### 3. Frontend
Copy `frontend/TalentBridge.jsx` into your React project (Vite / CRA / Next). It ships with a **full in-memory backend mirror** so it works stand-alone as an artifact out of the box. To hit the real API, replace the simulated DB calls with `fetch()` calls to `http://localhost:5000/api/*`.

---

## 🗄️ Database Tables

| Table                  | Purpose                                         |
|------------------------|-------------------------------------------------|
| `users`                | Auth — email, bcrypt hash, role, name           |
| `freelancer_profiles`  | Bio, availability, hourly rate, stats           |
| `freelancer_skills`    | Skill name + proficiency per freelancer         |
| `gigs`                 | Job postings (client-owned)                     |
| `gig_tags`             | Required skills / tags per gig                  |
| `gig_tiers`            | Basic / Standard / Premium pricing              |
| `applications`         | Freelancer → Gig applications + status          |
| `messages`             | In-app chat scoped to an application            |
| `reviews`              | Post-completion ratings & comments              |
| `saved_gigs`           | Bookmarked gigs per user                        |

---

## 🧠 Matching Engine (`services/matchingEngine.js`)

Scores every open gig for a given freelancer using three signals:

| Signal         | Weight | How it works                                                |
|----------------|--------|-------------------------------------------------------------|
| Skill Match    | 55 %   | Jaccard overlap: freelancer skills ∩ gig tags               |
| Availability   | 25 %   | Proximity of freelancer start date vs gig deadline bucket   |
| Demand         | 20 %   | Number of existing applications (popularity proxy)          |

The **success rate** shown on each card is a blend of historical completion data and the match score.

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Body / Params                        | Notes                    |
|--------|---------------------|--------------------------------------|--------------------------|
| POST   | `/api/auth/register`| `{ email, password, full_name, role }`| Returns JWT token        |
| POST   | `/api/auth/login`   | `{ email, password }`                | Returns JWT token        |
| GET    | `/api/auth/me`      | —                                    | Needs `Bearer` token     |

### Profiles
| Method | Endpoint                    | Notes                                       |
|--------|-----------------------------|---------------------------------------------|
| GET    | `/api/profiles/:id`         | Public profile + skills + reviews           |
| PUT    | `/api/profiles/me`          | Update own profile (auth)                   |
| POST   | `/api/profiles/me/skills`   | Add skill `{ skill_name, proficiency }`     |
| DELETE | `/api/profiles/me/skills/:name` | Remove a skill                          |

### Gigs
| Method | Endpoint              | Notes                                                 |
|--------|-----------------------|-------------------------------------------------------|
| GET    | `/api/gigs`           | List open gigs. Query: `category`, `search`, `sort`   |
| GET    | `/api/gigs/:id`       | Single gig detail                                     |
| POST   | `/api/gigs`           | Create gig (client only)                              |
| PUT    | `/api/gigs/:id`       | Update status (client only)                           |
| GET    | `/api/gigs/match`     | AI-matched gigs for logged-in freelancer              |

### Applications
| Method | Endpoint                      | Notes                                        |
|--------|-------------------------------|----------------------------------------------|
| POST   | `/api/applications`           | Submit application `{ gig_id, tier, letter }`|
| GET    | `/api/applications/mine`      | My applications (freelancer)                 |
| GET    | `/api/applications/gig/:id`   | All apps for a gig (client)                  |
| PUT    | `/api/applications/:id`       | Update status (client)                       |

### Messages
| Method | Endpoint                | Notes                               |
|--------|-------------------------|-------------------------------------|
| POST   | `/api/messages`         | Send `{ app_id, body }`             |
| GET    | `/api/messages/:appId`  | Fetch thread (auto-marks read)      |

### Reviews
| Method | Endpoint                   | Notes                                       |
|--------|----------------------------|---------------------------------------------|
| POST   | `/api/reviews`             | `{ application_id, reviewee_id, rating }`   |
| GET    | `/api/reviews/user/:id`    | All reviews for a user                      |

### Saved Gigs
| Method | Endpoint          | Notes                         |
|--------|-------------------|-------------------------------|
| POST   | `/api/saved`      | `{ gig_id }`                  |
| DELETE | `/api/saved/:id`  | Unsave                        |
| GET    | `/api/saved`      | My saved gigs                 |

---

## ⚙️ Environment Variables

| Variable          | Default                  | Description                      |
|-------------------|--------------------------|----------------------------------|
| `PORT`            | `5000`                   | API server port                  |
| `JWT_SECRET`      | `tb_dev_secret_…`        | JWT signing secret (change!)     |
| `FRONTEND_ORIGIN` | `*`                      | CORS allowed origin              |

---

## 📁 File Structure

```
talentbridge/
├── db/
│   ├── index.js          # DB init + schema + seed runner
│   ├── schema.sql        # Full SQLite schema
│   └── seed.sql          # Demo data (idempotent)
├── middleware/
│   └── auth.js           # JWT sign / verify / role guard
├── routes/
│   └── index.js          # All route handlers (auth, profiles, gigs, apps, msgs, reviews, saved)
├── services/
│   └── matchingEngine.js # AI scoring algorithm
├── frontend/
│   └── TalentBridge.jsx  # Full React app (standalone artifact)
├── server.js             # Express entry point
├── package.json
└── README.md             # This file
```

---

## ✨ Features

- **🔐 Auth** — Register / Login with JWT. Role-based access (freelancer vs client).
- **🧠 AI Matching** — Skill-overlap + availability + demand scoring with visual breakdowns.
- **💼 Gig CRUD** — Clients create gigs with tags & 3-tier pricing. Freelancers browse & apply.
- **📨 Messaging** — Real-time chat scoped to each application.
- **⭐ Reviews** — Post-completion reviews with aggregated ratings.
- **🔖 Saved Gigs** — Bookmark & revisit favourites.
- **👤 Profile Editor** — Skills management, availability, hourly rate, live stats.
- **🎨 Premium UI** — Dark glassmorphism, animated orbs, shimmer headlines, staggered animations.
