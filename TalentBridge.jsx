
import { useState, useMemo, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG — point BASE_URL at your Express server
   ═══════════════════════════════════════════════════════════════════════════ */
const BASE_URL = "http://localhost:5000/api";

/* ═══════════════════════════════════════════════════════════════════════════
   SIMULATED BACKEND  (mirrors every Express endpoint in-memory so the
   artifact works stand-alone AND can be swapped to real fetch calls)
   ═══════════════════════════════════════════════════════════════════════════ */

// ── seed state ──────────────────────────────────────────────────────────────
const DB = (() => {
  const users = [
    { id:"usr_alex",  email:"alex@email.com",  password:"password123", role:"freelancer", full_name:"Alex Morgan",  avatar_initials:"AM" },
    { id:"usr_priya", email:"priya@email.com", password:"password123", role:"freelancer", full_name:"Priya Nair",   avatar_initials:"PN" },
    { id:"usr_james", email:"james@email.com", password:"password123", role:"freelancer", full_name:"James Wright", avatar_initials:"JW" },
    { id:"usr_sophia",email:"sophia@email.com",password:"password123", role:"freelancer", full_name:"Sophia Chen",  avatar_initials:"SC" },
    { id:"usr_liam",  email:"liam@email.com",  password:"password123", role:"freelancer", full_name:"Liam Torres",  avatar_initials:"LT" },
    { id:"usr_nina",  email:"nina@email.com",  password:"password123", role:"freelancer", full_name:"Nina Patel",   avatar_initials:"NP" },
    { id:"usr_omar",  email:"omar@email.com",  password:"password123", role:"freelancer", full_name:"Omar Hassan",  avatar_initials:"OH" },
    { id:"usr_clara", email:"clara@email.com", password:"password123", role:"freelancer", full_name:"Clara Kim",    avatar_initials:"CK" },
    { id:"usr_client1",email:"fintechlabs@email.com", password:"password123", role:"client", full_name:"FinTech Labs", avatar_initials:"FL" },
    { id:"usr_client2",email:"ecoleaf@email.com",     password:"password123", role:"client", full_name:"EcoLeaf Co.", avatar_initials:"EC" },
    { id:"usr_client3",email:"datamind@email.com",    password:"password123", role:"client", full_name:"DataMind AI", avatar_initials:"DM" },
  ];

  const profiles = [
    { id:"fp_alex",  user_id:"usr_alex",  bio:"Full-stack React dev, 6+ yrs.",        availability:"This Week",     hourly_rate:85,  location:"San Francisco", success_count:42, total_applied:58 },
    { id:"fp_priya", user_id:"usr_priya", bio:"Brand strategist & illustrator.",      availability:"Next Week",     hourly_rate:72,  location:"London",       success_count:28, total_applied:40 },
    { id:"fp_james", user_id:"usr_james", bio:"SEO & content specialist.",            availability:"This Week",     hourly_rate:55,  location:"Austin",       success_count:61, total_applied:75 },
    { id:"fp_sophia",user_id:"usr_sophia",bio:"ML engineer. Python all day.",         availability:"Next 2 Weeks",  hourly_rate:110, location:"Toronto",      success_count:19, total_applied:22 },
    { id:"fp_liam",  user_id:"usr_liam",  bio:"Cross-platform mobile dev.",          availability:"Next Week",     hourly_rate:90,  location:"Berlin",       success_count:31, total_applied:44 },
    { id:"fp_nina",  user_id:"usr_nina",  bio:"Motion designer & video editor.",     availability:"Next Month",    hourly_rate:68,  location:"Mumbai",       success_count:15, total_applied:20 },
    { id:"fp_omar",  user_id:"usr_omar",  bio:"Cloud architect & DevOps guru.",      availability:"This Week",     hourly_rate:120, location:"Dubai",        success_count:24, total_applied:29 },
    { id:"fp_clara", user_id:"usr_clara", bio:"WordPress & e-commerce specialist.",  availability:"This Week",     hourly_rate:48,  location:"Seoul",        success_count:88, total_applied:112 },
  ];

  const skills = [
    { freelancer_id:"fp_alex",  skill_name:"React",          proficiency:"Expert" },
    { freelancer_id:"fp_alex",  skill_name:"Node.js",        proficiency:"Expert" },
    { freelancer_id:"fp_alex",  skill_name:"Data Analysis",  proficiency:"Intermediate" },
    { freelancer_id:"fp_alex",  skill_name:"TypeScript",     proficiency:"Expert" },
    { freelancer_id:"fp_priya", skill_name:"Graphic Design", proficiency:"Expert" },
    { freelancer_id:"fp_priya", skill_name:"Branding",       proficiency:"Expert" },
    { freelancer_id:"fp_priya", skill_name:"Illustration",   proficiency:"Expert" },
    { freelancer_id:"fp_james", skill_name:"SEO",            proficiency:"Expert" },
    { freelancer_id:"fp_james", skill_name:"Content Writing",proficiency:"Expert" },
    { freelancer_id:"fp_james", skill_name:"Social Media",   proficiency:"Intermediate" },
    { freelancer_id:"fp_sophia",skill_name:"Python",         proficiency:"Expert" },
    { freelancer_id:"fp_sophia",skill_name:"Machine Learning",proficiency:"Expert" },
    { freelancer_id:"fp_sophia",skill_name:"Cloud (AWS)",    proficiency:"Expert" },
    { freelancer_id:"fp_liam",  skill_name:"Mobile Dev",     proficiency:"Expert" },
    { freelancer_id:"fp_liam",  skill_name:"UI/UX Design",   proficiency:"Expert" },
    { freelancer_id:"fp_nina",  skill_name:"Video Editing",  proficiency:"Expert" },
    { freelancer_id:"fp_nina",  skill_name:"Animation",      proficiency:"Expert" },
    { freelancer_id:"fp_omar",  skill_name:"Cloud (AWS)",    proficiency:"Expert" },
    { freelancer_id:"fp_omar",  skill_name:"DevOps",         proficiency:"Expert" },
    { freelancer_id:"fp_omar",  skill_name:"Backend Dev",    proficiency:"Expert" },
    { freelancer_id:"fp_clara", skill_name:"WordPress",      proficiency:"Expert" },
    { freelancer_id:"fp_clara", skill_name:"WooCommerce",    proficiency:"Expert" },
    { freelancer_id:"fp_clara", skill_name:"SEO",            proficiency:"Intermediate" },
  ];

  const gigs = [
    { id:"gig_01", client_id:"usr_client1", title:"Custom React Analytics Dashboard",      description:"A stunning responsive analytics dashboard with interactive charts, dark mode, and role-based access control. Includes real-time data feeds and custom date pickers.", category:"Web Dev",    budget_min:480,  budget_max:2800, deadline_days:18, status:"open", badge:"Top Rated",  gradient:"135deg, #6366f1 0%, #8b5cf6 100%", glow:"rgba(99,102,241,0.45)" },
    { id:"gig_02", client_id:"usr_client2", title:"Brand Identity & Visual System",        description:"Elevate your startup with a cohesive, unforgettable brand. From logo concept to a full visual identity system — unlimited revisions included.", category:"Design",     budget_min:250,  budget_max:1500, deadline_days:14, status:"open", badge:"Pro",         gradient:"135deg, #ec4899 0%, #f43f5e 100%", glow:"rgba(236,72,153,0.45)" },
    { id:"gig_03", client_id:"usr_client1", title:"SEO Content Strategy & Blog Writing",   description:"Data-driven SEO and compelling content that drives organic growth. Proven track record of delivering 40%+ traffic increases for B2B startups.", category:"Marketing",  budget_min:150,  budget_max:950,  deadline_days:30, status:"open", badge:"Best Seller", gradient:"135deg, #06b6d4 0%, #3b82f6 100%", glow:"rgba(6,182,212,0.45)" },
    { id:"gig_04", client_id:"usr_client3", title:"Python ML Pipeline on AWS",             description:"End-to-end ML pipelines — from data ingestion to model serving on AWS. Specialising in churn prediction, NLP, and computer vision models.", category:"Data & AI",  budget_min:900,  budget_max:4200, deadline_days:30, status:"open", badge:"Top Rated",  gradient:"135deg, #10b981 0%, #34d399 100%", glow:"rgba(16,185,129,0.45)" },
    { id:"gig_05", client_id:"usr_client1", title:"iOS & Android Fitness App",             description:"Cross-platform fitness apps that feel genuinely native. Smooth animations, intuitive UX, and a backend that scales with your user base.", category:"Mobile",     budget_min:1100, budget_max:5500, deadline_days:45, status:"open", badge:"Pro",         gradient:"135deg, #f59e0b 0%, #ef4444 100%", glow:"rgba(245,158,11,0.45)" },
    { id:"gig_06", client_id:"usr_client2", title:"Professional Explainer Video Series",   description:"Eye-catching explainer videos that convert viewers into customers. Cinematic editing, 2D/3D animation — all tailored to your brand voice.", category:"Video",      budget_min:350,  budget_max:2100, deadline_days:28, status:"open", badge:"Pro",         gradient:"135deg, #a855f7 0%, #ec4899 100%", glow:"rgba(168,85,247,0.45)" },
    { id:"gig_07", client_id:"usr_client3", title:"AWS Migration & DevOps Setup",          description:"Zero-downtime cloud migrations with bulletproof CI/CD, auto-scaling, and comprehensive monitoring dashboards. Ship faster, break less.", category:"Web Dev",    budget_min:800,  budget_max:3900, deadline_days:30, status:"open", badge:"Top Rated",  gradient:"135deg, #4f46e5 0%, #06b6d4 100%", glow:"rgba(79,70,229,0.45)" },
    { id:"gig_08", client_id:"usr_client2", title:"WooCommerce Store & SEO",               description:"Beautiful, conversion-optimised online stores. Mobile-first design, streamlined checkout flows, and SEO baked in from day one.", category:"Web Dev",    budget_min:200,  budget_max:1200, deadline_days:18, status:"open", badge:"Best Seller", gradient:"135deg, #f59e0b 0%, #10b981 100%", glow:"rgba(245,158,11,0.4)" },
  ];

  const gigTags = {
    gig_01:["React","Node.js","Charts"],  gig_02:["Branding","Logo","Style Guide"],
    gig_03:["SEO","Content","Strategy"],  gig_04:["Python","ML","AWS"],
    gig_05:["React Native","UX","Backend"],gig_06:["Motion Graphics","Animation","Script"],
    gig_07:["AWS","DevOps","CI/CD"],      gig_08:["WordPress","WooCommerce","SEO"],
  };

  const gigTiers = {
    gig_01:{ basic:{price:480,days:5,desc:"Single-page dashboard, 3 interactive charts"}, standard:{price:1200,days:10,desc:"Multi-page + real-time data feeds + dark mode"}, premium:{price:2800,days:18,desc:"Full app + auth + AWS deploy + documentation"} },
    gig_02:{ basic:{price:250,days:3,desc:"Logo design with 3 initial concepts"}, standard:{price:650,days:7,desc:"Logo + palette + typography system"}, premium:{price:1500,days:14,desc:"Full brand kit + social assets + guidelines"} },
    gig_03:{ basic:{price:150,days:5,desc:"SEO audit + 2 optimised blog posts"}, standard:{price:400,days:14,desc:"6-month roadmap + 8 long-form posts"}, premium:{price:950,days:30,desc:"Full strategy + 20 posts + social calendar"} },
    gig_04:{ basic:{price:900,days:7,desc:"Model training + evaluation suite"}, standard:{price:2200,days:18,desc:"Full pipeline + AWS deployment"}, premium:{price:4200,days:30,desc:"End-to-end system + monitoring + docs"} },
    gig_05:{ basic:{price:1100,days:14,desc:"Core screens + smooth navigation"}, standard:{price:2800,days:28,desc:"Full app + push notifications + API"}, premium:{price:5500,days:45,desc:"Complete app + social + analytics"} },
    gig_06:{ basic:{price:350,days:5,desc:"1 polished video up to 2 minutes"}, standard:{price:950,days:14,desc:"4 videos + custom motion graphics"}, premium:{price:2100,days:28,desc:"12-video series + branding + revisions"} },
    gig_07:{ basic:{price:800,days:7,desc:"AWS setup + 1 service migrated"}, standard:{price:2100,days:18,desc:"Full migration + CI/CD pipelines"}, premium:{price:3900,days:30,desc:"Enterprise migration + monitoring"} },
    gig_08:{ basic:{price:200,days:4,desc:"Template setup + 10 product pages"}, standard:{price:550,days:10,desc:"Custom theme + payment gateway"}, premium:{price:1200,days:18,desc:"Full store + SEO + custom checkout"} },
  };

  let applications = [
    { id:"app_01", gig_id:"gig_01", freelancer_id:"fp_alex",  tier_chosen:"standard", cover_letter:"Built 15+ dashboards. Let me show my portfolio.", status:"accepted",  match_score:94, created_at:"2025-01-20" },
    { id:"app_02", gig_id:"gig_02", freelancer_id:"fp_priya", tier_chosen:"premium",  cover_letter:"Brand identity is my specialty.",                status:"pending",   match_score:91, created_at:"2025-01-21" },
    { id:"app_03", gig_id:"gig_04", freelancer_id:"fp_sophia",tier_chosen:"premium",  cover_letter:"AWS ML pipelines are my forte.",                status:"accepted",  match_score:97, created_at:"2025-01-19" },
    { id:"app_04", gig_id:"gig_07", freelancer_id:"fp_omar",  tier_chosen:"standard", cover_letter:"Migrated 3 enterprises this quarter.",          status:"pending",   match_score:93, created_at:"2025-01-22" },
    { id:"app_05", gig_id:"gig_08", freelancer_id:"fp_clara", tier_chosen:"basic",    cover_letter:"200+ stores built. Easy one.",                  status:"completed", match_score:82, created_at:"2025-01-18" },
  ];

  let messages = [
    { id:"msg_01", app_id:"app_01", sender_id:"usr_client1", body:"Can you add a custom date-range picker?",                   read:false, created_at:"2025-01-20T10:00:00" },
    { id:"msg_02", app_id:"app_01", sender_id:"usr_alex",    body:"Absolutely — I have a reusable component for that.",      read:true,  created_at:"2025-01-20T10:30:00" },
    { id:"msg_03", app_id:"app_03", sender_id:"usr_client3", body:"Can we add model re-training to the pipeline?",           read:false, created_at:"2025-01-19T14:00:00" },
  ];

  let reviews = [
    { id:"rev_01", application_id:"app_05", reviewer_id:"usr_client2", reviewee_id:"usr_clara", rating:4.8, comment:"Clara delivered a stunning store. Top-notch communication.", created_at:"2025-01-19" },
    { id:"rev_02", application_id:"app_01", reviewer_id:"usr_client1", reviewee_id:"usr_alex",  rating:4.9, comment:"Alex crushed it. Dashboard shipped ahead of schedule.",     created_at:"2025-01-21" },
  ];

  let savedGigs = [
    { user_id:"usr_alex",  gig_id:"gig_04" },
    { user_id:"usr_alex",  gig_id:"gig_07" },
    { user_id:"usr_priya", gig_id:"gig_08" },
  ];

  return { users, profiles, skills, gigs, gigTags, gigTiers, applications, messages, reviews, savedGigs };
})();

/* ── matching engine ────────────────────────────────────────────────────── */
function computeMatch(freelancerSkills, freelancerAvail, gig, tags, appCount) {
  const fSet = new Set(freelancerSkills.map(s => s.toLowerCase()));
  const gSet = new Set(tags.map(t => t.toLowerCase()));
  const overlap   = [...gSet].filter(t => fSet.has(t)).length;
  const skillMatch= gSet.size ? Math.round((overlap / gSet.size) * 100) : 0;

  const aMap  = { "This Week":100, "Next Week":80, "Next 2 Weeks":60, "Next Month":40 };
  const dMap  = (d) => d<=7?"This Week":d<=14?"Next Week":d<=21?"Next 2 Weeks":"Next Month";
  const avail = Math.max(0, 100 - Math.abs((aMap[freelancerAvail]||50) - (aMap[dMap(gig.deadline_days)]||50)) * 0.8);
  const demand= Math.min(100, 30 + appCount * 3.5);

  const score = Math.min(100, Math.round(skillMatch*0.55 + avail*0.25 + demand*0.2));
  return { score, breakdown: { skillMatch: Math.round(skillMatch), availability: Math.round(avail), demand: Math.round(demand) } };
}

function runMatch(userId) {
  const profile   = DB.profiles.find(p => p.user_id === userId);
  if (!profile) return [];
  const mySkills  = DB.skills.filter(s => s.freelancer_id === profile.id).map(s => s.skill_name);
  return DB.gigs.filter(g => g.status === "open").map(gig => {
    const tags     = DB.gigTags[gig.id] || [];
    const tiers    = DB.gigTiers[gig.id] || {};
    const appCount = DB.applications.filter(a => a.gig_id === gig.id).length;
    const { score, breakdown } = computeMatch(mySkills, profile.availability, gig, tags, appCount);
    const completed = DB.applications.filter(a => a.gig_id === gig.id && a.status === "completed").length;
    const successRate = Math.round((completed / (appCount || 1)) * 40 + score * 0.6);
    return { gig, tags, tiers, score, breakdown, successRate, totalApplications: appCount };
  }).sort((a, b) => b.score - a.score);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes orb1{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(55px,-35px) scale(1.12)}70%{transform:translate(-25px,28px) scale(0.94)}}
@keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,45px) scale(1.08)}}
@keyframes orb3{0%,100%{transform:translate(0,0)}60%{transform:translate(38px,35px) scale(1.06)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideDown{from{transform:translateY(-30px);opacity:0}to{transform:translateY(0);opacity:1}}
.tb-card{transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,border-color .3s}
.tb-card:hover{transform:translateY(-5px) scale(1.02)}
.tb-pill{transition:all .25s cubic-bezier(.34,1.56,.64,1)}
.tb-pill:hover{background:rgba(255,255,255,0.13)!important}
.tb-cta{transition:box-shadow .3s,filter .25s}
.tb-cta:hover{filter:brightness(1.14);box-shadow:0 8px 32px rgba(139,92,246,0.55)!important}
.tb-input:focus{border-color:rgba(139,92,246,0.6)!important;box-shadow:0 0 0 3px rgba(139,92,246,0.18)!important}
.tb-nav-link{transition:color .2s}
.tb-nav-link:hover{color:#fff!important}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.14);border-radius:3px}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */
const Stars = ({ rating, size = 13 }) => {
  const full = Math.floor(rating), half = rating - full >= 0.5;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:2 }}>
    {[...Array(5)].map((_,i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill={i<full?"#fbbf24":i===full&&half?"url(#hf)":"rgba(255,255,255,0.15)"}>
        <defs><linearGradient id="hf"><stop offset="50%" stopColor="#fbbf24"/><stop offset="50%" stopColor="rgba(255,255,255,0.15)"/></linearGradient></defs>
        <polygon points="8,1 10.5,6 16,6.5 12,10 13,16 8,13 3,16 4,10 0,6.5 5.5,6"/>
      </svg>
    ))}
  </span>;
};

const Badge = ({ label }) => {
  const map = { "Top Rated":["#fbbf24","#f59e0b","rgba(251,191,36,0.4)"], "Pro":["#60a5fa","#3b82f6","rgba(96,165,250,0.4)"], "Best Seller":["#34d399","#10b981","rgba(52,211,153,0.4)"] };
  const [c1,c2,shadow] = map[label] || ["#888","#666","transparent"];
  return <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", background:`linear-gradient(135deg,${c1},${c2})`, color:"#fff", padding:"3px 10px", borderRadius:20, boxShadow:`0 2px 10px ${shadow}`, fontFamily:"'DM Sans'" }}>{label}</span>;
};

const Avatar = ({ initials, size=38, gradient="linear-gradient(135deg,#8b5cf6,#6366f1)" }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:gradient, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*.38, fontWeight:700, border:"2px solid rgba(255,255,255,0.14)", boxShadow:"0 2px 12px rgba(139,92,246,0.4)" }}>{initials}</div>
);

const StatusDot = ({ status }) => {
  const colors = { pending:"#fbbf24", accepted:"#34d399", rejected:"#f87171", completed:"#60a5fa" };
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
    <span style={{ width:8, height:8, borderRadius:"50%", background:colors[status]||"#888", boxShadow:`0 0 6px ${colors[status]||"#888"}` }}/>
    <span style={{ fontSize:12, color:colors[status], fontWeight:600, textTransform:"capitalize" }}>{status}</span>
  </span>;
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Auth Screen ───────────────────────────────────────────────────────── */
function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [reg,   setReg]   = useState(false);
  const [name,  setName]  = useState("");

  const handle = () => {
    setErr("");
    if (reg) {
      if (!email || !pass || !name) return setErr("Fill all fields");
      if (DB.users.find(u => u.email === email)) return setErr("Email taken");
      const id = "usr_new_" + Date.now();
      const initials = name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
      DB.users.push({ id, email, password:pass, role:"freelancer", full_name:name, avatar_initials:initials });
      DB.profiles.push({ id:"fp_"+id, user_id:id, bio:"", availability:"Next Week", hourly_rate:0, location:"", success_count:0, total_applied:0 });
      onLogin({ id, email, role:"freelancer", full_name:name, avatar_initials:initials });
    } else {
      const u = DB.users.find(u => u.email === email && u.password === pass);
      if (!u) return setErr("Invalid credentials");
      onLogin({ id:u.id, email:u.email, role:u.role, full_name:u.full_name, avatar_initials:u.avatar_initials });
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0f0d1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans', sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{CSS}</style>
      <div style={{ position:"absolute", top:"10%", left:"15%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)", animation:"orb1 14s ease-in-out infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"5%", right:"10%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", animation:"orb2 18s ease-in-out infinite", pointerEvents:"none" }}/>

      <div style={{ background:"rgba(24,21,40,0.88)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:40, width:"100%", maxWidth:420, position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#8b5cf6,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", boxShadow:"0 4px 20px rgba(139,92,246,0.5)" }}>
            <span style={{ color:"#fff", fontSize:26, fontWeight:800, fontFamily:"'Syne'" }}>T</span>
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#fff", fontFamily:"'Syne'" }}>Talent<span style={{ color:"#8b5cf6" }}>Bridge</span></h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:4 }}>{reg ? "Create your account" : "Welcome back"}</p>
        </div>

        {reg && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" className="tb-input" style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, outline:"none", marginBottom:10, fontFamily:"'DM Sans'" }}/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="tb-input" style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, outline:"none", marginBottom:10, fontFamily:"'DM Sans'" }}/>
        <input value={pass} type="password" onChange={e=>setPass(e.target.value)} placeholder="Password" className="tb-input" style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, outline:"none", marginBottom:16, fontFamily:"'DM Sans'" }}/>

        {err && <p style={{ color:"#f87171", fontSize:13, marginBottom:12, textAlign:"center" }}>{err}</p>}

        <button className="tb-cta" onClick={handle} style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#8b5cf6,#6366f1)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Syne'", boxShadow:"0 4px 20px rgba(139,92,246,0.45)" }}>
          {reg ? "Create Account" : "Sign In"}
        </button>

        <p style={{ textAlign:"center", marginTop:18, fontSize:13, color:"rgba(255,255,255,0.4)" }}>
          {reg ? "Already have an account? " : "Don't have an account? "}
          <span onClick={()=>setReg(!reg)} style={{ color:"#8b5cf6", cursor:"pointer", fontWeight:600 }}>{reg?"Sign In":"Sign Up"}</span>
        </p>

        {/* Quick demo logins */}
        <div style={{ marginTop:24, borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:16 }}>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center", marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Quick Demo Login</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
            {[
              { label:"Freelancer", email:"alex@email.com" },
              { label:"Client", email:"fintechlabs@email.com" },
            ].map(d => (
              <button key={d.label} onClick={()=>{ setEmail(d.email); setPass("password123"); setTimeout(()=>{ const u=DB.users.find(u=>u.email===d.email); onLogin({id:u.id,email:u.email,role:u.role,full_name:u.full_name,avatar_initials:u.avatar_initials}); },80); }}
                style={{ padding:"6px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", fontSize:12, fontWeight:600, cursor:"pointer" }}>{d.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Gig Card ──────────────────────────────────────────────────────────── */
function GigCard({ gig, tags, tiers, score, successRate, totalApplications, onClick, delay=0, isSaved, onToggleSave }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div className="tb-card" onClick={onClick} style={{
      opacity: mounted?1:0, animation: mounted?"fadeUp .45s cubic-bezier(.34,1.56,.64,1) forwards":"none",
      background:"rgba(30,27,46,0.72)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
      border:"1px solid rgba(255,255,255,0.08)", borderRadius:18, overflow:"hidden", cursor:"pointer",
      boxShadow:"0 4px 24px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column"
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(139,92,246,0.45)";e.currentTarget.style.boxShadow=`0 8px 36px ${gig.glow}`}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.25)"}}
    >
      {/* Thumbnail */}
      <div style={{ height:150, background:`linear-gradient(${gig.gradient})`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 30% 50%,rgba(255,255,255,0.12) 0%,transparent 70%)" }}/>
        <div style={{ position:"absolute", top:10, left:12 }}><Badge label={gig.badge}/></div>
        {/* Save btn */}
        <button onClick={e=>{e.stopPropagation();onToggleSave(gig.id)}} style={{ position:"absolute", top:10, right:12, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)", border:"none", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color: isSaved?"#f87171":"rgba(255,255,255,0.7)", fontSize:15 }}>{isSaved?"♥":"♡"}</button>
        {score !== undefined && <div style={{ position:"absolute", bottom:10, left:12, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", padding:"3px 10px", borderRadius:10 }}>
          <span style={{ fontSize:12, color:"#fff", fontWeight:700 }}>Match: <span style={{ color: score>=75?"#34d399":score>=50?"#fbbf24":"#f87171" }}>{score}%</span></span>
        </div>}
        <div style={{ position:"absolute", bottom:10, right:12 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.7)", background:"rgba(0,0,0,0.3)", backdropFilter:"blur(6px)", padding:"3px 9px", borderRadius:10 }}>{totalApplications} applied</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"15px 16px 16px", display:"flex", flexDirection:"column", flex:1 }}>
        {/* Client */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <Avatar initials={DB.users.find(u=>u.id===gig.client_id)?.avatar_initials||"??"} size={28} gradient="linear-gradient(135deg,#374151,#4b5563)"/>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:500 }}>{DB.users.find(u=>u.id===gig.client_id)?.full_name}</span>
        </div>
        {/* Title */}
        <p style={{ fontSize:15, fontWeight:700, color:"#fff", lineHeight:1.35, flex:1, fontFamily:"'Syne'", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{gig.title}</p>
        {/* Tags */}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", margin:"8px 0" }}>
          {tags.map(t => <span key={t} style={{ fontSize:11, color:"rgba(196,181,253,0.88)", background:"rgba(139,92,246,0.15)", padding:"3px 9px", borderRadius:6, border:"1px solid rgba(139,92,246,0.2)", fontWeight:500 }}>{t}</span>)}
        </div>
        {/* Price */}
        <div style={{ marginTop:"auto", paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Starting at</span>
          <span style={{ fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'Syne'" }}>${tiers.basic?.price || tiers.Basic?.price || "—"}<span style={{ fontSize:11, fontWeight:400, color:"rgba(255,255,255,0.35)" }}> USD</span></span>
        </div>
      </div>
    </div>
  );
}

/* ── Gig Detail Modal ──────────────────────────────────────────────────── */
function GigDetailModal({ gig, tags, tiers, score, breakdown, successRate, onClose, currentUser }) {
  const [tier, setTier]         = useState("standard");
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCover] = useState("");
  const [applied, setApplied]   = useState(false);
  const [msgs, setMsgs]         = useState([]);
  const [newMsg, setNewMsg]     = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const tierData = tiers[tier] || {};
  const myApp    = DB.applications.find(a => a.gig_id === gig.id && DB.profiles.find(p=>p.id===a.freelancer_id)?.user_id === currentUser?.id);

  useEffect(() => {
    if (myApp) {
      setApplied(true);
      setMsgs(DB.messages.filter(m => m.app_id === myApp.id));
    }
  }, [myApp]);

  const submitApp = () => {
    const profile = DB.profiles.find(p=>p.user_id===currentUser.id);
    if (!profile) return;
    const id = "app_new_" + Date.now();
    const mySkills = DB.skills.filter(s=>s.freelancer_id===profile.id).map(s=>s.skill_name);
    const { score: ms } = computeMatch(mySkills, profile.availability, gig, tags, DB.applications.filter(a=>a.gig_id===gig.id).length);
    DB.applications.push({ id, gig_id:gig.id, freelancer_id:profile.id, tier_chosen:tier, cover_letter:coverLetter, status:"pending", match_score:ms, created_at:new Date().toISOString() });
    profile.total_applied = (profile.total_applied||0)+1;
    setApplied(true);
    setShowApply(false);
    setMsgs([]);
  };

  const sendMsg = () => {
    if (!newMsg.trim() || !myApp) return;
    const m = { id:"msg_"+Date.now(), app_id:myApp.id, sender_id:currentUser.id, body:newMsg, read:false, created_at:new Date().toISOString() };
    DB.messages.push(m);
    setMsgs(prev=>[...prev, m]);
    setNewMsg("");
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", background:"rgba(10,8,16,0.72)", backdropFilter:"blur(6px)" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ marginLeft:"auto", width:"100%", maxWidth:660, background:"linear-gradient(180deg,rgba(24,21,40,0.97),rgba(18,15,32,0.99))", border:"1px solid rgba(255,255,255,0.08)", overflowY:"auto", maxHeight:"100vh", animation:"slideIn .38s cubic-bezier(.34,1.56,.64,1) forwards", boxShadow:"-12px 0 60px rgba(0,0,0,0.5)" }}>
        {/* Hero */}
        <div style={{ height:210, background:`linear-gradient(${gig.gradient})`, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 25% 60%,rgba(255,255,255,0.13) 0%,transparent 65%)" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 45%,rgba(18,15,32,0.97) 100%)" }}/>
          <button onClick={onClose} style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.1)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ padding:"22px 26px 36px", marginTop:-28, position:"relative" }}>
          {/* Client */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <Avatar initials={DB.users.find(u=>u.id===gig.client_id)?.avatar_initials||"??"} size={42} gradient="linear-gradient(135deg,#374151,#4b5563)"/>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{DB.users.find(u=>u.id===gig.client_id)?.full_name}</p>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.38)" }}>Client</span>
            </div>
            <Badge label={gig.badge}/>
          </div>

          <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'Syne'", lineHeight:1.3, marginBottom:10 }}>{gig.title}</h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginBottom:18 }}>{gig.description}</p>

          {/* Tags */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
            {tags.map(t => <span key={t} style={{ fontSize:12, color:"rgba(196,181,253,0.9)", background:"rgba(139,92,246,0.15)", padding:"4px 12px", borderRadius:8, fontWeight:600, border:"1px solid rgba(139,92,246,0.25)" }}>{t}</span>)}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:18, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:3 }}>
            {["details","messages"].map(tab => (
              <button key={tab} onClick={()=>setActiveTab(tab)} style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", background:activeTab===tab?"rgba(139,92,246,0.25)":"transparent", color:activeTab===tab?"#c4b5fd":"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{tab}{tab==="messages"&&msgs.length?" ("+msgs.length+")":""}</button>
            ))}
          </div>

          {activeTab === "details" && <>
            {/* Tiers */}
            <div style={{ border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, overflow:"hidden", marginBottom:18 }}>
              <div style={{ display:"flex" }}>
                {["basic","standard","premium"].map(t => (
                  <button key={t} onClick={()=>setTier(t)} style={{ flex:1, padding:"11px 4px", border:"none", cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", background:tier===t?`linear-gradient(${gig.gradient})`:"rgba(255,255,255,0.04)", color:tier===t?"#fff":"rgba(255,255,255,0.4)", borderRight:t!=="premium"?"1px solid rgba(255,255,255,0.08)":"none" }}>{t}</button>
                ))}
              </div>
              <div style={{ padding:"18px 20px", background:"rgba(255,255,255,0.03)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:27, fontWeight:800, color:"#fff", fontFamily:"'Syne'" }}>${tierData.price}<span style={{ fontSize:12, fontWeight:400, color:"rgba(255,255,255,0.35)" }}> USD</span></span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.08)", padding:"4px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)" }}>⏱ {tierData.days} days</span>
                </div>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginTop:10 }}>{tierData.desc}</p>
              </div>
            </div>

            {/* Match breakdown */}
            {breakdown && <div style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(196,181,253,0.7)", textTransform:"uppercase", letterSpacing:0.8, marginBottom:10 }}>Match Breakdown</p>
              {[["Skills",breakdown.skillMatch,"#8b5cf6"],["Availability",breakdown.availability,"#06b6d4"],["Demand",breakdown.demand,"#fbbf24"]].map(([label,val,color])=>(
                <div key={label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", width:75 }}>{label}</span>
                  <div style={{ flex:1, height:6, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}><div style={{ width:`${val}%`, height:"100%", background:color, borderRadius:3, transition:"width .5s" }}/></div>
                  <span style={{ fontSize:12, fontWeight:700, color, width:35 }}>{val}%</span>
                </div>
              ))}
            </div>}

            {/* Success rate */}
            <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.1),rgba(52,211,153,0.06))", border:"1px solid rgba(52,211,153,0.25)", borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:28, fontWeight:800, color:"#34d399", fontFamily:"'Syne'" }}>{successRate}%</div>
                <div style={{ fontSize:9.5, color:"rgba(52,211,153,0.7)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Success Rate</div>
              </div>
              <div style={{ fontSize:13, color:"rgba(52,211,153,0.85)", lineHeight:1.55 }}>Predicted from similar freelancer profiles who completed comparable gigs.</div>
            </div>

            {/* CTA */}
            {currentUser?.role === "freelancer" && !applied && !showApply && (
              <button className="tb-cta" onClick={()=>setShowApply(true)} style={{ width:"100%", padding:"15px 0", borderRadius:14, border:"none", background:`linear-gradient(${gig.gradient})`, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"'Syne'", boxShadow:`0 4px 24px ${gig.glow}` }}>
                Apply Now — ${tierData.price}
              </button>
            )}
            {applied && <div style={{ textAlign:"center", padding:14, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.25)", borderRadius:12 }}><span style={{ color:"#34d399", fontWeight:700, fontSize:14 }}>✓ You've already applied to this gig</span></div>}

            {/* Apply form */}
            {showApply && <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:18, marginTop:4 }}>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:10 }}>Cover letter (optional)</p>
              <textarea value={coverLetter} onChange={e=>setCover(e.target.value)} rows={3} placeholder="Tell the client why you're the best fit…" style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:13, outline:"none", resize:"vertical", fontFamily:"'DM Sans'" }}/>
              <div style={{ display:"flex", gap:10, marginTop:12 }}>
                <button className="tb-cta" onClick={submitApp} style={{ flex:1, padding:"11px 0", borderRadius:10, border:"none", background:"linear-gradient(135deg,#8b5cf6,#6366f1)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 3px 16px rgba(139,92,246,0.4)" }}>Submit Application</button>
                <button onClick={()=>setShowApply(false)} style={{ padding:"11px 18px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", fontSize:14, cursor:"pointer" }}>Cancel</button>
              </div>
            </div>}

            <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.28)", marginTop:14 }}>You won't be charged yet</p>
          </>}

          {/* Messages tab */}
          {activeTab === "messages" && <div>
            {!myApp && <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, textAlign:"center", padding:24 }}>Apply to this gig to unlock messaging.</p>}
            {myApp && <>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16, maxHeight:280, overflowY:"auto", paddingRight:4 }}>
                {msgs.map(m => {
                  const isMe = m.sender_id === currentUser.id;
                  const sender = DB.users.find(u=>u.id===m.sender_id);
                  return <div key={m.id} style={{ display:"flex", justifyContent: isMe?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"75%", display:"flex", gap:8, flexDirection: isMe?"row-reverse":"row", alignItems:"flex-end" }}>
                      <Avatar initials={sender?.avatar_initials||"?"} size={26} gradient={isMe?"linear-gradient(135deg,#8b5cf6,#6366f1)":"linear-gradient(135deg,#374151,#4b5563)"}/>
                      <div style={{ background: isMe?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.07)", border:`1px solid ${isMe?"rgba(139,92,246,0.35)":"rgba(255,255,255,0.1)"}`, borderRadius:"12px 12px "+(isMe?"4px 12px":"12px 4px"), padding:"10px 14px" }}>
                        <p style={{ fontSize:13, color:"#fff", lineHeight:1.45, margin:0 }}>{m.body}</p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"4px 0 0", textAlign: isMe?"right":"left" }}>{new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</p>
                      </div>
                    </div>
                  </div>;
                })}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message…" className="tb-input" style={{ flex:1, padding:"11px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:13, outline:"none", fontFamily:"'DM Sans'" }}/>
                <button onClick={sendMsg} style={{ padding:"0 18px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#8b5cf6,#6366f1)", color:"#fff", fontSize:16, cursor:"pointer" }}>↑</button>
              </div>
            </>}
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ── My Applications Panel ────────────────────────────────────────────── */
function MyApplications({ currentUser, onClose }) {
  const profile = DB.profiles.find(p=>p.user_id===currentUser.id);
  const apps = profile ? DB.applications.filter(a=>a.freelancer_id===profile.id).map(a=>({ ...a, gig: DB.gigs.find(g=>g.id===a.gig_id) })).filter(a=>a.gig) : [];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(10,8,16,0.72)", backdropFilter:"blur(6px)", display:"flex" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ marginLeft:"auto", width:"100%", maxWidth:520, background:"linear-gradient(180deg,rgba(24,21,40,0.97),rgba(18,15,32,0.99))", border:"1px solid rgba(255,255,255,0.08)", overflowY:"auto", maxHeight:"100vh", animation:"slideIn .38s cubic-bezier(.34,1.56,.64,1) forwards", boxShadow:"-12px 0 60px rgba(0,0,0,0.5)", padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:"'Syne'" }}>My Applications</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>
        {apps.length === 0 && <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, textAlign:"center", padding:40 }}>No applications yet. Browse gigs and apply!</p>}
        {apps.map((a,i) => (
          <div key={a.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:16, marginBottom:12, animation:`fadeUp .4s ${i*60}ms cubic-bezier(.34,1.56,.64,1) both` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <p style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:"'Syne'", margin:0, flex:1, paddingRight:12 }}>{a.gig.title}</p>
              <StatusDot status={a.status}/>
            </div>
            <div style={{ display:"flex", gap:14, marginTop:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Tier: <span style={{ color:"#c4b5fd", fontWeight:600, textTransform:"capitalize" }}>{a.tier_chosen}</span></span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Match: <span style={{ color:"#34d399", fontWeight:600 }}>{a.match_score}%</span></span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Applied: {new Date(a.created_at).toLocaleDateString()}</span>
            </div>
            {a.cover_letter && <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:10, fontStyle:"italic", lineHeight:1.5 }}>"{a.cover_letter}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Profile Editor Panel ─────────────────────────────────────────────── */
function ProfilePanel({ currentUser, onClose }) {
  const profile = DB.profiles.find(p=>p.user_id===currentUser.id);
  const mySkills = DB.skills.filter(s=>s.freelancer_id===profile?.id);
  const [bio, setBio]             = useState(profile?.bio || "");
  const [availability, setAvail]  = useState(profile?.availability || "Next Week");
  const [hourlyRate, setRate]     = useState(profile?.hourly_rate || 0);
  const [newSkill, setNewSkill]   = useState("");
  const [skillProf, setSkillProf] = useState("Intermediate");
  const [saved, setSaved]         = useState(false);

  const saveProfile = () => {
    if (profile) { profile.bio = bio; profile.availability = availability; profile.hourly_rate = hourlyRate; }
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (DB.skills.find(s=>s.freelancer_id===profile.id && s.skill_name.toLowerCase()===newSkill.toLowerCase())) return;
    DB.skills.push({ freelancer_id:profile.id, skill_name:newSkill, proficiency:skillProf });
    setNewSkill("");
  };

  const removeSkill = (name) => {
    const idx = DB.skills.findIndex(s=>s.freelancer_id===profile.id && s.skill_name===name);
    if (idx !== -1) DB.skills.splice(idx, 1);
  };

  // force re-render hack for skill list
  const [, forceUpdate] = useState(0);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(10,8,16,0.72)", backdropFilter:"blur(6px)", display:"flex" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ marginLeft:"auto", width:"100%", maxWidth:520, background:"linear-gradient(180deg,rgba(24,21,40,0.97),rgba(18,15,32,0.99))", border:"1px solid rgba(255,255,255,0.08)", overflowY:"auto", maxHeight:"100vh", animation:"slideIn .38s cubic-bezier(.34,1.56,.64,1) forwards", boxShadow:"-12px 0 60px rgba(0,0,0,0.5)", padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:"'Syne'" }}>My Profile</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        {/* Avatar + name */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <Avatar initials={currentUser.avatar_initials} size={64}/>
          <p style={{ fontSize:17, fontWeight:700, color:"#fff", marginTop:10, fontFamily:"'Syne'" }}>{currentUser.full_name}</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>{currentUser.email}</p>
        </div>

        {/* Fields */}
        <label style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.7 }}>Bio</label>
        <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:13, outline:"none", resize:"vertical", marginTop:6, marginBottom:16, fontFamily:"'DM Sans'" }}/>

        <label style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.7 }}>Availability</label>
        <div style={{ display:"flex", gap:8, marginTop:6, marginBottom:16, flexWrap:"wrap" }}>
          {["This Week","Next Week","Next 2 Weeks","Next Month"].map(a => (
            <button key={a} onClick={()=>setAvail(a)} style={{ padding:"6px 14px", borderRadius:10, border:availability===a?"1px solid rgba(139,92,246,0.5)":"1px solid rgba(255,255,255,0.1)", background:availability===a?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.05)", color:availability===a?"#c4b5fd":"rgba(255,255,255,0.5)", fontSize:13, fontWeight:availability===a?700:500, cursor:"pointer" }}>{a}</button>
          ))}
        </div>

        <label style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.7 }}>Hourly Rate ($)</label>
        <input value={hourlyRate} onChange={e=>setRate(Number(e.target.value))} type="number" className="tb-input" style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, outline:"none", marginTop:6, marginBottom:16 }}/>

        {/* Skills */}
        <label style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.7 }}>Skills</label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", margin:"8px 0 12px" }}>
          {DB.skills.filter(s=>s.freelancer_id===profile?.id).map(s => (
            <span key={s.skill_name} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(196,181,253,0.9)", background:"rgba(139,92,246,0.15)", padding:"4px 10px", borderRadius:8, border:"1px solid rgba(139,92,246,0.2)" }}>
              {s.skill_name} <span style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"capitalize" }}>({s.proficiency})</span>
              <span onClick={()=>{removeSkill(s.skill_name);forceUpdate(n=>n+1)}} style={{ color:"#f87171", cursor:"pointer", fontSize:14 }}>×</span>
            </span>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(addSkill(),forceUpdate(n=>n+1))} placeholder="Add a skill…" className="tb-input" style={{ flex:1, padding:"9px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:13, outline:"none" }}/>
          <select value={skillProf} onChange={e=>setSkillProf(e.target.value)} style={{ padding:"9px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", fontSize:13, outline:"none" }}>
            <option value="Beginner" style={{ background:"#1a1730" }}>Beginner</option>
            <option value="Intermediate" style={{ background:"#1a1730" }}>Intermediate</option>
            <option value="Expert" style={{ background:"#1a1730" }}>Expert</option>
          </select>
          <button onClick={()=>{addSkill();forceUpdate(n=>n+1)}} style={{ padding:"0 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#8b5cf6,#6366f1)", color:"#fff", fontSize:18, cursor:"pointer" }}>+</button>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          {[["Completed",profile?.success_count||0,"#34d399"],["Applied",profile?.total_applied||0,"#60a5fa"],["Rate","$"+(profile?.hourly_rate||0)+"/h","#fbbf24"]].map(([label,val,color])=>(
            <div key={label} style={{ flex:1, background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 10px", textAlign:"center", border:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"'Syne'" }}>{val}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        <button className="tb-cta" onClick={saveProfile} style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#8b5cf6,#6366f1)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Syne'", boxShadow:"0 3px 18px rgba(139,92,246,0.4)" }}>
          {saved ? "✓ Saved!" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("All");
  const [sortBy,      setSortBy]      = useState("popular");
  const [view,        setView]        = useState("browse"); // browse | match
  const [selectedGig, setSelectedGig] = useState(null);
  const [panel,       setPanel]       = useState(null);   // "apps" | "profile" | "saved"

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser}/>;

  /* ── data ────────────────────────────────────────────────────────────── */
  const savedSet = new Set(DB.savedGigs.filter(s=>s.user_id===currentUser.id).map(s=>s.gig_id));

  const toggleSave = (gigId) => {
    const idx = DB.savedGigs.findIndex(s=>s.user_id===currentUser.id && s.gig_id===gigId);
    if (idx !== -1) DB.savedGigs.splice(idx, 1);
    else DB.savedGigs.push({ user_id:currentUser.id, gig_id:gigId });
  };

  const enrichedGigs = useMemo(() => {
    return DB.gigs.filter(g => g.status === "open")
      .filter(g => category === "All" || g.category === category)
      .filter(g => {
        const q = search.toLowerCase();
        return !q || g.title.toLowerCase().includes(q) || (DB.gigTags[g.id]||[]).some(t=>t.toLowerCase().includes(q)) || g.category.toLowerCase().includes(q);
      })
      .map(g => ({
        ...g,
        tags: DB.gigTags[g.id] || [],
        tiers: DB.gigTiers[g.id] || {},
        totalApplications: DB.applications.filter(a=>a.gig_id===g.id).length,
      }))
      .sort((a,b) => {
        if (sortBy==="popular") return b.totalApplications - a.totalApplications;
        if (sortBy==="budget")  return b.budget_max - a.budget_max;
        if (sortBy==="newest")  return b.id.localeCompare(a.id);
        return 0;
      });
  }, [search, category, sortBy]);

  const matches = useMemo(() => currentUser.role === "freelancer" ? runMatch(currentUser.id) : [], [currentUser]);

  const displayList = view === "match" && currentUser.role === "freelancer" ? matches : enrichedGigs.map(g=>({ gig:g, tags:g.tags, tiers:g.tiers, score:undefined, breakdown:undefined, successRate:undefined, totalApplications:g.totalApplications }));

  const CATEGORIES = [
    { id:"All", icon:"◆" },{ id:"Web Dev", icon:"🌐" },{ id:"Design", icon:"🎨" },
    { id:"Marketing", icon:"📣" },{ id:"Data & AI", icon:"🤖" },{ id:"Mobile", icon:"📱" },
    { id:"Video", icon:"🎬" },
  ];

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", background:"#0f0d1a", color:"#fff", fontFamily:"'DM Sans', sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{CSS}</style>

      {/* Ambient orbs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"4%", left:"8%",  width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.17) 0%,transparent 70%)", animation:"orb1 14s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", top:"55%", right:"6%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 70%)", animation:"orb2 18s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"8%", left:"38%", width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.11) 0%,transparent 70%)", animation:"orb3 20s ease-in-out infinite" }}/>
      </div>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(15,13,26,0.72)", backdropFilter:"blur(22px)", WebkitBackdropFilter:"blur(22px)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 20px" }}>
        <div style={{ maxWidth:1140, margin:"0 auto", height:62, display:"flex", alignItems:"center", gap:18 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#8b5cf6,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 14px rgba(139,92,246,0.45)" }}>
              <span style={{ color:"#fff", fontSize:17, fontWeight:800, fontFamily:"'Syne'" }}>T</span>
            </div>
            <span style={{ fontSize:21, fontWeight:800, fontFamily:"'Syne'", color:"#fff" }}>Talent<span style={{ color:"#8b5cf6" }}>Bridge</span></span>
          </div>

          {/* Search */}
          <div style={{ flex:1, maxWidth:440, position:"relative" }}>
            <input className="tb-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gigs, skills, categories…" style={{ width:"100%", padding:"9px 40px 9px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, outline:"none", transition:"border .25s, box-shadow .25s" }}/>
            <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)", pointerEvents:"none" }}>🔍</span>
          </div>

          {/* Nav links */}
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
            {[
              { label:"Browse", key:"browse" },
              { label:"AI Match", key:"match" },
            ].map(n => (
              <button key={n.key} onClick={()=>setView(n.key)} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:view===n.key?"rgba(139,92,246,0.25)":"transparent", color:view===n.key?"#c4b5fd":"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, cursor:"pointer" }}>{n.label}</button>
            ))}
            <button onClick={()=>setPanel("apps")} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, cursor:"pointer" }}>Applications</button>
            <button onClick={()=>setPanel("saved")} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, cursor:"pointer" }}>Saved</button>
            <div style={{ width:1, height:28, background:"rgba(255,255,255,0.1)", margin:"0 4px" }}/>
            <button onClick={()=>setPanel("profile")} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}><Avatar initials={currentUser.avatar_initials} size={34}/></button>
            <button onClick={()=>setCurrentUser(null)} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer" }}>Logout</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"56px 20px 44px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:30, padding:"6px 18px", marginBottom:20 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#8b5cf6", boxShadow:"0 0 8px #8b5cf6", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:13, color:"rgba(196,181,253,0.9)", fontWeight:600 }}>AI-Powered Matching — Live</span>
        </div>
        <h1 style={{ fontSize:46, fontWeight:800, fontFamily:"'Syne'", lineHeight:1.1, marginBottom:12, maxWidth:640, margin:"0 auto 12px" }}>
          Your talent deserves<br/>
          <span style={{ background:"linear-gradient(90deg,#8b5cf6,#a78bfa,#c4b5fd,#8b5cf6)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 3.5s linear infinite" }}>the perfect match</span>
        </h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.42)", maxWidth:480, margin:"0 auto", lineHeight:1.6 }}>
          Smart gig matching · Real-time messaging · Reviews & reputation
        </p>
        {/* Trending pills */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:18 }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginRight:2 }}>Trending:</span>
          {["React","Python","UI/UX","SEO","AWS","Mobile"].map(t => (
            <span key={t} className="tb-pill" onClick={()=>setSearch(t)} style={{ fontSize:13, color:"rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.07)", padding:"5px 14px", borderRadius:18, cursor:"pointer", border:"1px solid rgba(255,255,255,0.1)" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ position:"relative", zIndex:1, maxWidth:1140, margin:"0 auto", padding:"0 20px 100px" }}>

        {/* Category pills */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
          {CATEGORIES.map(c => {
            const active = category === c.id;
            return <button key={c.id} className="tb-pill" onClick={()=>setCategory(c.id)} style={{ padding:"7px 16px", borderRadius:22, border:active?"1px solid rgba(139,92,246,0.5)":"1px solid rgba(255,255,255,0.1)", background:active?"rgba(139,92,246,0.18)":"rgba(255,255,255,0.05)", color:active?"#c4b5fd":"rgba(255,255,255,0.5)", fontWeight:active?700:500, fontSize:13.5, cursor:"pointer", boxShadow:active?"0 2px 10px rgba(139,92,246,0.2)":"none" }}>{c.icon} {c.id}</button>;
          })}
        </div>

        {/* Results bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <span style={{ fontSize:14, color:"rgba(255,255,255,0.38)" }}><strong style={{ color:"rgba(255,255,255,0.72)" }}>{displayList.length}</strong> {view==="match"?"matches":"services"} found</span>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Sort by</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"6px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", fontSize:13, outline:"none" }}>
              <option value="popular" style={{ background:"#1a1730" }}>Most Popular</option>
              <option value="budget"  style={{ background:"#1a1730" }}>Highest Budget</option>
              <option value="newest" style={{ background:"#1a1730" }}>Newest</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(256px,1fr))", gap:20 }}>
          {displayList.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:70 }}>
            <div style={{ fontSize:50, marginBottom:12 }}>🔍</div>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:17, fontFamily:"'Syne'" }}>No results found</p>
            <p style={{ color:"rgba(255,255,255,0.25)", fontSize:14, marginTop:6 }}>Try different keywords or clear filters</p>
          </div>}
          {displayList.map((item, i) => {
            const g = item.gig || item;
            return <GigCard key={g.id} gig={g} tags={item.tags} tiers={item.tiers} score={item.score} successRate={item.successRate} totalApplications={item.totalApplications} delay={i*55} isSaved={savedSet.has(g.id)} onToggleSave={toggleSave} onClick={()=>setSelectedGig(item)}/>;
          })}
        </div>
      </div>

      {/* ── MODALS / PANELS ── */}
      {selectedGig && <GigDetailModal gig={selectedGig.gig||selectedGig} tags={selectedGig.tags} tiers={selectedGig.tiers} score={selectedGig.score} breakdown={selectedGig.breakdown} successRate={selectedGig.successRate} onClose={()=>setSelectedGig(null)} currentUser={currentUser}/>}
      {panel === "apps"    && <MyApplications currentUser={currentUser} onClose={()=>setPanel(null)}/>}
      {panel === "profile" && <ProfilePanel   currentUser={currentUser} onClose={()=>setPanel(null)}/>}
      {panel === "saved"   && <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(10,8,16,0.72)", backdropFilter:"blur(6px)", display:"flex" }} onClick={()=>setPanel(null)}>
        <div onClick={e=>e.stopPropagation()} style={{ marginLeft:"auto", width:"100%", maxWidth:520, background:"linear-gradient(180deg,rgba(24,21,40,0.97),rgba(18,15,32,0.99))", border:"1px solid rgba(255,255,255,0.08)", overflowY:"auto", maxHeight:"100vh", animation:"slideIn .38s cubic-bezier(.34,1.56,.64,1) forwards", boxShadow:"-12px 0 60px rgba(0,0,0,0.5)", padding:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
            <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", fontFamily:"'Syne'" }}>Saved Gigs</h2>
            <button onClick={()=>setPanel(null)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:20, cursor:"pointer" }}>✕</button>
          </div>
          {DB.savedGigs.filter(s=>s.user_id===currentUser.id).length===0 && <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, textAlign:"center", padding:40 }}>No saved gigs yet. Tap ♡ on any gig to save it.</p>}
          {DB.savedGigs.filter(s=>s.user_id===currentUser.id).map((s,i)=>{
            const g = DB.gigs.find(gig=>gig.id===s.gig_id);
            if (!g) return null;
            const tags = DB.gigTags[g.id]||[];
            return <div key={g.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:16, marginBottom:10, animation:`fadeUp .4s ${i*60}ms cubic-bezier(.34,1.56,.64,1) both`, cursor:"pointer" }} onClick={()=>{ setSelectedGig({ gig:g, tags, tiers:DB.gigTiers[g.id]||{}, totalApplications: DB.applications.filter(a=>a.gig_id===g.id).length }); setPanel(null); }}>
              <p style={{ fontSize:15, fontWeight:700, color:"#fff", margin:"0 0 6px", fontFamily:"'Syne'" }}>{g.title}</p>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{tags.map(t=><span key={t} style={{ fontSize:11, color:"rgba(196,181,253,0.88)", background:"rgba(139,92,246,0.15)", padding:"2px 8px", borderRadius:6, border:"1px solid rgba(139,92,246,0.2)" }}>{t}</span>)}</div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"8px 0 0" }}>Starting at ${(DB.gigTiers[g.id]||{}).basic?.price || "—"}</p>
            </div>;
          })}
        </div>
      </div>}
    </div>
  );
}
