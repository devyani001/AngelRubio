// ============================================================
// routes/auth.js   — Register · Login · Me
// ============================================================
const express     = require('express');
const router      = express.Router();
const bcrypt      = require('bcryptjs');
const { v4: uuid }= require('uuid');
const { getDb }   = require('../db');
const { signToken, verifyToken } = require('../middleware/auth');

/* POST /api/auth/register */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'freelancer', full_name } = req.body;
    if (!email || !password || !full_name)
      return res.status(400).json({ error: 'email, password, full_name required' });

    const db   = getDb();
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hash    = await bcrypt.hash(password, 10);
    const id      = uuid();
    const initials = full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

    db.prepare(`INSERT INTO users (id, email, password_hash, role, full_name, avatar_initials)
                VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, email, hash, role, full_name, initials);

    // Auto-create freelancer profile if role = freelancer
    if (role === 'freelancer') {
      db.prepare(`INSERT INTO freelancer_profiles (id, user_id) VALUES (?, ?)`)
        .run('fp_' + id.slice(0, 8), id);
    }

    const token = signToken({ id, email, role });
    res.status(201).json({ token, user: { id, email, role, full_name, avatar_initials: initials } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db   = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)  return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, avatar_initials: user.avatar_initials } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* GET /api/auth/me */
router.get('/me', verifyToken, (req, res) => {
  const db   = getDb();
  const user = db.prepare('SELECT id, email, role, full_name, avatar_initials FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = router;


// ============================================================
// routes/profiles.js  — Freelancer profile & skills CRUD
// ============================================================
const profilesRouter = express.Router();

/* GET /api/profiles/:freelancerId */
profilesRouter.get('/:freelancerId', (req, res) => {
  const db      = getDb();
  const profile = db.prepare('SELECT fp.*, u.full_name, u.avatar_initials FROM freelancer_profiles fp JOIN users u ON fp.user_id = u.id WHERE fp.id = ?').get(req.params.freelancerId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const skills  = db.prepare('SELECT skill_name, proficiency FROM freelancer_skills WHERE freelancer_id = ?').all(profile.id);
  const reviews = db.prepare(`SELECT r.*, u.full_name as reviewer_name
                              FROM reviews r JOIN users u ON r.reviewer_id = u.id
                              WHERE r.reviewee_id = ? ORDER BY r.created_at DESC LIMIT 10`).all(profile.user_id);

  res.json({ profile, skills, reviews });
});

/* PUT /api/profiles/me  — update own profile (needs auth) */
profilesRouter.put('/me', verifyToken, (req, res) => {
  const db      = getDb();
  const profile = db.prepare('SELECT * FROM freelancer_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'No freelancer profile' });

  const { bio, availability, hourly_rate, location, portfolio_url } = req.body;
  db.prepare(`UPDATE freelancer_profiles
              SET bio = COALESCE(?, bio),
                  availability = COALESCE(?, availability),
                  hourly_rate  = COALESCE(?, hourly_rate),
                  location     = COALESCE(?, location),
                  portfolio_url= COALESCE(?, portfolio_url),
                  updated_at   = datetime('now')
              WHERE id = ?`)
    .run(bio, availability, hourly_rate, location, portfolio_url, profile.id);

  res.json({ message: 'Profile updated' });
});

/* POST /api/profiles/me/skills — add skill */
profilesRouter.post('/me/skills', verifyToken, (req, res) => {
  const db      = getDb();
  const profile = db.prepare('SELECT id FROM freelancer_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'No freelancer profile' });

  const { skill_name, proficiency = 'Intermediate' } = req.body;
  if (!skill_name) return res.status(400).json({ error: 'skill_name required' });

  try {
    db.prepare('INSERT INTO freelancer_skills (id, freelancer_id, skill_name, proficiency) VALUES (?, ?, ?, ?)')
      .run(uuid(), profile.id, skill_name, proficiency);
    res.status(201).json({ message: 'Skill added' });
  } catch (e) {
    res.status(409).json({ error: 'Skill already exists' });
  }
});

/* DELETE /api/profiles/me/skills/:skillName */
profilesRouter.delete('/me/skills/:skillName', verifyToken, (req, res) => {
  const db      = getDb();
  const profile = db.prepare('SELECT id FROM freelancer_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'No freelancer profile' });

  db.prepare('DELETE FROM freelancer_skills WHERE freelancer_id = ? AND skill_name = ?')
    .run(profile.id, req.params.skillName);
  res.json({ message: 'Skill removed' });
});

module.exports.profilesRouter = profilesRouter;


// ============================================================
// routes/gigs.js — Gig CRUD + search + match
// ============================================================
const gigsRouter = express.Router();
const { matchGigsForFreelancer } = require('../services/matchingEngine');

/* GET /api/gigs — list (with optional filters) */
gigsRouter.get('/', (req, res) => {
  const db         = getDb();
  const { category, search, sort = 'created_at', order = 'DESC', status = 'open' } = req.query;

  let sql    = 'SELECT * FROM gigs WHERE status = ?';
  const params = [status];

  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY ${['created_at','budget_max','deadline_days'].includes(sort) ? sort : 'created_at'} ${order === 'ASC' ? 'ASC' : 'DESC'}`;

  const gigs = db.prepare(sql).all(...params);

  // Enrich each gig with tags + tiers + app count
  const enriched = gigs.map(g => {
    const tags      = db.prepare('SELECT tag FROM gig_tags WHERE gig_id = ?').all(g.id).map(r => r.tag);
    const tiers     = db.prepare('SELECT tier, price, days, desc FROM gig_tiers WHERE gig_id = ?').all(g.id);
    const appCount  = db.prepare('SELECT COUNT(*) as cnt FROM applications WHERE gig_id = ?').get(g.id).cnt;
    const reviews   = db.prepare(`SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews r
                                  JOIN applications a ON r.application_id = a.id WHERE a.gig_id = ?`).get(g.id);
    return {
      ...g,
      tags, tiers,
      totalApplications: appCount,
      avgRating: reviews.avg ? parseFloat(reviews.avg.toFixed(1)) : 4.5,
      reviewCount: reviews.cnt
    };
  });

  res.json({ gigs: enriched });
});

/* GET /api/gigs/:gigId */
gigsRouter.get('/:gigId', (req, res) => {
  const db  = getDb();
  const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(req.params.gigId);
  if (!gig) return res.status(404).json({ error: 'Gig not found' });

  const tags  = db.prepare('SELECT tag FROM gig_tags WHERE gig_id = ?').all(gig.id).map(r => r.tag);
  const tiers = db.prepare('SELECT tier, price, days, desc FROM gig_tiers WHERE gig_id = ?').all(gig.id);
  const client = db.prepare('SELECT full_name, avatar_initials FROM users WHERE id = ?').get(gig.client_id);
  const appCount = db.prepare('SELECT COUNT(*) as cnt FROM applications WHERE gig_id = ?').get(gig.id).cnt;

  res.json({ gig: { ...gig, tags, tiers, client, totalApplications: appCount } });
});

/* POST /api/gigs — create (client only) */
gigsRouter.post('/', verifyToken, (req, res) => {
  if (req.user.role !== 'client')
    return res.status(403).json({ error: 'Only clients can post gigs' });

  const db = getDb();
  const { title, description, category, budget_min, budget_max, deadline_days, tags = [], tiers = {} } = req.body;

  if (!title || !description || !category)
    return res.status(400).json({ error: 'title, description, category required' });

  const id = 'gig_' + uuid().slice(0, 8);
  db.prepare(`INSERT INTO gigs (id, client_id, title, description, category, budget_min, budget_max, deadline_days)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.user.id, title, description, category, budget_min || 0, budget_max || 0, deadline_days || 14);

  // Insert tags
  tags.forEach(tag => {
    db.prepare('INSERT INTO gig_tags (id, gig_id, tag) VALUES (?, ?, ?)').run(uuid(), id, tag);
  });

  // Insert tiers
  ['basic','standard','premium'].forEach(tier => {
    if (tiers[tier]) {
      db.prepare('INSERT INTO gig_tiers (id, gig_id, tier, price, days, desc) VALUES (?, ?, ?, ?, ?, ?)')
        .run(uuid(), id, tier, tiers[tier].price, tiers[tier].days, tiers[tier].desc);
    }
  });

  res.status(201).json({ message: 'Gig created', gigId: id });
});

/* PUT /api/gigs/:gigId — update status (client only) */
gigsRouter.put('/:gigId', verifyToken, (req, res) => {
  const db  = getDb();
  const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(req.params.gigId);
  if (!gig) return res.status(404).json({ error: 'Gig not found' });
  if (gig.client_id !== req.user.id)
    return res.status(403).json({ error: 'Not your gig' });

  const { status } = req.body;
  db.prepare("UPDATE gigs SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, gig.id);
  res.json({ message: 'Gig updated' });
});

/* GET /api/gigs/match — AI matching (freelancer only, needs auth) */
gigsRouter.get('/match', verifyToken, (req, res) => {
  if (req.user.role !== 'freelancer')
    return res.status(403).json({ error: 'Only freelancers can use matching' });

  const db      = getDb();
  const profile = db.prepare('SELECT id FROM freelancer_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Freelancer profile not found' });

  try {
    const matches = matchGigsForFreelancer(profile.id);
    res.json({ matches });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Matching failed' });
  }
});

module.exports = gigsRouter;


// ============================================================
// routes/applications.js — Apply · Status · My Applications
// ============================================================
const appsRouter = express.Router();

/* POST /api/applications — submit application */
appsRouter.post('/', verifyToken, (req, res) => {
  if (req.user.role !== 'freelancer')
    return res.status(403).json({ error: 'Only freelancers can apply' });

  const db      = getDb();
  const profile = db.prepare('SELECT id FROM freelancer_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const { gig_id, tier_chosen = 'basic', cover_letter } = req.body;
  if (!gig_id) return res.status(400).json({ error: 'gig_id required' });

  // Check duplicate
  const exists = db.prepare('SELECT id FROM applications WHERE gig_id = ? AND freelancer_id = ?').get(gig_id, profile.id);
  if (exists) return res.status(409).json({ error: 'Already applied to this gig' });

  // Compute match score
  const { computeMatchScore } = require('../services/matchingEngine');
  const matchScore = computeMatchScore(profile.id, gig_id);

  const id = 'app_' + uuid().slice(0, 8);
  db.prepare(`INSERT INTO applications (id, gig_id, freelancer_id, tier_chosen, cover_letter, match_score)
              VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, gig_id, profile.id, tier_chosen, cover_letter || null, matchScore);

  // Bump total_applied
  db.prepare('UPDATE freelancer_profiles SET total_applied = total_applied + 1 WHERE id = ?').run(profile.id);

  res.status(201).json({ message: 'Application submitted', applicationId: id, matchScore });
});

/* GET /api/applications/mine — my applications */
appsRouter.get('/mine', verifyToken, (req, res) => {
  const db      = getDb();
  const profile = db.prepare('SELECT id FROM freelancer_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const apps = db.prepare(`SELECT a.*, g.title as gig_title, g.category
                           FROM applications a JOIN gigs g ON a.gig_id = g.id
                           WHERE a.freelancer_id = ? ORDER BY a.created_at DESC`).all(profile.id);
  res.json({ applications: apps });
});

/* GET /api/applications/gig/:gigId — applications for a gig (client) */
appsRouter.get('/gig/:gigId', verifyToken, (req, res) => {
  const db  = getDb();
  const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(req.params.gigId);
  if (!gig) return res.status(404).json({ error: 'Gig not found' });
  if (gig.client_id !== req.user.id)
    return res.status(403).json({ error: 'Not your gig' });

  const apps = db.prepare(`SELECT a.*, fp.id as fp_id, u.full_name, u.avatar_initials
                           FROM applications a
                           JOIN freelancer_profiles fp ON a.freelancer_id = fp.id
                           JOIN users u ON fp.user_id = u.id
                           WHERE a.gig_id = ? ORDER BY a.match_score DESC`).all(req.params.gigId);
  res.json({ applications: apps });
});

/* PUT /api/applications/:appId — update status (client) */
appsRouter.put('/:appId', verifyToken, (req, res) => {
  const db  = getDb();
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.appId);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  const gig = db.prepare('SELECT * FROM gigs WHERE id = ?').get(app.gig_id);
  if (gig.client_id !== req.user.id)
    return res.status(403).json({ error: 'Not your gig' });

  const { status } = req.body;
  db.prepare("UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, app.id);

  // If completed → bump success_count
  if (status === 'completed') {
    db.prepare('UPDATE freelancer_profiles SET success_count = success_count + 1 WHERE id = ?').run(app.freelancer_id);
  }

  res.json({ message: 'Application updated', status });
});

module.exports = appsRouter;


// ============================================================
// routes/messages.js — Chat within an application
// ============================================================
const msgRouter = express.Router();

/* POST /api/messages */
msgRouter.post('/', verifyToken, (req, res) => {
  const db          = getDb();
  const { app_id, body } = req.body;
  if (!app_id || !body) return res.status(400).json({ error: 'app_id and body required' });

  const id = 'msg_' + uuid().slice(0, 8);
  db.prepare('INSERT INTO messages (id, app_id, sender_id, body) VALUES (?, ?, ?, ?)')
    .run(id, app_id, req.user.id, body);

  res.status(201).json({ message: { id, app_id, sender_id: req.user.id, body, created_at: new Date().toISOString() } });
});

/* GET /api/messages/:appId */
msgRouter.get('/:appId', verifyToken, (req, res) => {
  const db   = getDb();
  const msgs = db.prepare(`SELECT m.*, u.full_name, u.avatar_initials
                           FROM messages m JOIN users u ON m.sender_id = u.id
                           WHERE m.app_id = ? ORDER BY m.created_at ASC`).all(req.params.appId);

  // Mark as read
  db.prepare('UPDATE messages SET read = 1 WHERE app_id = ? AND sender_id != ?').run(req.params.appId, req.user.id);

  res.json({ messages: msgs });
});

module.exports = msgRouter;


// ============================================================
// routes/reviews.js — Leave & list reviews
// ============================================================
const reviewsRouter = express.Router();

/* POST /api/reviews */
reviewsRouter.post('/', verifyToken, (req, res) => {
  const db = getDb();
  const { application_id, reviewee_id, rating, comment } = req.body;
  if (!application_id || !reviewee_id || !rating)
    return res.status(400).json({ error: 'application_id, reviewee_id, rating required' });

  const id = 'rev_' + uuid().slice(0, 8);
  try {
    db.prepare('INSERT INTO reviews (id, application_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, application_id, req.user.id, reviewee_id, rating, comment || null);
    res.status(201).json({ message: 'Review submitted', reviewId: id });
  } catch (e) {
    res.status(409).json({ error: 'Already reviewed this application' });
  }
});

/* GET /api/reviews/user/:userId */
reviewsRouter.get('/user/:userId', (req, res) => {
  const db      = getDb();
  const reviews = db.prepare(`SELECT r.*, u.full_name as reviewer_name, u.avatar_initials
                              FROM reviews r JOIN users u ON r.reviewer_id = u.id
                              WHERE r.reviewee_id = ? ORDER BY r.created_at DESC`).all(req.params.userId);

  const avg = reviews.length
    ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  res.json({ reviews, avgRating: avg, totalReviews: reviews.length });
});

module.exports = reviewsRouter;


// ============================================================
// routes/saved.js — Save / unsave gigs
// ============================================================
const savedRouter = express.Router();

/* POST /api/saved */
savedRouter.post('/', verifyToken, (req, res) => {
  const db        = getDb();
  const { gig_id } = req.body;
  if (!gig_id) return res.status(400).json({ error: 'gig_id required' });

  try {
    db.prepare('INSERT INTO saved_gigs (id, user_id, gig_id) VALUES (?, ?, ?)').run(uuid(), req.user.id, gig_id);
    res.status(201).json({ message: 'Gig saved' });
  } catch (e) {
    res.status(409).json({ error: 'Already saved' });
  }
});

/* DELETE /api/saved/:gigId */
savedRouter.delete('/:gigId', verifyToken, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM saved_gigs WHERE user_id = ? AND gig_id = ?').run(req.user.id, req.params.gigId);
  res.json({ message: 'Gig unsaved' });
});

/* GET /api/saved */
savedRouter.get('/', verifyToken, (req, res) => {
  const db    = getDb();
  const saved = db.prepare(`SELECT g.* FROM saved_gigs sg JOIN gigs g ON sg.gig_id = g.id WHERE sg.user_id = ?`).all(req.user.id);

  const enriched = saved.map(g => {
    const tags  = db.prepare('SELECT tag FROM gig_tags WHERE gig_id = ?').all(g.id).map(r => r.tag);
    const tiers = db.prepare('SELECT tier, price, days, desc FROM gig_tiers WHERE gig_id = ?').all(g.id);
    return { ...g, tags, tiers };
  });

  res.json({ savedGigs: enriched });
});

module.exports = savedRouter;
