// services/matchingEngine.js
// ─────────────────────────────────────────────────────────────
// TalentBridge AI Matching Engine
//
// Weights:
//   Skill Match   55%   — Jaccard-style overlap freelancer skills ∩ gig tags
//   Availability  25%   — Proximity of freelancer start vs gig deadline
//   Demand        20%   — Popularity signal (total applications on the gig)
//
// Returns a sorted array of { gig, score, breakdown }
// ─────────────────────────────────────────────────────────────

const { getDb } = require('../db');

/* ── helpers ──────────────────────────────────────────────── */
const AVAIL_SCORE = {
  'This Week':      100,
  'Next Week':      80,
  'Next 2 Weeks':   60,
  'Next Month':     40,
};

function deadlineBucket(deadlineDays) {
  if (deadlineDays <= 7)  return 'This Week';
  if (deadlineDays <= 14) return 'Next Week';
  if (deadlineDays <= 21) return 'Next 2 Weeks';
  return 'Next Month';
}

/* ── core scorer ──────────────────────────────────────────── */
function scoreGig(freelancerSkills, freelancerAvailability, gig, gigTags, appCount) {
  // 1. Skill match (Jaccard-ish: intersection / union capped at gig tags)
  const freelancerSet = new Set(freelancerSkills.map(s => s.toLowerCase()));
  const gigTagSet     = new Set(gigTags.map(t => t.toLowerCase()));
  const intersection  = [...gigTagSet].filter(t => freelancerSet.has(t)).length;
  const skillMatch    = gigTagSet.size > 0 ? Math.round((intersection / gigTagSet.size) * 100) : 0;

  // 2. Availability alignment
  const freelancerVal = AVAIL_SCORE[freelancerAvailability] || 50;
  const idealBucket   = deadlineBucket(gig.deadline_days);
  const idealVal      = AVAIL_SCORE[idealBucket] || 50;
  const availability  = Math.max(0, 100 - Math.abs(freelancerVal - idealVal) * 0.8);

  // 3. Demand (more applications = more validated demand, slight boost)
  const demand = Math.min(100, 30 + appCount * 3.5);

  // Weighted composite
  const score = Math.min(100, Math.round(
    skillMatch   * 0.55 +
    availability * 0.25 +
    demand       * 0.20
  ));

  return {
    score,
    breakdown: {
      skillMatch:   Math.round(skillMatch),
      availability: Math.round(availability),
      demand:       Math.round(demand),
    }
  };
}

/* ── public API ───────────────────────────────────────────── */
/**
 * matchGigsForFreelancer(freelancerId)
 *   → [{ gig, tags, tiers, score, breakdown, successRate, totalApplications }, …]
 *     sorted descending by score
 */
function matchGigsForFreelancer(freelancerId) {
  const db = getDb();

  // Load freelancer profile + skills
  const profile = db.prepare('SELECT * FROM freelancer_profiles WHERE id = ?').get(freelancerId);
  if (!profile) throw new Error('Freelancer profile not found');

  const skills = db.prepare('SELECT skill_name FROM freelancer_skills WHERE freelancer_id = ?')
    .all(freelancerId)
    .map(r => r.skill_name);

  // Load all open gigs
  const gigs = db.prepare("SELECT * FROM gigs WHERE status = 'open'").all();

  const results = gigs.map(gig => {
    const tags  = db.prepare('SELECT tag FROM gig_tags WHERE gig_id = ?').all(gig.id).map(r => r.tag);
    const tiers = db.prepare('SELECT tier, price, days, desc FROM gig_tiers WHERE gig_id = ?').all(gig.id);
    const appCount = db.prepare('SELECT COUNT(*) as cnt FROM applications WHERE gig_id = ?').get(gig.id).cnt;

    const { score, breakdown } = scoreGig(skills, profile.availability, gig, tags, appCount);

    // Pseudo success-rate based on historical completions for this gig
    const completed = db.prepare("SELECT COUNT(*) as cnt FROM applications WHERE gig_id = ? AND status = 'completed'").get(gig.id).cnt;
    const total     = appCount || 1;
    // Blend with a base estimate so even new gigs look reasonable
    const successRate = Math.round((completed / total) * 40 + score * 0.6);

    return { gig, tags, tiers, score, breakdown, successRate, totalApplications: appCount };
  });

  // Sort descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * computeMatchScore(freelancerId, gigId) — single-gig quick score
 */
function computeMatchScore(freelancerId, gigId) {
  const db   = getDb();
  const profile = db.prepare('SELECT * FROM freelancer_profiles WHERE id = ?').get(freelancerId);
  if (!profile) return 0;

  const skills  = db.prepare('SELECT skill_name FROM freelancer_skills WHERE freelancer_id = ?').all(freelancerId).map(r => r.skill_name);
  const gig     = db.prepare('SELECT * FROM gigs WHERE id = ?').get(gigId);
  if (!gig) return 0;

  const tags     = db.prepare('SELECT tag FROM gig_tags WHERE gig_id = ?').all(gigId).map(r => r.tag);
  const appCount = db.prepare('SELECT COUNT(*) as cnt FROM applications WHERE gig_id = ?').get(gigId).cnt;

  return scoreGit(skills, profile.availability, gig, tags, appCount).score;
}

module.exports = { matchGigsForFreelancer, computeMatchScore };
