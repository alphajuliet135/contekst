// Macro dashboard B — with the two-pane Notes widget integrated into the Workspace.
// Reuses Hero/Mantra/Priorities/Ahead/etc visually but rearranges the Workspace
// so Notes can claim full width (the two-pane pattern needs ~600px to feel right).

const CTX_NP = { name: 'Pilot license', color: '#e85a8a' };

const T_NP = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintNP(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotNP({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeNP({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckNP({ color = T_NP.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

function SectionLabelNP({ children, right, mb = 12 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mb }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T_NP.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

// Topbar (Pilot license active)
function TopbarNP() {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: '#2ec27e' },
    { key: 'pilot',   label: 'Pilot license',   color: CTX_NP.color, active: true },
    { key: 'friends', label: 'Friends',         color: '#d4883a' },
  ];
  return (
    <div style={{ height: 52, background: T_NP.card, borderBottom: `0.5px solid ${T_NP.border}`, display: 'flex', alignItems: 'center', paddingInline: 16, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: T_NP.fg, padding: '4px 10px', marginRight: 6 }}>contekst</span>
      {tabs.map(tab => (
        <span key={tab.key} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          fontSize: 13, fontWeight: 500, color: T_NP.fg,
          background: tab.active ? tintNP(tab.color, 0.25) : 'transparent',
        }}>
          <DotNP color={tab.color} size={7} />{tab.label}
        </span>
      ))}
      <div style={{ width: 1, height: 16, background: T_NP.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_NP.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
    </div>
  );
}

// ── Hero (same as before, abbreviated) ───────────────────────────────────────

function HeroNP() {
  const filled = [0,1,0,1,1,1,0, 1,1,1,1,1,1,0, 1,1,1,0,1,1,1, 1,1,1,1,1,1,1];
  return (
    <div style={{
      padding: '28px 40px 22px',
      background: tintNP(CTX_NP.color, 0.07),
      borderBottom: `0.5px solid ${tintNP(CTX_NP.color, 0.22)}`,
      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'end',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <DotNP color={CTX_NP.color} size={9} />
          <span style={{ fontSize: 11, fontFamily: T_NP.mono, color: CTX_NP.color, letterSpacing: 1, textTransform: 'uppercase' }}>Pilot license · Macro</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.15 }}>Pilot license</h1>
        <p style={{ fontSize: 15, color: T_NP.mutedFg, lineHeight: 1.55, margin: '10px 0 16px', maxWidth: 580 }}>
          <span style={{ color: '#d4883a', fontWeight: 500 }}>1 high-priority todo</span> due this week,{' '}
          <span style={{ color: T_NP.fg, fontWeight: 500 }}>2 events</span> ahead, and a{' '}
          <span style={{ color: CTX_NP.color, fontWeight: 500 }}>14-day streak</span> on your top habit.
        </p>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          {[
            { v: 3,    l: 'Open todos', c: T_NP.fg },
            { v: 2,    l: 'Upcoming',   c: T_NP.fg },
            { v: 14,   l: 'Day streak', c: CTX_NP.color },
            { v: '3d', l: 'Next event', c: '#d4883a' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: s.c, letterSpacing: -0.4, lineHeight: 1, fontFamily: T_NP.mono }}>{s.v}</span>
                <span style={{ fontSize: 11, color: T_NP.mutedFg }}>{s.l}</span>
              </div>
              {i < 3 && <div style={{ width: 1, height: 18, background: tintNP(CTX_NP.color, 0.2) }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div>
        <SectionLabelNP right={<span style={{ fontSize: 10, color: T_NP.mutedFg, fontFamily: T_NP.mono }}>4w · todos + habits</span>} mb={10}>Activity</SectionLabelNP>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 3 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const v = filled[i] ?? 0;
            const today = i === 27;
            return (
              <span key={i} style={{
                aspectRatio: '1', borderRadius: 2.5,
                background: v ? CTX_NP.color : T_NP.muted,
                opacity: v ? (today ? 1 : 0.55) : 1,
                border: today ? `0.5px solid ${CTX_NP.color}` : 'none',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T_NP.mutedFg, fontFamily: T_NP.mono }}>
          <span>4w ago</span><span>this week</span>
        </div>
      </div>
    </div>
  );
}

function MantraNP() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '16px 20px',
      background: T_NP.card, border: `0.5px solid ${T_NP.border}`,
      borderLeft: `2px solid ${tintNP(CTX_NP.color, 0.55)}`,
      borderRadius: 10,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 10, fontFamily: T_NP.mono, color: T_NP.mutedFg, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>Mantra</span>
      <span style={{ width: 1, height: 18, background: T_NP.border, flexShrink: 0 }} />
      <p style={{ margin: 0, flex: 1, fontSize: 16, lineHeight: 1.45, color: T_NP.fg, fontStyle: 'italic', letterSpacing: -0.1 }}>
        Aviate, navigate, communicate — in that order.
      </p>
      <span style={{ fontSize: 11, color: T_NP.mutedFg, fontFamily: T_NP.mono, flexShrink: 0 }}>pinned</span>
    </div>
  );
}

function PrioritiesNP() {
  const lists = [
    { name: 'Ground school', count: 2, active: true },
    { name: 'Flight log',   count: 1, active: false },
    { name: 'Paperwork',    count: 0, active: false },
  ];
  const items = [
    { t: 'Book next ground school session', sub: 'Due this week', pri: 'high' },
    { t: 'Study navigation chapter 4',     sub: 'Ongoing · 60%', pri: 'med' },
    { t: 'Print medical form copies',      sub: 'For Wed sim',    pri: 'med' },
  ];
  return (
    <div style={{
      background: T_NP.card, border: `0.5px solid ${T_NP.border}`, borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Priorities</h2>
          <span style={{ fontSize: 12, color: T_NP.mutedFg }}>3 open · 1 high</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_NP.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add todo
        </span>
      </div>
      <div style={{ padding: '10px 18px 0', display: 'flex', gap: 4 }}>
        {lists.map(l => (
          <span key={l.name} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: l.active ? 500 : 400,
            background: l.active ? tintNP(CTX_NP.color, 0.16) : 'transparent',
            color: l.active ? CTX_NP.color : T_NP.mutedFg,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {l.name}
            {l.count > 0 && <span style={{ fontFamily: T_NP.mono, fontSize: 10, opacity: 0.8 }}>{l.count}</span>}
          </span>
        ))}
      </div>
      <div style={{ padding: '12px 0 14px', marginTop: 4, borderTop: `0.5px solid ${T_NP.muted}` }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 18px', borderTop: i>0 ? `0.5px solid ${T_NP.muted}` : 'none' }}>
            <div style={{ marginTop: 2 }}><CheckNP color={CTX_NP.color} size={15} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.3 }}>{it.t}</div>
              <div style={{ fontSize: 11, color: T_NP.mutedFg, marginTop: 2 }}>{it.sub}</div>
            </div>
            <BadgeNP pri={it.pri} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AheadNP() {
  const rows = [
    { day: 'Wed 21 May', t: 'Flight sim session', sub: 'Aeroclub Bremen · 14:00', kind: 'date' },
    { day: 'Sat 24 May', t: 'Marco — checkride debrief', sub: 'Optional', kind: 'todo', pri: 'low' },
    { day: 'Tue  3 Jun', t: 'Theory exam — Navigation', sub: 'LBA Braunschweig', kind: 'date', highlight: true },
    { day: 'Tue 18 Jun', t: 'Class 1 medical renewal', sub: 'Dr. Klein', kind: 'date' },
  ];
  return (
    <div style={{
      background: T_NP.card, border: `0.5px solid ${T_NP.border}`, borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${T_NP.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Ahead</h2>
          <span style={{ fontSize: 12, color: T_NP.mutedFg }}>Next 30 days</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_NP.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add date
        </span>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '108px 1fr',
            padding: '12px 18px', borderTop: i>0 ? `0.5px solid ${T_NP.muted}` : 'none',
            background: r.highlight ? tintNP(CTX_NP.color, 0.05) : 'transparent',
          }}>
            <div style={{ fontSize: 12, color: r.highlight ? CTX_NP.color : T_NP.mutedFg, fontFamily: T_NP.mono, paddingTop: 2, fontWeight: r.highlight ? 500 : 400 }}>{r.day}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {r.kind === 'todo' ? (
                <CheckNP color={CTX_NP.color} size={13} />
              ) : (
                <span style={{ width: 13, height: 13, borderRadius: 3, background: tintNP(CTX_NP.color, 0.18), border: `0.5px solid ${tintNP(CTX_NP.color, 0.35)}`, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, lineHeight: 1.3, fontWeight: r.highlight ? 500 : 400 }}>{r.t}</div>
                {r.sub && <div style={{ fontSize: 11, color: T_NP.mutedFg, marginTop: 1 }}>{r.sub}</div>}
              </div>
              {r.pri && <BadgeNP pri={r.pri} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notes — embedded two-pane widget ─────────────────────────────────────────

const NOTES_NP = [
  { id: '1', title: 'Ground school plan',       updated: '2h ago',     pinned: true,  preview: 'Focus nav first — heaviest weight in the ATPL theory exam.' },
  { id: '2', title: 'Sim debrief — 14 May',     updated: '4d ago',                       preview: 'Crosswind landing technique needs work. Tendency to over-corre' },
  { id: '3', title: 'Cross-country prep',        updated: '1w ago',                       preview: 'Route Bremen → Wangerooge → Helgoland → back. Fuel: 2h45 block' },
  { id: '4', title: 'Radio comm phrasings',     updated: '1w ago',                       preview: '"Bremen Tower, D-EXYZ, ready for departure, runway 09…"' },
  { id: '5', title: 'Medical exam — questions', updated: '2w ago',                       preview: 'Bring: passport, current medical, recent eye prescription.' },
  { id: '6', title: 'Aerodynamics ch. 3',       updated: '2w ago',                       preview: 'High-angle stall behaviour differs from low-speed. CoP migrates.' },
  { id: '7', title: null,                        updated: '3w ago',                       preview: 'Untitled scratch — remember to check avionics update before next sim' },
  { id: '8', title: 'ATPL exam — study plan',   updated: '4w ago',                       preview: '5 weeks to theory exam. 30 min/day study + Sunday 2h block.' },
];

function NotesEmbedded({ height = 380 }) {
  const activeIdx = 0;
  const active = NOTES_NP[activeIdx];
  return (
    <div style={{
      background: T_NP.card, border: `0.5px solid ${T_NP.border}`, borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', height,
    }}>
      <div style={{ padding: '11px 14px', borderBottom: `0.5px solid ${T_NP.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: CTX_NP.color, display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Notes</span>
        <span style={{ fontSize: 11, color: T_NP.mutedFg, fontFamily: T_NP.mono }}>{NOTES_NP.length}</span>
        <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 5, background: T_NP.muted, fontSize: 11, color: T_NP.mutedFg }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
          Search
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: CTX_NP.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> New note
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* Title rail */}
        <div style={{ width: 232, flexShrink: 0, borderRight: `0.5px solid ${T_NP.border}`, overflowY: 'auto', background: 'rgba(255,255,255,0.015)' }}>
          {NOTES_NP.map((n, i) => {
            const a = i === activeIdx;
            return (
              <div key={n.id} style={{
                padding: '10px 12px',
                borderTop: i>0 ? `0.5px solid ${T_NP.muted}` : 'none',
                background: a ? tintNP(CTX_NP.color, 0.12) : 'transparent',
                borderLeft: a ? `2px solid ${CTX_NP.color}` : '2px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  {n.pinned && <svg width="8" height="8" viewBox="0 0 24 24" fill={CTX_NP.color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>}
                  <span style={{
                    fontSize: 13, fontWeight: a ? 600 : 500, color: T_NP.fg, flex: 1,
                    fontStyle: !n.title ? 'italic' : 'normal',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{n.title || 'Untitled'}</span>
                </div>
                <div style={{ fontSize: 11, color: T_NP.mutedFg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.preview}
                </div>
                <div style={{ fontSize: 10, color: T_NP.mutedFg, fontFamily: T_NP.mono, marginTop: 3 }}>{n.updated}</div>
              </div>
            );
          })}
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>{active.title}</h3>
            <span style={{ fontSize: 10, fontFamily: T_NP.mono, color: CTX_NP.color, letterSpacing: 0.5, padding: '1px 6px', borderRadius: 3, background: tintNP(CTX_NP.color, 0.12), border: `0.5px solid ${tintNP(CTX_NP.color, 0.25)}` }}>PINNED</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: T_NP.mutedFg, fontFamily: T_NP.mono }}>edited {active.updated}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T_NP.fg, whiteSpace: 'pre-wrap' }}>
            {`Focus nav first — heaviest weight in the ATPL theory exam. Ask instructor about VFR vs IFR crossover next session. Also check if the aeroclub has a study group going.

Week-by-week:
• W1–2: Air law + comms
• W3–4: Met + nav (deep)
• W5: Aircraft general + principles`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Small workspace cards (Habits / Links / People) ─────────────────────────

function WSCardNP({ icon, title, addLabel = 'New', children }) {
  return (
    <div style={{
      background: T_NP.card, border: `0.5px solid ${T_NP.border}`, borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '11px 14px', borderBottom: `0.5px solid ${T_NP.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: CTX_NP.color, display: 'inline-flex' }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_NP.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> {addLabel}
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function HabitsNP() {
  const habits = [
    { name: 'Study 30 min', freq: 'daily', streak: 14, week: [1,1,1,0,1,1,1] },
    { name: 'Logbook entry', freq: 'per flight', streak: 5, week: [0,1,0,0,1,0,0] },
  ];
  return (
    <WSCardNP
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
      title="Habits"
    >
      {habits.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i>0 ? `0.5px solid ${T_NP.muted}` : 'none' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
            <div style={{ fontSize: 11, color: T_NP.mutedFg, marginTop: 1, display: 'flex', gap: 8 }}>
              <span style={{ textTransform: 'capitalize' }}>{h.freq}</span><span>·</span>
              <span style={{ color: CTX_NP.color, fontFamily: T_NP.mono }}>{h.streak}d</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {h.week.map((v, j) => (
              <span key={j} style={{
                width: 12, height: 12, borderRadius: 3,
                background: v ? CTX_NP.color : 'transparent',
                border: `0.5px solid ${v ? tintNP(CTX_NP.color, 0.6) : T_NP.border}`,
                opacity: v ? 0.85 : 1
              }} />
            ))}
          </div>
        </div>
      ))}
    </WSCardNP>
  );
}

function LinksNP() {
  const links = [
    { t: 'Aeroclub Bremen booking',  host: 'aeroclub-bremen.de' },
    { t: 'ATPL question bank',       host: 'aviationexam.com' },
    { t: 'Skybrary VFR procedures',  host: 'skybrary.aero' },
  ];
  return (
    <WSCardNP
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>}
      title="Links"
    >
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: i>0 ? `0.5px solid ${T_NP.muted}` : 'none' }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: tintNP(CTX_NP.color, 0.15), border: `0.5px solid ${tintNP(CTX_NP.color, 0.3)}`, color: CTX_NP.color, fontSize: 10, fontFamily: T_NP.mono, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↗</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.t}</div>
            <div style={{ fontSize: 11, color: T_NP.mutedFg, fontFamily: T_NP.mono }}>{l.host}</div>
          </div>
        </div>
      ))}
    </WSCardNP>
  );
}

function PeopleNP() {
  const people = [
    { name: 'Marco Brandt',  role: 'Instructor',  initials: 'MB' },
    { name: 'Lena Hoffmann', role: 'Study buddy', initials: 'LH' },
    { name: 'Dr. Klein',     role: 'AME',         initials: 'DK' },
  ];
  return (
    <WSCardNP
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
      title="People"
    >
      {people.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i>0 ? `0.5px solid ${T_NP.muted}` : 'none' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: tintNP(CTX_NP.color, 0.18), border: `0.5px solid ${tintNP(CTX_NP.color, 0.3)}`, color: CTX_NP.color, fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: T_NP.mutedFg }}>{p.role}</div>
          </div>
        </div>
      ))}
    </WSCardNP>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function MacroDashboardWithNotes() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_NP.bg, color: T_NP.fg, fontFamily: T_NP.font, fontSize: 14, display: 'flex', flexDirection: 'column' }}>
      <TopbarNP />
      <HeroNP />
      <div style={{ padding: '24px 40px 40px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <MantraNP />
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14 }}>
          <PrioritiesNP />
          <AheadNP />
        </div>
        <div>
          <SectionLabelNP right={<span style={{ fontSize: 11, color: T_NP.mutedFg, fontFamily: T_NP.mono }}>Edit layout</span>}>Workspace</SectionLabelNP>
          {/* Row 1: Notes full-width as a hero, two-pane */}
          <NotesEmbedded height={380} />
          {/* Row 2: Habits / Links / People */}
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12, alignItems: 'start' }}>
            <HabitsNP />
            <LinksNP />
            <PeopleNP />
          </div>
        </div>
      </div>
    </div>
  );
}

window.MacroDashboardWithNotes = MacroDashboardWithNotes;
