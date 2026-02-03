-- ============================================================
-- TalentBridge — Seed Data
-- ============================================================

-- ── Demo Users ───────────────────────────────────────────────
-- passwords are all "password123" → bcrypt hash (cost 10)
INSERT OR IGNORE INTO users (id, email, password_hash, role, full_name, avatar_initials) VALUES
  ('usr_demo_admin',   'admin@talentbridge.com',     '$2a$10$demoHashForAdminXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'admin',      'Admin User',    'AU'),
  ('usr_alex',         'alex@email.com',             '$2a$10$demoHashForAlexXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'freelancer', 'Alex Morgan',   'AM'),
  ('usr_priya',        'priya@email.com',            '$2a$10$demoHashForPriyaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'freelancer', 'Priya Nair',    'PN'),
  ('usr_james',        'james@email.com',            '$2a$10$demoHashForJamesXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'freelancer', 'James Wright',  'JW'),
  ('usr_sophia',       'sophia@email.com',           '$2a$10$demoHashForSophiaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX','freelancer', 'Sophia Chen',   'SC'),
  ('usr_liam',         'liam@email.com',             '$2a$10$demoHashForLiamXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'freelancer', 'Liam Torres',   'LT'),
  ('usr_nina',         'nina@email.com',             '$2a$10$demoHashForNinaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'freelancer', 'Nina Patel',    'NP'),
  ('usr_omar',         'omar@email.com',             '$2a$10$demoHashForOmarXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'freelancer', 'Omar Hassan',   'OH'),
  ('usr_clara',        'clara@email.com',            '$2a$10$demoHashForClaraXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'freelancer', 'Clara Kim',     'CK'),
  ('usr_client1',      'fintechlabs@email.com',      '$2a$10$demoHashForClient1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX','client',     'FinTech Labs',  'FL'),
  ('usr_client2',      'ecoleaf@email.com',          '$2a$10$demoHashForClient2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX','client',     'EcoLeaf Co.',   'EC'),
  ('usr_client3',      'datamind@email.com',         '$2a$10$demoHashForClient3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX','client',     'DataMind AI',   'DM'),
  ('usr_client4',      'fitpulse@email.com',         '$2a$10$demoHashForClient4XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX','client',     'FitPulse',      'FP'),
  ('usr_client5',      'learnhub@email.com',         '$2a$10$demoHashForClient5XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX','client',     'LearnHub',      'LH');

-- ── Freelancer Profiles ─────────────────────────────────────
INSERT OR IGNORE INTO freelancer_profiles (id, user_id, bio, availability, hourly_rate, location, success_count, total_applied) VALUES
  ('fp_alex',   'usr_alex',   'Full-stack React developer with 6+ years building dashboards & SaaS products.',  'This Week',     85,  'San Francisco, US', 42, 58),
  ('fp_priya',  'usr_priya',  'Brand strategist & illustrator. Obsessed with clean, bold visual identity.',     'Next Week',     72,  'London, UK',        28, 40),
  ('fp_james',  'usr_james',  'SEO & content specialist. I turn blogs into traffic machines.',                  'This Week',     55,  'Austin, TX',        61, 75),
  ('fp_sophia', 'usr_sophia', 'ML engineer. Python all day, every day. AWS certified.',                         'Next 2 Weeks',  110, 'Toronto, CA',       19, 22),
  ('fp_liam',   'usr_liam',   'Cross-platform mobile dev. React Native & Swift.',                              'Next Week',     90,  'Berlin, DE',        31, 44),
  ('fp_nina',   'usr_nina',   'Motion designer & video editor. I make brands come alive on screen.',           'Next Month',    68,  'Mumbai, IN',        15, 20),
  ('fp_omar',   'usr_omar',   'Cloud architect & DevOps guru. Zero-downtime is my religion.',                  'This Week',     120, 'Dubai, AE',         24, 29),
  ('fp_clara',  'usr_clara',  'WordPress & e-commerce specialist. Built 200+ stores.',                         'This Week',     48,  'Seoul, KR',         88, 112);

-- ── Freelancer Skills ───────────────────────────────────────
INSERT OR IGNORE INTO freelancer_skills (id, freelancer_id, skill_name, proficiency) VALUES
  ('s01','fp_alex',  'React',        'Expert'),
  ('s02','fp_alex',  'Node.js',      'Expert'),
  ('s03','fp_alex',  'Data Analysis','Intermediate'),
  ('s04','fp_alex',  'TypeScript',   'Expert'),
  ('s05','fp_priya', 'Graphic Design','Expert'),
  ('s06','fp_priya', 'Branding',     'Expert'),
  ('s07','fp_priya', 'Illustration', 'Expert'),
  ('s08','fp_priya', 'UI/UX Design', 'Intermediate'),
  ('s09','fp_james', 'SEO',          'Expert'),
  ('s10','fp_james', 'Content Writing','Expert'),
  ('s11','fp_james', 'Social Media', 'Intermediate'),
  ('s12','fp_james', 'Copywriting',  'Intermediate'),
  ('s13','fp_sophia','Python',       'Expert'),
  ('s14','fp_sophia','Machine Learning','Expert'),
  ('s15','fp_sophia','Cloud (AWS)',  'Expert'),
  ('s16','fp_sophia','Data Analysis','Expert'),
  ('s17','fp_liam',  'Mobile Dev',   'Expert'),
  ('s18','fp_liam',  'UI/UX Design', 'Expert'),
  ('s19','fp_liam',  'Backend Dev',  'Intermediate'),
  ('s20','fp_nina',  'Video Editing','Expert'),
  ('s21','fp_nina',  'Illustration', 'Intermediate'),
  ('s22','fp_nina',  'Content Writing','Intermediate'),
  ('s23','fp_omar',  'Cloud (AWS)',  'Expert'),
  ('s24','fp_omar',  'DevOps',       'Expert'),
  ('s25','fp_omar',  'Backend Dev',  'Expert'),
  ('s26','fp_omar',  'Python',       'Intermediate'),
  ('s27','fp_clara', 'WordPress',    'Expert'),
  ('s28','fp_clara', 'UI/UX Design', 'Intermediate'),
  ('s29','fp_clara', 'SEO',          'Intermediate');

-- ── Gig Postings ────────────────────────────────────────────
INSERT OR IGNORE INTO gigs (id, client_id, title, description, category, budget_min, budget_max, deadline_days, status, badge, gradient, glow) VALUES
  ('gig_01','usr_client1', 'Custom React Analytics Dashboard',
   'A stunning responsive analytics dashboard with interactive charts, dark mode, and role-based access.',
   'Web Dev', 480, 2800, 18, 'open', 'Top Rated',
   '135deg, #6366f1 0%, #8b5cf6 100%', 'rgba(99,102,241,0.45)'),

  ('gig_02','usr_client2', 'Brand Identity & Visual System',
   'Elevate your startup with a cohesive brand. Logo to full style guide.',
   'Design', 250, 1500, 14, 'open', 'Pro',
   '135deg, #ec4899 0%, #f43f5e 100%', 'rgba(236,72,153,0.45)'),

  ('gig_03','usr_client1', 'SEO Content Strategy & Blog Writing',
   'Grow organic traffic with data-driven SEO and compelling long-form content.',
   'Marketing', 150, 950, 30, 'open', 'Best Seller',
   '135deg, #06b6d4 0%, #3b82f6 100%', 'rgba(6,182,212,0.45)'),

  ('gig_04','usr_client3', 'Python ML Pipeline on AWS',
   'End-to-end ML pipeline from data ingestion to model serving on AWS.',
   'Data & AI', 900, 4200, 30, 'open', 'Top Rated',
   '135deg, #10b981 0%, #34d399 100%', 'rgba(16,185,129,0.45)'),

  ('gig_05','usr_client4', 'iOS & Android Fitness App',
   'Cross-platform fitness app with social features and workout tracking.',
   'Mobile', 1100, 5500, 45, 'open', 'Pro',
   '135deg, #f59e0b 0%, #ef4444 100%', 'rgba(245,158,11,0.45)'),

  ('gig_06','usr_client5', 'Professional Explainer Video Series',
   'Produce 12 explainer videos for an online learning platform.',
   'Video', 350, 2100, 28, 'open', 'Pro',
   '135deg, #a855f7 0%, #ec4899 100%', 'rgba(168,85,247,0.45)'),

  ('gig_07','usr_client3', 'AWS Migration & DevOps Setup',
   'Migrate legacy infrastructure to AWS with CI/CD pipelines and monitoring.',
   'Web Dev', 800, 3900, 30, 'open', 'Top Rated',
   '135deg, #4f46e5 0%, #06b6d4 100%', 'rgba(79,70,229,0.45)'),

  ('gig_08','usr_client2', 'WooCommerce Store & SEO',
   'Build a polished WooCommerce store with optimised checkout and SEO.',
   'Web Dev', 200, 1200, 18, 'open', 'Best Seller',
   '135deg, #f59e0b 0%, #10b981 100%', 'rgba(245,158,11,0.4)');

-- ── Gig Tags ────────────────────────────────────────────────
INSERT OR IGNORE INTO gig_tags (id, gig_id, tag) VALUES
  ('gt01','gig_01','React'),   ('gt02','gig_01','Node.js'),      ('gt03','gig_01','Charts'),
  ('gt04','gig_02','Branding'),('gt05','gig_02','Logo'),         ('gt06','gig_02','Style Guide'),
  ('gt07','gig_03','SEO'),     ('gt08','gig_03','Content'),      ('gt09','gig_03','Strategy'),
  ('gt10','gig_04','Python'),  ('gt11','gig_04','ML'),           ('gt12','gig_04','AWS'),
  ('gt13','gig_05','React Native'),('gt14','gig_05','UX'),       ('gt15','gig_05','Backend'),
  ('gt16','gig_06','Motion Graphics'),('gt17','gig_06','Animation'),('gt18','gig_06','Script'),
  ('gt19','gig_07','AWS'),     ('gt20','gig_07','DevOps'),       ('gt21','gig_07','CI/CD'),
  ('gt22','gig_08','WordPress'),('gt23','gig_08','WooCommerce'), ('gt24','gig_08','SEO');

-- ── Gig Tiers ───────────────────────────────────────────────
INSERT OR IGNORE INTO gig_tiers (id, gig_id, tier, price, days, desc) VALUES
  ('t01','gig_01','basic',    480,  5,  'Single-page dashboard, 3 interactive charts'),
  ('t02','gig_01','standard', 1200, 10, 'Multi-page + real-time data feeds + dark mode'),
  ('t03','gig_01','premium',  2800, 18, 'Full app + auth + AWS deploy + documentation'),
  ('t04','gig_02','basic',    250,  3,  'Logo design with 3 initial concepts'),
  ('t05','gig_02','standard', 650,  7,  'Logo + palette + typography system'),
  ('t06','gig_02','premium',  1500, 14, 'Full brand kit + social assets + guidelines'),
  ('t07','gig_03','basic',    150,  5,  'SEO audit + 2 optimised blog posts'),
  ('t08','gig_03','standard', 400,  14, '6-month roadmap + 8 long-form posts'),
  ('t09','gig_03','premium',  950,  30, 'Full strategy + 20 posts + social calendar'),
  ('t10','gig_04','basic',    900,  7,  'Model training + evaluation suite'),
  ('t11','gig_04','standard', 2200, 18, 'Full pipeline + AWS deployment'),
  ('t12','gig_04','premium',  4200, 30, 'End-to-end system + monitoring + docs'),
  ('t13','gig_05','basic',    1100, 14, 'Core screens + smooth navigation'),
  ('t14','gig_05','standard', 2800, 28, 'Full app + push notifications + API'),
  ('t15','gig_05','premium',  5500, 45, 'Complete app + social + analytics dashboard'),
  ('t16','gig_06','basic',    350,  5,  '1 polished video up to 2 minutes'),
  ('t17','gig_06','standard', 950,  14, '4 videos + custom motion graphics'),
  ('t18','gig_06','premium',  2100, 28, '12-video series + branding + revisions'),
  ('t19','gig_07','basic',    800,  7,  'AWS setup + 1 service migrated'),
  ('t20','gig_07','standard', 2100, 18, 'Full migration + CI/CD pipelines'),
  ('t21','gig_07','premium',  3900, 30, 'Enterprise migration + monitoring + 24/7'),
  ('t22','gig_08','basic',    200,  4,  'Template setup + 10 product pages'),
  ('t23','gig_08','standard', 550,  10, 'Custom theme + payment gateway'),
  ('t24','gig_08','premium',  1200, 18, 'Full store + SEO + checkout + docs');

-- ── Sample Applications ─────────────────────────────────────
INSERT OR IGNORE INTO applications (id, gig_id, freelancer_id, tier_chosen, cover_letter, status, match_score) VALUES
  ('app_01','gig_01','fp_alex',  'standard', 'I have built 15+ dashboards exactly like this. Let me show you my portfolio.', 'accepted',  94),
  ('app_02','gig_02','fp_priya', 'premium',  'Brand identity is my bread and butter. Check out my latest work on Behance.', 'pending',   91),
  ('app_03','gig_04','fp_sophia','premium',  'AWS ML pipelines are my specialty. I shipped a churn model last month.',       'accepted',  97),
  ('app_04','gig_07','fp_omar',  'standard', 'Migrated 3 enterprises to AWS this quarter. Zero downtime, every time.',       'pending',   93),
  ('app_05','gig_08','fp_clara', 'basic',    'Built 200+ WooCommerce stores. This one I can knock out in a weekend.',        'completed', 82);

-- ── Sample Reviews ──────────────────────────────────────────
INSERT OR IGNORE INTO reviews (id, application_id, reviewer_id, reviewee_id, rating, comment) VALUES
  ('rev_01','app_05','usr_client2','usr_clara', 4.8, 'Clara delivered a stunning store. Communication was top-notch.'),
  ('rev_02','app_01','usr_client1','usr_alex',  4.9, 'Alex crushed it. Dashboard shipped ahead of schedule.');

-- ── Sample Saved Gigs ───────────────────────────────────────
INSERT OR IGNORE INTO saved_gigs (id, user_id, gig_id) VALUES
  ('sg_01','usr_alex',  'gig_04'),
  ('sg_02','usr_alex',  'gig_07'),
  ('sg_03','usr_priya', 'gig_08');

-- ── Sample Messages ─────────────────────────────────────────
INSERT OR IGNORE INTO messages (id, app_id, sender_id, body, read) VALUES
  ('msg_01','app_01','usr_client1', 'Hey Alex! Can you include a custom date-range picker in the dashboard?', 0),
  ('msg_02','app_01','usr_alex',    'Absolutely — I have a great reusable component for that. Will include it.', 1),
  ('msg_03','app_03','usr_client3', 'Sophia, can we add a model re-training schedule to the pipeline?',         0);
