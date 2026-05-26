// Macro dashboard — Variation B — "Context briefing"
// Applies the Mission Control briefing aesthetic at the context level.
// Briefing hero → Now/Ahead split → Mantra → Workspace grid (other widgets).

const CTX_MB = { name: 'Pilot license', color: '#e85a8a' };

const T_MB = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintMB(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotMB({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeMB({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
    done: { bg: 'rgba(46,194,126,0.15)', fg: '#2ec27e', bd: 'rgba(46,194,126,0.2)',   label: 'Done' },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckMB({ color = T_MB.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

function SectionLabelMB({ children, right, mb = 12 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mb }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T_MB.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

function TopbarMB() {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: '#2ec27e' },
    { key: 'pilot',   label: 'Pilot license',   color: CTX_MB.color, active: true },
    { key: 'friends', label: 'Friends',         color: '#d4883a' },
  ];
  return (
    <div style={{ height: 52, background: T_MB.card, borderBottom: `0.5px solid ${T_MB.border}`, display: 'flex', alignItems: 'center', paddingInline: 16, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: T_MB.fg, padding: '4px 10px', marginRight: 6 }}>contekst</span>
      {tabs.map(tab => (
        <span key={tab.key} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          fontSize: 13, fontWeight: 500, color: T_MB.fg,
          background: tab.active ? tintMB(tab.color, 0.25) : 'transparent',
        }}>
          <DotMB color={tab.color} size={7} />{tab.label}
        </span>
      ))}
      <div style={{ width: 1, height: 16, background: T_MB.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_MB.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${T_MB.border}`, fontSize: 13, color: T_MB.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add context
        </span>
      </div>
    </div>
  );
}

// ── Briefing hero (context-scoped) ────────────────────────────────────────────

function HeroMB() {
  return (
    <div style={{
      padding: '28px 40px 22px',
      background: tintMB(CTX_MB.color, 0.07),
      borderBottom: `0.5px solid ${tintMB(CTX_MB.color, 0.22)}`,
      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'end',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <DotMB color={CTX_MB.color} size={9} />
          <span style={{ fontSize: 11, fontFamily: T_MB.mono, color: CTX_MB.color, letterSpacing: 1, textTransform: 'uppercase' }}>Pilot license · Macro</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: tintMB(CTX_MB.color, 0.3) }} />
          <span style={{ fontSize: 11, fontFamily: T_MB.mono, color: T_MB.mutedFg }}>created Jan '26</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.15 }}>
          Pilot license
        </h1>
        <p style={{ fontSize: 15, color: T_MB.mutedFg, lineHeight: 1.55, margin: '10px 0 16px', maxWidth: 580 }}>
          <span style={{ color: '#d4883a', fontWeight: 500 }}>1 high-priority todo</span> due this week,{' '}
          <span style={{ color: T_MB.fg, fontWeight: 500 }}>2 events</span> in the next 30 days, and a{' '}
          <span style={{ color: CTX_MB.color, fontWeight: 500 }}>14-day streak</span> on your top habit.
        </p>
        {/* compact stat row */}
        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          {[
            { v: 3,  l: 'Open todos',  c: T_MB.fg },
            { v: 2,  l: 'Upcoming',    c: T_MB.fg },
            { v: 14, l: 'Day streak',  c: CTX_MB.color },
            { v: '3d', l: 'Next event', c: '#d4883a' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: s.c, letterSpacing: -0.4, lineHeight: 1, fontFamily: T_MB.mono }}>{s.v}</span>
                <span style={{ fontSize: 11, color: T_MB.mutedFg }}>{s.l}</span>
              </div>
              {i < 3 && <div style={{ width: 1, height: 18, background: tintMB(CTX_MB.color, 0.2) }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Activity heatmap — last 4 weeks of any tracked widget */}
      <div>
        <SectionLabelMB right={<span style={{ fontSize: 10, color: T_MB.mutedFg, fontFamily: T_MB.mono }}>4w · todos + habits</span>} mb={10}>Activity</SectionLabelMB>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 3 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            // Synthetic data: streak weeks
            const v = [0,1,0,1,1,1,0, 1,1,1,1,1,1,0, 1,1,1,0,1,1,1, 1,1,1,1,1,1,1][i] ?? 0;
            const today = i === 27;
            return (
              <span key={i} style={{
                aspectRatio: '1',
                borderRadius: 2.5,
                background: v ? CTX_MB.color : T_MB.muted,
                opacity: v ? (today ? 1 : 0.55) : 1,
                border: today ? `0.5px solid ${CTX_MB.color}` : 'none',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T_MB.mutedFg, fontFamily: T_MB.mono }}>
          <span>4w ago</span><span>this week</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: `0.5px solid ${tintMB(CTX_MB.color, 0.35)}`, background: tintMB(CTX_MB.color, 0.08), fontSize: 12, color: T_MB.mutedFg }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2 2 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit context
          </button>
          <button style={{ padding: '5px 12px', borderRadius: 7, border: `0.5px solid ${tintMB(CTX_MB.color, 0.35)}`, background: tintMB(CTX_MB.color, 0.08), fontSize: 12, color: T_MB.mutedFg, whiteSpace: 'nowrap' }}>
            Move to Micro
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mantra ────────────────────────────────────────────────────────────────────

function MantraMB() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '16px 20px',
      background: T_MB.card,
      border: `0.5px solid ${T_MB.border}`,
      borderLeft: `2px solid ${tintMB(CTX_MB.color, 0.55)}`,
      borderRadius: 10,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 10, fontFamily: T_MB.mono, color: T_MB.mutedFg, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>Mantra</span>
      <span style={{ width: 1, height: 18, background: T_MB.border, flexShrink: 0 }} />
      <p style={{ margin: 0, flex: 1, fontSize: 16, lineHeight: 1.45, color: T_MB.fg, fontStyle: 'italic', letterSpacing: -0.1 }}>
        Aviate, navigate, communicate — in that order.
      </p>
      <span style={{ fontSize: 11, color: T_MB.mutedFg, fontFamily: T_MB.mono, flexShrink: 0 }}>pinned</span>
    </div>
  );
}

// ── Now (context-scoped Priorities, foregrounded) ─────────────────────────────

function NowMB() {
  const items = [
    { t: 'Book next ground school session', sub: 'Due this week · LBA portal', pri: 'high' },
    { t: 'Study navigation chapter 4',     sub: 'Ongoing · 60% through',      pri: 'med' },
    { t: 'Print medical form copies',      sub: 'For Wednesday sim',          pri: 'med' },
  ];
  const lists = [
    { name: 'Ground school', count: 2, active: true },
    { name: 'Flight log',   count: 1, active: false },
    { name: 'Paperwork',    count: 0, active: false },
  ];
  return (
    <div style={{
      background: T_MB.card, border: `0.5px solid ${T_MB.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Priorities</h2>
          <span style={{ fontSize: 12, color: T_MB.mutedFg }}>3 open · 1 high</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_MB.color, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add todo
        </span>
      </div>
      {/* Lists tab bar */}
      <div style={{ padding: '10px 18px 0', display: 'flex', gap: 4 }}>
        {lists.map(l => (
          <span key={l.name} style={{
            padding: '4px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: l.active ? 500 : 400,
            background: l.active ? tintMB(CTX_MB.color, 0.16) : 'transparent',
            color: l.active ? CTX_MB.color : T_MB.mutedFg,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {l.name}
            {l.count > 0 && <span style={{ fontFamily: T_MB.mono, fontSize: 10, opacity: 0.8 }}>{l.count}</span>}
          </span>
        ))}
        <span style={{ padding: '4px 8px', fontSize: 12, color: T_MB.mutedFg }}>+</span>
      </div>
      <div style={{ padding: '12px 0 14px', marginTop: 4, borderTop: `0.5px solid ${T_MB.muted}` }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 18px', borderTop: i>0 ? `0.5px solid ${T_MB.muted}` : 'none' }}>
            <div style={{ marginTop: 2 }}><CheckMB color={CTX_MB.color} size={15} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.3 }}>{it.t}</div>
              <div style={{ fontSize: 11, color: T_MB.mutedFg, marginTop: 2 }}>{it.sub}</div>
            </div>
            <BadgeMB pri={it.pri} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ahead — context-scoped dates timeline ────────────────────────────────────

function AheadMB() {
  const rows = [
    { day: 'Wed 21 May', t: 'Flight sim session', sub: 'Aeroclub Bremen · 14:00', kind: 'date' },
    { day: 'Sat 24 May', t: 'Marco — checkride debrief', sub: 'Optional, 1h', kind: 'todo', pri: 'low' },
    { day: 'Tue  3 Jun', t: 'Theory exam — Navigation', sub: 'LBA Braunschweig', kind: 'date', highlight: true },
    { day: 'Sun 15 Jun', t: 'Submit logbook update', sub: 'Through May', kind: 'todo', pri: 'med' },
    { day: 'Tue 18 Jun', t: 'Class 1 medical renewal', sub: 'Dr. Klein · annual', kind: 'date' },
  ];
  return (
    <div style={{
      background: T_MB.card, border: `0.5px solid ${T_MB.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${T_MB.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Ahead</h2>
          <span style={{ fontSize: 12, color: T_MB.mutedFg }}>Todos with dates + events, next 30 days</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_MB.color, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add date
        </span>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '108px 1fr',
            padding: '12px 18px',
            borderTop: i>0 ? `0.5px solid ${T_MB.muted}` : 'none',
            background: r.highlight ? tintMB(CTX_MB.color, 0.05) : 'transparent',
          }}>
            <div style={{ fontSize: 12, color: r.highlight ? CTX_MB.color : T_MB.mutedFg, fontFamily: T_MB.mono, paddingTop: 2, fontWeight: r.highlight ? 500 : 400 }}>{r.day}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {r.kind === 'todo' ? (
                <CheckMB color={CTX_MB.color} size={13} />
              ) : (
                <span style={{ width: 13, height: 13, borderRadius: 3, background: tintMB(CTX_MB.color, 0.18), border: `0.5px solid ${tintMB(CTX_MB.color, 0.35)}`, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, lineHeight: 1.3, fontWeight: r.highlight ? 500 : 400 }}>{r.t}</div>
                {r.sub && <div style={{ fontSize: 11, color: T_MB.mutedFg, marginTop: 1 }}>{r.sub}</div>}
              </div>
              {r.pri && <BadgeMB pri={r.pri} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Workspace widgets (Notes / Habits / Links / People) ─────────────────────

function WorkspaceCard({ icon, title, addLabel = 'Add', children, footer }) {
  return (
    <div style={{
      background: T_MB.card, border: `0.5px solid ${T_MB.border}`, borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '11px 14px', borderBottom: `0.5px solid ${T_MB.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: CTX_MB.color, display: 'inline-flex' }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_MB.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> {addLabel}
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      {footer && <div style={{ padding: '7px 14px', borderTop: `0.5px solid ${T_MB.muted}`, fontSize: 11, color: T_MB.mutedFg, fontFamily: T_MB.mono }}>{footer}</div>}
    </div>
  );
}

function NotesMB() {
  return (
    <WorkspaceCard
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>}
      title="Notes" addLabel="New" footer="2 notes · last edited 2h ago"
    >
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: T_MB.mutedFg, marginBottom: 5, fontFamily: T_MB.mono }}>Ground school plan</div>
        <p style={{ margin: 0, fontSize: 13, color: T_MB.fg, lineHeight: 1.55 }}>
          Focus nav first — heaviest weight in the ATPL theory exam. Ask instructor about VFR vs IFR crossover. Check if the aeroclub has a study group going.
        </p>
      </div>
    </WorkspaceCard>
  );
}

function HabitsMB() {
  const habits = [
    { name: 'Study 30 min',     freq: 'daily', streak: 14, week: [1,1,1,0,1,1,1] },
    { name: 'Logbook entry',    freq: 'per flight', streak: 5, week: [0,1,0,0,1,0,0] },
  ];
  return (
    <WorkspaceCard
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
      title="Habits" addLabel="New"
    >
      {habits.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i>0 ? `0.5px solid ${T_MB.muted}` : 'none' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
            <div style={{ fontSize: 11, color: T_MB.mutedFg, marginTop: 1, display: 'flex', gap: 8 }}>
              <span style={{ textTransform: 'capitalize' }}>{h.freq}</span><span>·</span>
              <span style={{ color: CTX_MB.color, fontFamily: T_MB.mono }}>{h.streak}d</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {h.week.map((v, j) => (
              <span key={j} style={{ width: 13, height: 13, borderRadius: 3,
                background: v ? CTX_MB.color : 'transparent',
                border: `0.5px solid ${v ? tintMB(CTX_MB.color, 0.6) : T_MB.border}`,
                opacity: v ? 0.85 : 1 }} />
            ))}
          </div>
        </div>
      ))}
    </WorkspaceCard>
  );
}

function LinksMB() {
  const links = [
    { t: 'Aeroclub Bremen booking',  host: 'aeroclub-bremen.de' },
    { t: 'ATPL question bank',       host: 'aviationexam.com' },
    { t: 'Skybrary VFR procedures',  host: 'skybrary.aero' },
  ];
  return (
    <WorkspaceCard
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>}
      title="Links" addLabel="New"
    >
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: i>0 ? `0.5px solid ${T_MB.muted}` : 'none' }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: tintMB(CTX_MB.color, 0.15), border: `0.5px solid ${tintMB(CTX_MB.color, 0.3)}`, color: CTX_MB.color, fontSize: 10, fontFamily: T_MB.mono, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↗</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.t}</div>
            <div style={{ fontSize: 11, color: T_MB.mutedFg, fontFamily: T_MB.mono }}>{l.host}</div>
          </div>
        </div>
      ))}
    </WorkspaceCard>
  );
}

function PeopleMB() {
  const people = [
    { name: 'Marco Brandt',   role: 'Instructor',    initials: 'MB' },
    { name: 'Lena Hoffmann',  role: 'Study buddy',   initials: 'LH' },
    { name: 'Dr. Klein',      role: 'AME',           initials: 'DK' },
  ];
  return (
    <WorkspaceCard
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
      title="People" addLabel="New"
    >
      {people.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i>0 ? `0.5px solid ${T_MB.muted}` : 'none' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: tintMB(CTX_MB.color, 0.18), border: `0.5px solid ${tintMB(CTX_MB.color, 0.3)}`, color: CTX_MB.color, fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: T_MB.mutedFg }}>{p.role}</div>
          </div>
        </div>
      ))}
    </WorkspaceCard>
  );
}

// ── Page B ────────────────────────────────────────────────────────────────────

function MacroDashboardB() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_MB.bg, color: T_MB.fg, fontFamily: T_MB.font, fontSize: 14, display: 'flex', flexDirection: 'column' }}>
      <TopbarMB />
      <HeroMB />
      <div style={{ padding: '24px 40px 40px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <MantraMB />

        {/* Now / Ahead 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14 }}>
          <NowMB />
          <AheadMB />
        </div>

        {/* Workspace */}
        <div>
          <SectionLabelMB right={<span style={{ fontSize: 11, color: T_MB.mutedFg, fontFamily: T_MB.mono }}>Edit layout</span>}>Workspace</SectionLabelMB>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, alignItems: 'start' }}>
            <NotesMB />
            <HabitsMB />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <LinksMB />
              <PeopleMB />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

window.MacroDashboardB = MacroDashboardB;
