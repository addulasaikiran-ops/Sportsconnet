"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, Bell, Bookmark, BriefcaseBusiness, Check, ChevronDown, CircleHelp,
  Compass, Ellipsis, Filter, Flame, Heart, Home, MapPin, Menu, MessageCircle,
  Play, Plus, Search, Send, ShieldCheck, SlidersHorizontal, Sparkles, Trophy,
  UserRound, Users, Zap
} from "lucide-react";

type Profile = { name: string; role: string; sport: string; location: string; initials: string; color: string; verified?: boolean };
type Opportunity = { title: string; org: string; type: string; location: string; deadline: string; tag: string };

const athletes: Profile[] = [
  { name: "Arjun Reddy", role: "Cricket · All-rounder", sport: "Cricket", location: "Hyderabad, India", initials: "AR", color: "avatar-blue", verified: true },
  { name: "Meera Nair", role: "Track & Field · Sprinter", sport: "Athletics", location: "Bengaluru, India", initials: "MN", color: "avatar-pink", verified: true },
  { name: "Kabir Singh", role: "Football · Midfielder", sport: "Football", location: "Pune, India", initials: "KS", color: "avatar-orange" }
];

const opportunities: Opportunity[] = [
  { title: "State-level cricket trials", org: "Deccan Sports Academy", type: "Open trials", location: "Hyderabad, Telangana", deadline: "Closes in 5 days", tag: "CRICKET" },
  { title: "U-19 football scouting camp", org: "United Athletic Club", type: "Talent scouting", location: "Chennai, Tamil Nadu", deadline: "Closes in 8 days", tag: "FOOTBALL" },
  { title: "Athletics development program", org: "National Performance Centre", type: "Scholarship", location: "Bengaluru, Karnataka", deadline: "Closes in 12 days", tag: "ATHLETICS" }
];

const feedPosts = [
  { name: "Rohan Sharma", initials: "RS", color: "avatar-green", role: "Cricket · Fast bowler", time: "2h", text: "Six weeks of early mornings, hard sessions, and showing up even when it was tough. Happy to share that I recorded a new personal best today. The work continues. 💪", image: "cricket", likes: 128, comments: 18, badge: "ATHLETE SPOTLIGHT" },
  { name: "Ananya Patel", initials: "AP", color: "avatar-purple", role: "Athletics · 400m sprinter", time: "5h", text: "A reminder for every young athlete: your progress isn't always linear. Trust your training, celebrate the small wins, and keep going. 🏃‍♀️", image: "", likes: 86, comments: 12, badge: "" }
];

const navItems = [
  { label: "Home", icon: Home },
  { label: "Discover", icon: Compass },
  { label: "Opportunities", icon: BriefcaseBusiness },
  { label: "Messages", icon: MessageCircle },
  { label: "Saved", icon: Bookmark }
];

function Brand() {
  return <a className="brand" href="#" aria-label="SportsConnect home"><span className="brand-mark"><Activity size={21} strokeWidth={2.7} /></span><span>sports<span className="brand-connect">connect</span></span></a>;
}

function Avatar({ initials, color, size = "normal" }: { initials: string; color: string; size?: "normal" | "small" | "large" }) {
  return <span className={`avatar ${color} avatar-${size}`}>{initials}</span>;
}

function Sidebar({ active, onNavigate, mobileNavOpen }: { active: string; onNavigate: (label: string) => void; mobileNavOpen: boolean }) {
  return <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
    <div className="sidebar-brand"><Brand /></div>
    <div className="workspace-label">YOUR SPACE</div>
    <nav className="main-nav" aria-label="Main navigation">
      {navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${active === label ? "active" : ""}`} aria-current={active === label ? "page" : undefined} onClick={() => onNavigate(label)}><Icon size={19} /><span>{label}</span>{label === "Messages" && <span className="nav-count">3</span>}</button>)}
    </nav>
    <div className="sidebar-divider" />
    <div className="workspace-label">YOUR NETWORK</div>
    <button className="nav-item" onClick={() => onNavigate("Athletes")}><Users size={19} /><span>Athletes</span></button>
    <button className="nav-item" onClick={() => onNavigate("Coaches & clubs")}><ShieldCheck size={19} /><span>Coaches & clubs</span></button>
    <button className="nav-item" onClick={() => onNavigate("Leaderboard")}><Trophy size={19} /><span>Leaderboard</span></button>
    <div className="sidebar-promo">
      <div className="promo-icon"><Sparkles size={18} /></div>
      <strong>Your next big break starts here.</strong>
      <p>Complete your athlete profile to stand out to coaches.</p>
      <div className="progress-track"><span /></div>
      <div className="progress-meta"><span>Profile strength</span><strong>65%</strong></div>
      <button className="promo-button" onClick={() => onNavigate("My profile")}>Complete profile <span>↗</span></button>
    </div>
    <button className="sidebar-help" onClick={() => onNavigate("Help centre")}><CircleHelp size={18} /> Help centre</button>
    <button className="mini-profile" onClick={() => onNavigate("My profile")}><Avatar initials="SK" color="avatar-navy" /><span className="mini-profile-copy"><strong>Sai Kiran</strong><small>Athlete profile</small></span><Ellipsis size={18} /></button>
  </aside>;
}

function Topbar({ onMenu, menuOpen, query, setQuery, onNavigate }: { onMenu: () => void; menuOpen: boolean; query: string; setQuery: (value: string) => void; onNavigate: (label: string) => void }) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return <header className="topbar">
    <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open menu" aria-expanded={menuOpen}><Menu size={21} /></button>
    <div className="top-search"><Search size={18} /><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search athletes, coaches, sports..." aria-label="Search athletes, coaches, and sports" /><kbd aria-hidden="true">⌘ K</kbd></div>
    <div className="topbar-actions"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => onNavigate("Notifications")}><Bell size={19} /><i /></button><span className="topbar-divider" /><button className="top-user" onClick={() => onNavigate("My profile")}><Avatar initials="SK" color="avatar-navy" size="small" /><span>Sai Kiran</span><ChevronDown size={15} /></button></div>
  </header>;
}

function CreatePost({ onPost }: { onPost: (text: string) => void }) {
  const [text, setText] = useState("");
  return <section className="panel composer">
    <div className="composer-top"><Avatar initials="SK" color="avatar-navy" /><button className="composer-input" onClick={() => document.getElementById("post-text")?.focus()}>Share a milestone, training update, or highlight...</button></div>
    <textarea id="post-text" value={text} onChange={e => setText(e.target.value)} placeholder="What's happening in your sporting journey?" rows={text ? 3 : 1} />
    <div className="composer-bottom"><div className="composer-tools"><button onClick={() => document.getElementById("post-text")?.focus()}><Play size={17} /> Video highlight</button><button onClick={() => document.getElementById("post-text")?.focus()}><Trophy size={17} /> Achievement</button></div><button className="button button-primary button-small" disabled={!text.trim()} onClick={() => { onPost(text.trim()); setText(""); }}>Post <Send size={14} /></button></div>
  </section>;
}

function PostCard({ post, index }: { post: typeof feedPosts[number]; index: number }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  return <article className="panel post-card">
    <div className="post-header"><Avatar initials={post.initials} color={post.color} /><div className="post-author"><div className="author-name">{post.name} {index === 0 && <span className="verified"><Check size={10} /></span>}</div><div className="muted small-text">{post.role}</div><div className="muted post-time">{post.time} ago · <span className="globe-dot">●</span> Public</div></div><button className="icon-button post-more" aria-label="More post options"><Ellipsis size={20} /></button></div>
    {post.badge && <div className="spotlight-badge"><Flame size={13} /> {post.badge}</div>}
    <p className="post-copy">{post.text}</p>
    {post.image === "cricket" && <div className="post-media"><div className="media-overlay"><span className="media-label"><Zap size={13} /> TRAINING DIARY</span><div className="media-title">Built through<br />the work.</div><div className="media-subtitle">CONSISTENCY · DISCIPLINE · PROGRESS</div></div><div className="media-ball">SC<span>+</span></div><button className="media-play" aria-label="Play highlight"><Play size={23} fill="currentColor" /></button><div className="media-bottom"><span>01:24</span><span>HIGHLIGHT REEL</span></div></div>}
    <div className="post-stats"><span><span className="reaction-bubbles">♥</span> {post.likes + (liked ? 1 : 0)} reactions</span><button onClick={() => setCommentOpen(!commentOpen)}>{post.comments} comments</button></div>
    {commentOpen && <div className="comment-preview"><Avatar initials="SK" color="avatar-navy" size="small" /><input placeholder="Add a supportive comment..." /><button aria-label="Send comment"><Send size={16} /></button></div>}
    <div className="post-actions"><button className={liked ? "selected-action" : ""} onClick={() => setLiked(!liked)}><Heart size={18} fill={liked ? "currentColor" : "none"} /> {liked ? "Liked" : "Appreciate"}</button><button onClick={() => setCommentOpen(!commentOpen)}><MessageCircle size={18} /> Comment</button><button onClick={() => setSaved(!saved)} className={saved ? "selected-action" : ""}><Bookmark size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button></div>
  </article>;
}

function RightRail({ onNavigate, onFollow, followed }: { onNavigate: (label: string) => void; onFollow: (name: string) => void; followed: string[] }) {
  return <aside className="right-rail">
    <section className="panel rail-panel">
      <div className="panel-heading"><h3>People to connect</h3><button className="text-link" onClick={() => onNavigate("Discover")}>See all</button></div>
      <div className="suggestion-list">{athletes.map(person => <div className="suggestion" key={person.name}><Avatar initials={person.initials} color={person.color} /><div className="suggestion-copy"><strong>{person.name} {person.verified && <span className="verified"><Check size={9} /></span>}</strong><small>{person.role}</small><small className="muted"><MapPin size={11} /> {person.location}</small></div><button className={`follow-button ${followed.includes(person.name) ? "following" : ""}`} onClick={() => onFollow(person.name)}>{followed.includes(person.name) ? <Check size={15} /> : <Plus size={16} />}</button></div>)}</div>
      <button className="rail-footer-link" onClick={() => onNavigate("Discover")}>Explore your network <span>→</span></button>
    </section>
    <section className="panel rail-panel opportunity-panel">
      <div className="panel-heading"><h3>Opportunities for you</h3><button className="text-link" onClick={() => onNavigate("Opportunities")}>View all</button></div>
      {opportunities.slice(0, 2).map((item, i) => <button className="opportunity-mini" key={item.title} onClick={() => onNavigate("Opportunities")}><span className={`opportunity-icon opportunity-icon-${i}`}>{i === 0 ? <Trophy size={17} /> : <Activity size={17} />}</span><span className="opportunity-mini-copy"><strong>{item.title}</strong><small>{item.org}</small><small className="muted">{item.deadline}</small></span><span className="mini-arrow">↗</span></button>)}
      <button className="rail-footer-link" onClick={() => onNavigate("Opportunities")}>Find your next opportunity <span>→</span></button>
    </section>
    <section className="community-card"><div className="community-spark"><Sparkles size={17} /></div><strong>Great things happen when athletes connect.</strong><p>Every connection is a chance to learn, grow, and go further.</p><button onClick={() => onNavigate("Discover")}>Grow your network <span>→</span></button><div className="community-watermark">SC+</div></section>
    <div className="footer-links"><a href="#about">About</a><a href="#guidelines">Guidelines</a><a href="#privacy">Privacy</a><a href="#help">Help</a><span>© 2025 SportsConnect</span></div>
  </aside>;
}

function DiscoverView({ query, onNavigate }: { query: string; onNavigate: (label: string) => void }) {
  const [sport, setSport] = useState("All sports");
  const filtered = athletes.filter(a => (sport === "All sports" || a.sport === sport) && (a.name + a.role + a.location).toLowerCase().includes(query.toLowerCase()));
  return <section className="page-view"><div className="page-title-row"><div><span className="eyebrow">BUILD YOUR NETWORK</span><h1>Discover talent</h1><p>Meet athletes, coaches and teams that move you forward.</p></div><button className="button button-primary" onClick={() => onNavigate("My profile")}><UserRound size={16} /> My profile</button></div><div className="filter-row"><div className="filter-search"><Search size={17} /><input placeholder="Search by name, sport or location" value={query} readOnly /></div><select value={sport} onChange={e => setSport(e.target.value)} aria-label="Filter sport"><option>All sports</option><option>Cricket</option><option>Football</option><option>Athletics</option></select><button className="button button-outline"><SlidersHorizontal size={16} /> Filters</button></div><div className="discover-grid">{filtered.map((person, i) => <article className="panel talent-card" key={person.name}><div className={`talent-cover cover-${i}`}><span>{person.sport.toUpperCase()}</span><div className="cover-orbit" /></div><Avatar initials={person.initials} color={person.color} size="large" /><div className="talent-info"><h3>{person.name} {person.verified && <span className="verified"><Check size={10} /></span>}</h3><p>{person.role}</p><small><MapPin size={12} /> {person.location}</small><button className="button button-outline full-button" onClick={() => onNavigate("Athlete profile")}>View profile</button></div></article>)}</div>{filtered.length === 0 && <div className="empty-state">No profiles match that search yet.</div>}</section>;
}

function OpportunitiesView({ query }: { query: string }) {
  const [type, setType] = useState("All opportunities");
  const [applied, setApplied] = useState<string[]>([]);
  const filtered = opportunities.filter(o => (type === "All opportunities" || o.type === type) && (o.title + o.org + o.location + o.tag).toLowerCase().includes(query.toLowerCase()));
  return <section className="page-view"><div className="page-title-row"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h1>Sports opportunities</h1><p>Find trials, scholarships and programs built for your potential.</p></div><button className="button button-primary"><Plus size={17} /> Post an opportunity</button></div><div className="opportunity-hero"><div><span className="hero-kicker"><Sparkles size={14} /> YOUR POTENTIAL, IN MOTION</span><h2>The next big thing<br />could start <em>here.</em></h2><p>Discover your next trial, team, or training opportunity.</p></div><div className="hero-symbol"><Trophy size={66} strokeWidth={1.15} /><span>SC+</span></div></div><div className="filter-row"><div className="filter-search"><Search size={17} /><input value={query} readOnly placeholder="Search opportunities" /></div><select value={type} onChange={e => setType(e.target.value)} aria-label="Filter opportunity type"><option>All opportunities</option><option>Open trials</option><option>Talent scouting</option><option>Scholarship</option></select><button className="button button-outline"><Filter size={16} /> More filters</button></div><div className="opportunity-list">{filtered.map((item, i) => <article className="panel opportunity-card" key={item.title}><div className={`opportunity-large-icon opportunity-icon-${i % 3}`}>{i === 0 ? <Trophy size={23} /> : i === 1 ? <Activity size={23} /> : <Sparkles size={23} />}</div><div className="opportunity-main"><div className="opportunity-tag">{item.tag}</div><h3>{item.title}</h3><p>{item.org}</p><div className="opportunity-meta"><span><MapPin size={14} /> {item.location}</span><span><BriefcaseBusiness size={14} /> {item.type}</span></div></div><div className="opportunity-apply"><small>{item.deadline}</small><button className={`button ${applied.includes(item.title) ? "button-outline" : "button-primary"}`} onClick={() => setApplied(old => old.includes(item.title) ? old : [...old, item.title])}>{applied.includes(item.title) ? <><Check size={15} /> Applied</> : "View & apply"}</button></div></article>)}</div>{filtered.length === 0 && <div className="empty-state">No opportunities found. Try another search.</div>}</section>;
}

function MessagesView() {
  const [selected, setSelected] = useState("Meera Nair");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const chats = [{ name: "Meera Nair", initials: "MN", color: "avatar-pink", message: "Thanks for connecting!", time: "10:42 AM" }, { name: "Coach Rahul", initials: "CR", color: "avatar-blue", message: "Could you share your latest stats?", time: "Yesterday" }, { name: "Arjun Reddy", initials: "AR", color: "avatar-orange", message: "Great session today!", time: "Mon" }];
  return <section className="page-view"><div className="page-title-row"><div><span className="eyebrow">STAY IN THE GAME</span><h1>Messages</h1><p>Keep in touch with your sports community.</p></div></div><div className="panel messages-layout"><div className="chat-list"><div className="chat-list-heading">Conversations <button aria-label="New conversation"><Plus size={17} /></button></div>{chats.map(chat => <button key={chat.name} className={`chat-person ${selected === chat.name ? "chat-selected" : ""}`} onClick={() => setSelected(chat.name)}><Avatar initials={chat.initials} color={chat.color} /><span><strong>{chat.name}</strong><small>{chat.message}</small></span><small className="chat-time">{chat.time}</small></button>)}</div><div className="chat-window"><div className="chat-window-head"><Avatar initials={chats.find(c => c.name === selected)?.initials ?? "SC"} color={chats.find(c => c.name === selected)?.color ?? "avatar-blue"} /><div><strong>{selected}</strong><small><span className="online-dot" /> Active recently</small></div><button className="icon-button"><Ellipsis size={19} /></button></div><div className="chat-messages"><div className="chat-date">TODAY</div><div className="message-bubble incoming">Hey! I came across your profile. Really impressive progress lately.</div><div className="message-bubble outgoing">Thank you! Always great to connect with people who love the sport.</div><div className="message-bubble incoming">Would love to exchange training tips sometime. Keep it up! 🙌</div>{sent.map((message, i) => <div key={i} className="message-bubble outgoing">{message}</div>)}</div><form className="chat-compose" onSubmit={e => { e.preventDefault(); if (draft.trim()) { setSent(old => [...old, draft.trim()]); setDraft(""); } }}><input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a message..." /><button className="button button-primary button-small" type="submit" disabled={!draft.trim()}><Send size={16} /> Send</button></form></div></div></section>;
}

function ProfileView() {
  const [tab, setTab] = useState("Overview");
  return <section className="page-view"><div className="page-title-row"><div><span className="eyebrow">YOUR SPORTING JOURNEY</span><h1>My profile</h1><p>Show the world what you&apos;re working towards.</p></div><button className="button button-outline"><Ellipsis size={18} /> More</button></div><section className="panel profile-card"><div className="profile-cover"><span className="profile-cover-mark">SC<span>+</span></span></div><div className="profile-content"><Avatar initials="SK" color="avatar-navy" size="large" /><button className="button button-outline edit-profile">Edit profile</button><h2>Sai Kiran <span className="verified"><Check size={10} /></span></h2><p>Athlete · Aspiring all-rounder · Building my game every day</p><div className="profile-location"><MapPin size={14} /> Andhra Pradesh, India <span>·</span> <a href="#contact">Contact info</a></div><div className="profile-stats"><span><strong>248</strong> Connections</span><span><strong>1.2k</strong> Profile views</span><span><strong>65%</strong> Profile strength</span></div><div className="profile-tabs">{["Overview", "Highlights", "Achievements", "About"].map(t => <button key={t} className={tab === t ? "profile-tab-active" : ""} onClick={() => setTab(t)}>{t}</button>)}</div></div></section><div className="profile-detail-grid"><section className="panel detail-panel"><h3>{tab}</h3>{tab === "Overview" ? <><p className="detail-copy">Every athlete has a story. This is where yours takes shape — share your goals, training journey and what drives you.</p><div className="profile-empty"><Trophy size={24} /><strong>Your achievements belong here</strong><span>Add milestones and personal bests to make your profile stand out.</span><button className="button button-outline button-small">+ Add achievement</button></div></> : <div className="profile-empty"><Sparkles size={24} /><strong>Make this space yours</strong><span>Add your {tab.toLowerCase()} to help coaches and athletes get to know you.</span><button className="button button-outline button-small">+ Add {tab.toLowerCase()}</button></div>}</section><section className="panel detail-panel"><h3>Profile checklist</h3><div className="checklist-item"><span className="checklist-done"><Check size={13} /></span><span>Profile photo</span></div><div className="checklist-item"><span className="checklist-done"><Check size={13} /></span><span>Basic information</span></div><div className="checklist-item"><span className="checklist-pending" /><span>Sports experience</span><button>Add</button></div><div className="checklist-item"><span className="checklist-pending" /><span>Video highlights</span><button>Add</button></div><div className="checklist-item"><span className="checklist-pending" /><span>Achievements</span><button>Add</button></div></section></div></section>;
}

function SimpleView({ title }: { title: string }) {
  const content: Record<string, { eyebrow: string; description: string; icon: typeof Bell; items: string[] }> = {
    Notifications: { eyebrow: "STAY UP TO DATE", description: "The important moments, all in one place.", icon: Bell, items: ["Meera Nair appreciated your training update.", "Coach Rahul viewed your athlete profile.", "Arjun Reddy started following you."] },
    Saved: { eyebrow: "YOUR SHORTLIST", description: "Keep the profiles and opportunities you want to revisit.", icon: Bookmark, items: ["State-level cricket trials", "Meera Nair · Track & Field", "U-19 football scouting camp"] },
    Athletes: { eyebrow: "THE ATHLETE COMMUNITY", description: "Discover talent, exchange ideas and grow together.", icon: Users, items: athletes.map(a => a.name + " · " + a.role) },
    "Coaches & clubs": { eyebrow: "YOUR NEXT CONNECTION", description: "Meet the people and organizations shaping sport.", icon: ShieldCheck, items: ["Deccan Sports Academy", "United Athletic Club", "National Performance Centre"] },
    Leaderboard: { eyebrow: "CELEBRATE PROGRESS", description: "A little friendly motivation goes a long way.", icon: Trophy, items: ["1. Meera Nair · Athletics", "2. Arjun Reddy · Cricket", "3. Kabir Singh · Football"] },
    "My profile": { eyebrow: "YOUR SPORTING JOURNEY", description: "Your athlete profile is ready to grow.", icon: UserRound, items: ["Add sports experience", "Upload a highlight video", "Share an achievement"] },
    "Help centre": { eyebrow: "WE'RE HERE FOR YOU", description: "Find answers and get the most from SportsConnect.", icon: CircleHelp, items: ["Getting started", "Profile and verification", "Community guidelines"] },
    "Athlete profile": { eyebrow: "ATHLETE PROFILE", description: "A closer look at the talent in our community.", icon: UserRound, items: ["Sporting experience", "Highlights and achievements", "Connect with athlete"] }
  };
  const item = content[title] ?? { eyebrow: "SPORTSCONNECT", description: "Your sporting community, all in one place.", icon: Activity, items: ["Discover athletes", "Explore opportunities", "Build your network"] };
  const Icon = item.icon;
  return <section className="page-view"><div className="page-title-row"><div><span className="eyebrow">{item.eyebrow}</span><h1>{title}</h1><p>{item.description}</p></div></div><div className="simple-grid">{item.items.map((entry, i) => <article className="panel simple-item" key={entry}><span className="simple-icon"><Icon size={20} /></span><div><strong>{entry}</strong><p>{i === 0 ? "Keep building your sporting journey with SportsConnect." : "Explore, connect and make your next move."}</p></div><button className="icon-button" aria-label="Open item"><span>↗</span></button></article>)}</div><div className="simple-callout"><Sparkles size={22} /><div><strong>Every connection can open a new door.</strong><p>Keep your profile fresh and stay active in your sports community.</p></div></div></section>;
}

export default function SportsConnectShell({ initialScreen = "Home" }: { initialScreen?: string }) {
  const router = useRouter();
  const [active, setActive] = useState(initialScreen);
  const [query, setQuery] = useState("");
  const [followed, setFollowed] = useState<string[]>([]);
  const [posts, setPosts] = useState(feedPosts);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [feedTab, setFeedTab] = useState("For you");

  const pageTitle = useMemo(() => active, [active]);
  const navigate = (label: string) => {
    const routes: Record<string, string> = {
      Home: "/", Discover: "/discover", Opportunities: "/opportunities",
      Messages: "/messages", Saved: "/saved", Notifications: "/notifications",
      Athletes: "/athletes", "Coaches & clubs": "/coaches-clubs",
      Leaderboard: "/leaderboard", "My profile": "/profile",
      "Athlete profile": "/athletes/arjun-reddy", "Help centre": "/help"
    };
    setActive(label);
    setMobileNavOpen(false);
    setQuery("");
    const path = routes[label];
    if (path) router.push(path);
  };
  const toggleFollow = (name: string) => setFollowed(old => old.includes(name) ? old.filter(n => n !== name) : [...old, name]);

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    <Sidebar active={active} onNavigate={navigate} mobileNavOpen={mobileNavOpen} />
    <div className="app-main"><Topbar onMenu={() => setMobileNavOpen(!mobileNavOpen)} menuOpen={mobileNavOpen} query={query} setQuery={setQuery} onNavigate={navigate} />
      <main id="main-content" className="content-wrap" tabIndex={-1}>
        {active === "Home" ? <div className="dashboard-grid"><section className="feed-column"><div className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> YOUR SPORTS COMMUNITY</div><h1>Good morning, Sai <span className="wave">✦</span></h1><p>Your next breakthrough starts with showing up.</p></div><div className="streak-pill"><Flame size={16} /><span><strong>7 day streak</strong><small>Keep it going!</small></span></div></div><section className="welcome-banner"><div className="banner-content"><span className="banner-kicker"><Zap size={13} /> YOUR POTENTIAL IS YOUR POWER</span><h2>Every great athlete<br />starts <em>somewhere.</em></h2><p>Show your progress. Find your people.<br />Make your next move.</p><button className="banner-button" onClick={() => navigate("My profile")}>Build your athlete profile <span>→</span></button></div><div className="banner-art"><div className="banner-ring ring-one" /><div className="banner-ring ring-two" /><div className="banner-orb"><Trophy size={53} strokeWidth={1.25} /></div><span className="art-label art-label-one">TRAIN. GROW. REPEAT.</span><span className="art-label art-label-two">SC / 001</span><div className="art-stats"><span>YOUR NEXT<br /><b>LEVEL</b></span><span className="art-stat-arrow">↗</span></div></div><div className="banner-index">01 <span>/ 03</span></div></section><div className="section-heading feed-heading"><div><h2>Your feed</h2><p>Inspiration from your sports community</p></div><button className="button button-outline button-small" onClick={() => navigate("Discover")}><Compass size={15} /> Explore</button></div><div className="feed-tabs">{["For you", "Following", "Trending"].map(tab => <button key={tab} onClick={() => setFeedTab(tab)} className={feedTab === tab ? "feed-tab-active" : ""}>{tab}{tab === "Trending" && <Flame size={13} />}</button>)}</div><CreatePost onPost={text => setPosts(old => [{ name: "Sai Kiran", initials: "SK", color: "avatar-navy", role: "Athlete · Your update", time: "Just now", text, image: "", likes: 0, comments: 0, badge: "" }, ...old])} />{posts.map((post, i) => <PostCard key={post.name + post.time + i} post={post} index={i} />)}<button className="load-more" onClick={() => setPosts(old => [...old, ...feedPosts])}>Show more updates <ChevronDown size={16} /></button></section><RightRail onNavigate={navigate} onFollow={toggleFollow} followed={followed} /></div> : active === "Discover" ? <DiscoverView query={query} onNavigate={navigate} /> : active === "Opportunities" ? <OpportunitiesView query={query} /> : active === "Messages" ? <MessagesView /> : active === "My profile" || active === "Athlete profile" ? <ProfileView /> : <SimpleView title={pageTitle} />}
      </main>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{[{ label: "Home", icon: Home }, { label: "Discover", icon: Compass }, { label: "Opportunities", icon: BriefcaseBusiness }, { label: "Messages", icon: MessageCircle }, { label: "My profile", icon: UserRound }].map(({ label, icon: Icon }) => <button key={label} className={active === label ? "mobile-active" : ""} aria-current={active === label ? "page" : undefined} onClick={() => navigate(label)}><Icon size={20} /><span>{label === "Opportunities" ? "Explore" : label === "My profile" ? "Profile" : label}</span></button>)}</nav>
    </div>
  </div>;
}