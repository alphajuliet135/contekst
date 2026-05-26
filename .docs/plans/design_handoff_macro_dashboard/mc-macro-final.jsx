// Macro dashboard — REFINED (less cluttered).
// One file, three layouts (desktop / tablet / phone) and two contexts (Pilot, Work).
//
// Changes vs previous:
//   - Mantra folded into hero as an italic subtitle line (drops a whole row)
//   - "Workspace" section label dropped; widgets sit directly
//   - Tighter padding everywhere
//   - Activity heatmap shrunk to 2×14 instead of 1×28
//   - Habits/Links/People consolidated as a compact "Reference" strip
//     (3 micro-widgets, 2 items each, "see all" tail)
//   - Notes widget shorter (320 instead of 380)

const T_MX = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintMX(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotMX({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeMX({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckMX({ color = T_MX.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

// Counter pill — used consistently across the dashboard
function CountPill({ count, color, dim = false }) {
  if (count === undefined || count === null) return null;
  return (
    <span style={{
      fontSize: 10, fontFamily: T_MX.mono, fontWeight: 500,
      padding: '1px 6px', borderRadius: 4, lineHeight: 1.4,
      background: dim ? T_MX.muted : tintMX(color, 0.14),
      border: `0.5px solid ${dim ? T_MX.border : tintMX(color, 0.25)}`,
      color: dim ? T_MX.mutedFg : color,
    }}>{count}</span>
  );
}

// ── Context data ─────────────────────────────────────────────────────────────

const PILOT = {
  name: 'Pilot license',
  color: '#e85a8a',
  summary: { overdue: 0, high: 1, upcoming: 2, streak: 14, nextEvent: '3d' },
  paragraph: ['1 high-priority todo', ' due this week, ', '2 events', ' ahead, and a ', '14-day streak', ' on your top habit.'],
  mantra: 'Aviate, navigate, communicate — in that order.',
  activity: [0,1,0,1,1,1,0, 1,1,1,1,1,1,0, 1,1,1,0,1,1,1, 1,1,1,1,1,1,1],
  lists: [
    { name: 'Ground school', count: 2, active: true },
    { name: 'Flight log',   count: 1 },
    { name: 'Paperwork',    count: 0 },
  ],
  priorities: [
    { t: 'Book next ground school session', sub: 'Due this week', pri: 'high' },
    { t: 'Study navigation chapter 4',     sub: 'Ongoing · 60%', pri: 'med' },
    { t: 'Print medical form copies',      sub: 'For Wed sim',    pri: 'med' },
  ],
  ahead: [
    { day: 'Wed 21 May', t: 'Flight sim session',    sub: 'Aeroclub Bremen · 14:00', kind: 'date' },
    { day: 'Sat 24 May', t: 'Marco — checkride debrief', sub: 'Optional',           kind: 'todo', pri: 'low' },
    { day: 'Tue  3 Jun', t: 'Theory exam — Navigation', sub: 'LBA Braunschweig',    kind: 'date', highlight: true },
    { day: 'Tue 18 Jun', t: 'Class 1 medical renewal', sub: 'Dr. Klein',            kind: 'date' },
  ],
  notes: [
    { id: '1', title: 'Ground school plan',       updated: '2h ago',  pinned: true, preview: 'Focus nav first — heaviest weight in the ATPL theory exam.',
      content: "Focus nav first — heaviest weight in the ATPL theory exam. Ask instructor about VFR vs IFR crossover next session. Also check if the aeroclub has a study group going.\n\nWeek-by-week:\n• W1–2: Air law + comms\n• W3–4: Met + nav (deep)\n• W5: Aircraft general + principles" },
    { id: '2', title: 'Sim debrief — 14 May',     updated: '4d ago', preview: 'Crosswind landing technique needs work.' },
    { id: '3', title: 'Cross-country prep',        updated: '1w ago', preview: 'Route Bremen → Wangerooge → Helgoland → back.' },
    { id: '4', title: 'Radio comm phrasings',     updated: '1w ago', preview: 'Standard phraseology cheat sheet.' },
    { id: '5', title: 'Medical exam — questions', updated: '2w ago', preview: 'Bring: passport, current medical, eye prescription.' },
    { id: '6', title: 'Aerodynamics ch. 3',       updated: '2w ago', preview: 'High-angle stall behaviour differs from low-speed.' },
    { id: '7', title: null,                        updated: '3w ago', preview: 'Untitled scratch — check avionics update.' },
    { id: '8', title: 'ATPL exam — study plan',   updated: '4w ago', preview: '5 weeks to theory exam.' },
  ],
  habits: [
    { name: 'Study 30 min',  streak: 14 },
    { name: 'Logbook entry', streak: 5 },
  ],
  habitsMore: 1,
  links: [
    { t: 'Aeroclub Bremen', host: 'aeroclub-bremen.de' },
    { t: 'ATPL question bank', host: 'aviationexam.com' },
  ],
  linksMore: 4,
  people: [
    { name: 'Marco Brandt',  role: 'Instructor',  initials: 'MB' },
    { name: 'Lena Hoffmann', role: 'Study buddy', initials: 'LH' },
  ],
  peopleMore: 1,
};

const WORK = {
  name: 'Work',
  color: '#2ec27e',
  summary: { overdue: 1, high: 3, upcoming: 4, streak: 8, nextEvent: '2d' },
  paragraph: ['1 overdue', ', ', '3 high-priority todos', ' open, and ', '4 meetings', ' in the next 30 days.'],
  mantra: 'Done is better than perfect. Ship the smallest useful thing, then iterate.',
  activity: [1,1,1,1,1,0,0, 1,1,1,1,1,0,0, 1,1,0,1,1,0,0, 1,1,1,1,1,1,0],
  lists: [
    { name: 'Roadmap', count: 2, active: true },
    { name: '1:1s',    count: 1 },
    { name: 'Admin',   count: 1 },
  ],
  priorities: [
    { t: 'Reply to Lisa re. budget',    sub: 'Overdue · since Friday', pri: 'high', overdue: true },
    { t: 'Q2 review deck',              sub: 'Draft v2 → share Lisa',  pri: 'high' },
    { t: 'Team sync prep',              sub: 'Slides for Monday',      pri: 'med'  },
  ],
  ahead: [
    { day: 'Mon 20 May', t: 'Team standup',              sub: 'Daily · 09:30',        kind: 'date' },
    { day: 'Tue 21 May', t: '1:1 with Lisa',             sub: 'Weekly · 14:00',       kind: 'date' },
    { day: 'Sat 24 May', t: 'Team offsite',              sub: 'All day · Berlin',     kind: 'date', highlight: true },
    { day: 'Wed 28 May', t: 'Quarterly review',          sub: 'Present Q2 deck',      kind: 'date' },
  ],
  notes: [
    { id: '1', title: 'Q3 OKR draft',            updated: '30m ago', pinned: true, preview: 'Lead with customer outcomes, not features.',
      content: 'Lead with customer outcomes, not features. Two big bets:\n\n1. Reduce activation friction — own metric: D7 retention.\n2. Ship the analytics rewrite.\n\nKeep the rest as supporting work. Lisa wants to see this before Friday.' },
    { id: '2', title: 'Hiring loop — backend',   updated: '1d ago',  preview: '3 candidates progressing.' },
    { id: '3', title: 'Customer interview notes', updated: '2d ago', preview: 'Acme team frustrated with current onboarding.' },
    { id: '4', title: 'Q2 review — outline',     updated: '4d ago',  preview: 'Wins, misses, what we learned.' },
    { id: '5', title: 'Team offsite agenda',     updated: '1w ago',  preview: 'Sat 24th. 4 sessions, 1 dinner.' },
    { id: '6', title: '1:1 backlog — Lisa',      updated: '1w ago',  preview: 'Things to raise next week.' },
  ],
  habits: [
    { name: 'Daily standup notes', streak: 8 },
    { name: 'Inbox to zero',       streak: 4 },
  ],
  habitsMore: 1,
  links: [
    { t: 'Roadmap — Linear',  host: 'linear.app' },
    { t: 'Q3 OKRs (draft)',   host: 'quip.com' },
  ],
  linksMore: 6,
  people: [
    { name: 'Lisa Chen',  role: 'Manager',     initials: 'LC' },
    { name: 'Sam Rivera', role: 'PM partner',  initials: 'SR' },
  ],
  peopleMore: 4,
};

// ── Topbar (size-aware) ──────────────────────────────────────────────────────

function TopbarMX({ ctx, size = 'desktop' }) {
  const phone = size === 'phone';
  if (phone) {
    return (
      <div style={{ height: 48, background: T_MX.card, borderBottom: `0.5px solid ${T_MX.border}`, display: 'flex', alignItems: 'center', paddingInline: 14, gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>contekst</span>
        <span style={{ width: 1, height: 16, background: T_MX.border, marginInline: 2 }} />
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6,
          background: tintMX(ctx.color, 0.22), border: 'none', color: T_MX.fg, fontSize: 14, fontWeight: 500,
        }}>
          <DotMX color={ctx.color} size={7} />
          {ctx.name}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T_MX.mutedFg} strokeWidth="1.75"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button style={{ width: 36, height: 36, borderRadius: 6, background: 'transparent', border: 'none', color: T_MX.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    );
  }
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: '#2ec27e', active: ctx.name === 'Work' },
    { key: 'pilot',   label: 'Pilot license',   color: '#e85a8a', active: ctx.name === 'Pilot license' },
    { key: 'friends', label: 'Friends',         color: '#d4883a' },
  ];
  return (
    <div style={{ height: size==='tablet'?50:52, background: T_MX.card, borderBottom: `0.5px solid ${T_MX.border}`, display: 'flex', alignItems: 'center', paddingInline: 16, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, padding: '4px 10px', marginRight: 4 }}>contekst</span>
      {tabs.map(tab => (
        <span key={tab.key} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          fontSize: 13, fontWeight: 500, color: T_MX.fg,
          background: tab.active ? tintMX(tab.color, 0.25) : 'transparent',
        }}>
          <DotMX color={tab.color} size={7} />{tab.label}
        </span>
      ))}
      <div style={{ width: 1, height: 16, background: T_MX.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_MX.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${T_MX.border}`, fontSize: 13, color: T_MX.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add context
        </span>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function paragraphMX(ctx, parts) {
  // Render colored mini-spans inline.
  const c1 = ctx.summary.overdue > 0 ? '#d95f5f' : '#d4883a'; // first highlight
  return (
    <>
      <span style={{ color: c1, fontWeight: 500 }}>{parts[0]}</span>
      {parts[1]}
      <span style={{ color: '#d4883a', fontWeight: 500 }}>{parts[2]}</span>
      {parts[3]}
      <span style={{ color: ctx.color, fontWeight: 500 }}>{parts[4]}</span>
      {parts[5]}
    </>
  );
}

function HeroMX({ ctx, size = 'desktop' }) {
  const phone = size === 'phone';
  const tablet = size === 'tablet';
  // 2-row × 14-col heatmap = same data, less wide
  const cells2 = ctx.activity;
  const stats = [
    { v: ctx.summary.high,       l: 'High open',   c: T_MX.fg },
    { v: ctx.summary.upcoming,   l: 'Upcoming',    c: T_MX.fg },
    { v: ctx.summary.streak,     l: 'Day streak',  c: ctx.color },
    { v: ctx.summary.nextEvent,  l: 'Next event',  c: '#d4883a' },
  ];

  return (
    <div style={{
      padding: phone ? '24px 18px 22px' : tablet ? '26px 28px 22px' : '28px 40px 24px',
      background: tintMX(ctx.color, 0.07),
      borderBottom: `0.5px solid ${tintMX(ctx.color, 0.22)}`,
      display: phone ? 'flex' : 'grid',
      flexDirection: phone ? 'column' : undefined,
      gridTemplateColumns: phone ? undefined : '1.5fr 1fr',
      gap: phone ? 18 : 28,
      alignItems: phone ? 'stretch' : 'start',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <DotMX color={ctx.color} size={8} />
          <span style={{ fontSize: 11, fontFamily: T_MX.mono, color: ctx.color, letterSpacing: 1, textTransform: 'uppercase' }}>{ctx.name} · Macro</span>
        </div>
        <h1 style={{ fontSize: phone ? 26 : 30, fontWeight: 600, letterSpacing: -0.5, margin: 0, lineHeight: 1.15 }}>{ctx.name}</h1>
        <p style={{ fontSize: phone ? 14 : 14, color: T_MX.mutedFg, lineHeight: 1.55, margin: '10px 0 0', maxWidth: 560 }}>
          {paragraphMX(ctx, ctx.paragraph)}
        </p>
        {/* Mantra — visible block, italic, color accent */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '16px 0 18px' }}>
          <span style={{ width: 3, alignSelf: 'stretch', background: ctx.color, opacity: 0.6, borderRadius: 1.5, flexShrink: 0, minHeight: 22 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: phone ? 14 : 15, color: T_MX.fg, fontStyle: 'italic', lineHeight: 1.5, letterSpacing: -0.1 }}>
              {ctx.mantra}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 10, fontFamily: T_MX.mono, color: T_MX.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase' }}>Mantra · pinned</p>
          </div>
        </div>
        {/* Stats row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', gap: phone ? 14 : 20,
        }}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: phone ? 20 : 20, fontWeight: 600, color: s.c, letterSpacing: -0.3, lineHeight: 1, fontFamily: T_MX.mono }}>{s.v}</span>
                <span style={{ fontSize: 11, color: T_MX.mutedFg }}>{s.l}</span>
              </div>
              {!phone && i < stats.length - 1 && <div style={{ width: 1, height: 16, background: tintMX(ctx.color, 0.2) }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right column — activity + actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: phone ? 0 : 4 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: T_MX.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase' }}>Activity</span>
            <span style={{ fontSize: 10, color: T_MX.mutedFg, fontFamily: T_MX.mono }}>4w</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 3 }}>
            {cells2.map((v, i) => {
              const today = i === 27;
              return (
                <span key={i} style={{
                  aspectRatio: '1', borderRadius: 2.5,
                  background: v ? ctx.color : T_MX.muted,
                  opacity: v ? (today ? 1 : 0.55) : 1,
                  border: today ? `0.5px solid ${ctx.color}` : 'none',
                }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T_MX.mutedFg, fontFamily: T_MX.mono }}>
            <span>4w ago</span><span>this week</span>
          </div>
        </div>
        {!phone && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: `0.5px solid ${tintMX(ctx.color, 0.3)}`, background: tintMX(ctx.color, 0.08), fontSize: 12, color: T_MX.fg, cursor: 'pointer' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2 2 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit context
            </button>
            <button style={{ padding: '5px 11px', borderRadius: 7, border: `0.5px solid ${T_MX.border}`, background: 'transparent', fontSize: 12, color: T_MX.mutedFg, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Move to Micro
            </button>
            <button style={{ width: 28, height: 28, borderRadius: 7, border: `0.5px solid ${T_MX.border}`, background: 'transparent', color: T_MX.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Priorities ───────────────────────────────────────────────────────────────

function PrioritiesMX({ ctx, size = 'desktop' }) {
  const phone = size === 'phone';
  return (
    <div style={{
      background: T_MX.card, border: `0.5px solid ${T_MX.border}`, borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <div style={{ padding: phone ? '12px 14px 0' : '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: phone ? 15 : 14, fontWeight: 600, margin: 0, letterSpacing: -0.1 }}>Priorities</h2>
          <CountPill count={ctx.priorities.length} color={ctx.color} />
        </div>
        <span style={{ fontSize: 12, color: ctx.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add
        </span>
      </div>
      <div style={{ padding: phone ? '10px 14px 0' : '10px 18px 0', display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {ctx.lists.map(l => (
          <span key={l.name} style={{
            padding: '3px 9px', borderRadius: 5,
            fontSize: 12, fontWeight: l.active ? 500 : 400,
            background: l.active ? tintMX(ctx.color, 0.16) : 'transparent',
            color: l.active ? ctx.color : T_MX.mutedFg,
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {l.name}
            {l.count > 0 && <CountPill count={l.count} color={ctx.color} dim={!l.active} />}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 10, borderTop: `0.5px solid ${T_MX.muted}` }}>
        {ctx.priorities.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: phone ? '12px 14px' : '12px 18px',
            borderTop: i>0 ? `0.5px solid ${T_MX.muted}` : 'none',
            borderLeft: it.overdue ? `2px solid #d95f5f` : '2px solid transparent',
            paddingLeft: it.overdue ? (phone?12:16) : (phone?14:18),
          }}>
            <div style={{ marginTop: 2 }}><CheckMX color={ctx.color} size={phone ? 15 : 14} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: phone ? 14 : 13, lineHeight: 1.3 }}>{it.t}</div>
              <div style={{ fontSize: 11, color: it.overdue ? '#d95f5f' : T_MX.mutedFg, marginTop: 2 }}>{it.sub}</div>
            </div>
            <BadgeMX pri={it.pri} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ahead ────────────────────────────────────────────────────────────────────

function AheadMX({ ctx, size = 'desktop', maxRows }) {
  const phone = size === 'phone';
  const rows = ctx.ahead.slice(0, maxRows || ctx.ahead.length);
  return (
    <div style={{
      background: T_MX.card, border: `0.5px solid ${T_MX.border}`, borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <div style={{ padding: phone ? '12px 14px' : '14px 18px', borderBottom: `0.5px solid ${T_MX.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: phone ? 15 : 14, fontWeight: 600, margin: 0, letterSpacing: -0.1 }}>Ahead</h2>
          <CountPill count={rows.length} color={ctx.color} />
          {!phone && <span style={{ fontSize: 11, color: T_MX.mutedFg, marginLeft: 2 }}>Next 30 days</span>}
        </div>
        <span style={{ fontSize: 12, color: ctx.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add
        </span>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: phone ? '92px 1fr' : '102px 1fr',
            padding: phone ? '11px 14px' : '11px 18px',
            borderTop: i>0 ? `0.5px solid ${T_MX.muted}` : 'none',
            background: r.highlight ? tintMX(ctx.color, 0.05) : 'transparent',
          }}>
            <div style={{ fontSize: 12, color: r.highlight ? ctx.color : T_MX.mutedFg, fontFamily: T_MX.mono, paddingTop: 2, fontWeight: r.highlight ? 500 : 400 }}>{r.day}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {r.kind === 'todo' ? (
                <CheckMX color={ctx.color} size={13} />
              ) : (
                <span style={{ width: 13, height: 13, borderRadius: 3, background: tintMX(ctx.color, 0.18), border: `0.5px solid ${tintMX(ctx.color, 0.35)}`, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: phone ? 14 : 13, lineHeight: 1.3, fontWeight: r.highlight ? 500 : 400 }}>{r.t}</div>
                {r.sub && <div style={{ fontSize: 11, color: T_MX.mutedFg, marginTop: 1 }}>{r.sub}</div>}
              </div>
              {r.pri && <BadgeMX pri={r.pri} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notes (two-pane on desktop/tablet, list-only on phone) ──────────────────

function NotesMX({ ctx, size = 'desktop', height }) {
  const phone = size === 'phone';
  const tablet = size === 'tablet';
  const activeIdx = 0;
  const active = ctx.notes[activeIdx];

  if (phone) {
    const pinned = ctx.notes.find(n => n.pinned) || ctx.notes[0];
    const rest = ctx.notes.filter(n => n !== pinned).slice(0, 3);
    return (
      <div style={{
        background: T_MX.card, border: `0.5px solid ${T_MX.border}`, borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      }}>
        <div style={{ padding: '11px 14px', borderBottom: `0.5px solid ${T_MX.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: ctx.color, display: 'inline-flex' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
          </span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Notes</span>
          <CountPill count={ctx.notes.length} color={ctx.color} />
          <span style={{ marginLeft: 'auto', fontSize: 12, color: ctx.color, display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> New
          </span>
        </div>
        {/* Pinned/first note expanded inline */}
        <div style={{
          padding: '14px 14px 14px 12px',
          background: tintMX(ctx.color, 0.06),
          borderLeft: `2px solid ${ctx.color}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {pinned.pinned && <svg width="10" height="10" viewBox="0 0 24 24" fill={ctx.color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>}
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, flex: 1, letterSpacing: -0.1, color: T_MX.fg, fontStyle: !pinned.title ? 'italic' : 'normal' }}>
              {pinned.title || 'Untitled'}
            </h3>
            <span style={{ fontSize: 11, color: T_MX.mutedFg, fontFamily: T_MX.mono }}>{pinned.updated}</span>
          </div>
          <p style={{
            margin: 0, fontSize: 13, color: T_MX.fg, lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{pinned.content || pinned.preview}</p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ fontSize: 12, color: ctx.color, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: T_MX.font, display: 'flex', alignItems: 'center', gap: 4 }}>
              Open note
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        {/* Other notes as compact title rows */}
        {rest.map((n, i) => (
          <div key={n.id} style={{
            padding: '11px 14px',
            borderTop: `0.5px solid ${T_MX.muted}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: T_MX.fg, fontStyle: !n.title ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.title || 'Untitled'}
              </div>
              <div style={{ fontSize: 12, color: T_MX.mutedFg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{n.preview}</div>
            </div>
            <span style={{ fontSize: 11, color: T_MX.mutedFg, fontFamily: T_MX.mono, flexShrink: 0 }}>{n.updated}</span>
            <span style={{ color: T_MX.mutedFg, marginLeft: 2 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          </div>
        ))}
        {ctx.notes.length > rest.length + 1 && (
          <div style={{ padding: '12px 14px', borderTop: `0.5px solid ${T_MX.muted}`, fontSize: 12, color: ctx.color, textAlign: 'center', fontWeight: 500 }}>
            See all {ctx.notes.length} notes
          </div>
        )}
      </div>
    );
  }

  const railW = tablet ? 200 : 232;
  const h = height || (tablet ? 300 : 320);
  return (
    <div style={{
      background: T_MX.card, border: `0.5px solid ${T_MX.border}`, borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', height: h,
    }}>
      <div style={{ padding: '11px 14px', borderBottom: `0.5px solid ${T_MX.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: ctx.color, display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Notes</span>
        <CountPill count={ctx.notes.length} color={ctx.color} />
        <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 5, background: T_MX.muted, fontSize: 11, color: T_MX.mutedFg }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg> Search
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: ctx.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> New note
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <div style={{ width: railW, flexShrink: 0, borderRight: `0.5px solid ${T_MX.border}`, overflowY: 'auto', background: 'rgba(255,255,255,0.015)' }}>
          {ctx.notes.map((n, i) => {
            const a = i === activeIdx;
            return (
              <div key={n.id} style={{
                padding: '9px 12px',
                borderTop: i>0 ? `0.5px solid ${T_MX.muted}` : 'none',
                background: a ? tintMX(ctx.color, 0.12) : 'transparent',
                borderLeft: a ? `2px solid ${ctx.color}` : '2px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  {n.pinned && <svg width="8" height="8" viewBox="0 0 24 24" fill={ctx.color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>}
                  <span style={{ fontSize: 13, fontWeight: a ? 600 : 500, color: T_MX.fg, flex: 1, fontStyle: !n.title ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.title || 'Untitled'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: T_MX.mutedFg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.preview}</div>
                <div style={{ fontSize: 10, color: T_MX.mutedFg, fontFamily: T_MX.mono, marginTop: 3 }}>{n.updated}</div>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: -0.1 }}>{active.title}</h3>
            {active.pinned && <span style={{ fontSize: 10, fontFamily: T_MX.mono, color: ctx.color, letterSpacing: 0.5, padding: '1px 6px', borderRadius: 3, background: tintMX(ctx.color, 0.12), border: `0.5px solid ${tintMX(ctx.color, 0.25)}` }}>PINNED</span>}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: T_MX.mutedFg, fontFamily: T_MX.mono }}>edited {active.updated}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: T_MX.fg, whiteSpace: 'pre-wrap' }}>
            {active.content}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Reference strip (Habits/Links/People in 3 compact cards) ────────────────

function ReferenceStripMX({ ctx, size = 'desktop' }) {
  const phone = size === 'phone';
  const card = (title, icon, items, more, kind) => (
    <div style={{
      background: T_MX.card, border: `0.5px solid ${T_MX.border}`, borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{ padding: '9px 12px', borderBottom: `0.5px solid ${T_MX.border}`, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ color: ctx.color, display: 'inline-flex' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{title}</span>
        <CountPill count={items.length + more} color={ctx.color} dim />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: ctx.color }}>+</span>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 12px',
          borderTop: i>0 ? `0.5px solid ${T_MX.muted}` : 'none',
        }}>
          {kind === 'habit' && (
            <div style={{ width: 4, height: 14, borderRadius: 1, background: ctx.color, opacity: 0.7 }} />
          )}
          {kind === 'link' && (
            <span style={{ width: 16, height: 16, borderRadius: 3, background: tintMX(ctx.color, 0.15), border: `0.5px solid ${tintMX(ctx.color, 0.3)}`, color: ctx.color, fontSize: 9, fontFamily: T_MX.mono, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↗</span>
          )}
          {kind === 'person' && (
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: tintMX(ctx.color, 0.18), border: `0.5px solid ${tintMX(ctx.color, 0.3)}`, color: ctx.color, fontSize: 10, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{it.initials}</span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: kind === 'person' ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {kind === 'habit' ? it.name : kind === 'link' ? it.t : it.name}
            </div>
            <div style={{ fontSize: 10, color: T_MX.mutedFg, fontFamily: kind === 'link' ? T_MX.mono : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {kind === 'habit' ? `${it.streak}d streak` : kind === 'link' ? it.host : it.role}
            </div>
          </div>
        </div>
      ))}
      {more > 0 && (
        <div style={{ padding: '7px 12px', borderTop: `0.5px solid ${T_MX.muted}`, fontSize: 11, color: T_MX.mutedFg, textAlign: 'center' }}>
          + {more} more
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: phone ? '1fr' : 'repeat(3, 1fr)',
      gap: phone ? 8 : 10,
    }}>
      {card('Habits',
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
        ctx.habits, ctx.habitsMore, 'habit')}
      {card('Links',
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>,
        ctx.links, ctx.linksMore, 'link')}
      {card('People',
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
        ctx.people, ctx.peopleMore, 'person')}
    </div>
  );
}

// ── Page (size-aware) ────────────────────────────────────────────────────────

function MacroDashboardX({ ctx, size = 'desktop' }) {
  const phone = size === 'phone';
  const tablet = size === 'tablet';
  return (
    <div style={{ width: '100%', height: '100%', background: T_MX.bg, color: T_MX.fg, fontFamily: T_MX.font, fontSize: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopbarMX ctx={ctx} size={size} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <HeroMX ctx={ctx} size={size} />
        <div style={{
          padding: phone ? '20px 14px 28px' : tablet ? '24px 28px 32px' : '26px 40px 40px',
          display: 'flex', flexDirection: 'column',
          gap: phone ? 14 : 16,
        }}>
          {/* Priorities + Ahead */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: phone ? '1fr' : '1.1fr 1fr',
            gap: phone ? 12 : 12,
          }}>
            <PrioritiesMX ctx={ctx} size={size} />
            <AheadMX ctx={ctx} size={size} maxRows={phone ? 4 : undefined} />
          </div>

          {/* Notes */}
          <NotesMX ctx={ctx} size={size} />

          {/* Reference strip */}
          <ReferenceStripMX ctx={ctx} size={size} />
        </div>
      </div>
    </div>
  );
}

// Exports
window.MX_Pilot     = () => <MacroDashboardX ctx={PILOT} size="desktop" />;
window.MX_Work      = () => <MacroDashboardX ctx={WORK}  size="desktop" />;
window.MX_PilotTab  = () => <MacroDashboardX ctx={PILOT} size="tablet" />;
window.MX_PilotPhn  = () => <MacroDashboardX ctx={PILOT} size="phone" />;
window.MX_WorkPhn   = () => <MacroDashboardX ctx={WORK}  size="phone" />;
