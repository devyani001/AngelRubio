// server.js  — TalentBridge API
const express = require('express');
const cors    = require('cors');
const app     = express();

// ── initialise DB (creates + seeds on first run) ──────────
require('./db');                // side-effect: getDb() called on import

// ── middleware ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// ── routes ─────────────────────────────────────────────────
const authRoutes    = require('./routes/index');           // auth router (default export)
const { profilesRouter } = require('./routes/index');
const gigsRouter    = require('./routes/index');           // see note below
const appsRouter    = require('./routes/index');
const msgRouter     = require('./routes/index');
const reviewsRouter = require('./routes/index');
const savedRouter   = require('./routes/index');

/*
 * NOTE: In the single routes/index.js file each router is exported
 * individually.  When you split into separate files, adjust these
 * require paths accordingly.  For the bundled single-file version
 * the imports are wired in the block below.
 */

// ── actual mount (using the combined exports from routes/index.js) ──
// Because all routers live in one file we re-require and destructure:
const routes = require('./routes/index');

app.use('/api/auth',         routes);                          // auth is the default export
app.use('/api/profiles',     routes.profilesRouter);
app.use('/api/gigs',         routes);                          // gigsRouter is default for gigs
app.use('/api/applications', routes);                          // appsRouter
app.use('/api/messages',     routes);                          // msgRouter
app.use('/api/reviews',      routes);                          // reviewsRouter
app.use('/api/saved',        routes);                          // savedRouter

// ── health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 catch-all ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌉 TalentBridge API running on http://localhost:${PORT}\n`);
});

module.exports = app;
