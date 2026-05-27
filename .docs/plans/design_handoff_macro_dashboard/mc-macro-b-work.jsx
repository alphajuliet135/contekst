// Macro dashboard B — Context briefing — applied to a second context (Work).
// Demonstrates the template generalizes; data flows in from a different context.

const CTX_W = { name: 'Work', color: '#2ec27e' };

const T_W = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintW(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotW({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeW({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckW({ color = T_W.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

function SectionLabelW({ children, right, mb = 12 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mb }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T_W.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

function TopbarW() {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: CTX_W.color, active: true },
    { key: 'pilot',   label: 'Pilot license',   color: '#e85a8a' },
    { key: 'friends', label: 'Friends',         color: '#d4883a' },
  ];
  return (
    <div style={{ height: 52, background: T_W.card, borderBottom: `0.5px solid ${T_W.border}`, display: 'flex', alignItems: 'center', paddingInline: 16, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: T_W.fg, padding: '4px 10px', marginRight: 6 }}>contekst</span>
      {tabs.map(tab => (
        <span key={tab.key} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          fontSize: 13, fontWeight: 500, color: T_W.fg,
          background: tab.active ? tintW(tab.color, 0.25) : 'transparent',
        }}>
          <DotW color={tab.color} size={7} />{tab.label}
        </span>
      ))}
      <div style={{ width: 1, height: 16, background: T_W.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_W.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${T_W.border}`, fontSize: 13, color: T_W.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add context
        </span>
      </div>
    </div>
  );
}

function HeroW() {
  // Synthetic 28-day activity — Mon-Fri heavy, weekends light (work pattern)
  const filled = [1,1,1,1,1,0,0, 1,1,1,1,1,0,0, 1,1,0,1,1,0,0, 1,1,1,1,1,1,0];
  return (
    <div style={{
      padding: '28px 40px 22px',
      background: tintW(CTX_W.color, 0.07),
      borderBottom: `0.5px solid ${tintW(CTX_W.color, 0.22)}`,
      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'end',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <DotW color={CTX_W.color} size={9} />
          <span style={{ fontSize: 11, fontFamily: T_W.mono, color: CTX_W.color, letterSpacing: 1, textTransform: 'uppercase' }}>Work · Macro</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: tintW(CTX_W.color, 0.3) }} />
          <span style={{ fontSize: 11, fontFamily: T_W.mono, color: T_W.mutedFg }}>created Nov '25</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.15 }}>Work</h1>
        <p style={{ fontSize: 15, color: T_W.mutedFg, lineHeight: 1.55, margin: '10px 0 16px', maxWidth: 580 }}>
          <span style={{ color: '#d95f5f', fontWeight: 500 }}>1 overdue</span>,{' '}
          <span style={{ color: '#d4883a', fontWeight: 500 }}>3 high-priority todos</span> open, and{' '}
          <span style={{ color: T_W.fg, fontWeight: 500 }}>4 meetings</span> in the next 30 days.
        </p>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          {[
            { v: 7,    l: 'Open todos', c: T_W.fg },
            { v: 4,    l: 'Upcoming',   c: T_W.fg },
            { v: 8,    l: 'Day streak', c: CTX_W.color },
            { v: '2d', l: 'Next event', c: '#d4883a' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: s.c, letterSpacing: -0.4, lineHeight: 1, fontFamily: T_W.mono }}>{s.v}</span>
                <span style={{ fontSize: 11, color: T_W.mutedFg }}>{s.l}</span>
              </div>
              {i < 3 && <div style={{ width: 1, height: 18, background: tintW(CTX_W.color, 0.2) }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div>
        <SectionLabelW right={<span style={{ fontSize: 10, color: T_W.mutedFg, fontFamily: T_W.mono }}>4w · todos + habits</span>} mb={10}>Activity</SectionLabelW>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 3 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const v = filled[i] ?? 0;
            const today = i === 27;
            return (
              <span key={i} style={{
                aspectRatio: '1', borderRadius: 2.5,
                background: v ? CTX_W.color : T_W.muted,
                opacity: v ? (today ? 1 : 0.55) : 1,
                border: today ? `0.5px solid ${CTX_W.color}` : 'none',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T_W.mutedFg, fontFamily: T_W.mono }}>
          <span>4w ago</span><span>this week</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: `0.5px solid ${tintW(CTX_W.color, 0.35)}`, background: tintW(CTX_W.color, 0.08), fontSize: 12, color: T_W.mutedFg }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2 2 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit context
          </button>
          <button style={{ padding: '5px 12px', borderRadius: 7, border: `0.5px solid ${tintW(CTX_W.color, 0.35)}`, background: tintW(CTX_W.color, 0.08), fontSize: 12, color: T_W.mutedFg, whiteSpace: 'nowrap' }}>
            Move to Micro
          </button>
        </div>
      </div>
    </div>
  );
}

function MantraW() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '16px 20px',
      background: T_W.card, border: `0.5px solid ${T_W.border}`,
      borderLeft: `2px solid ${tintW(CTX_W.color, 0.55)}`,
      borderRadius: 10,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 10, fontFamily: T_W.mono, color: T_W.mutedFg, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>Mantra</span>
      <span style={{ width: 1, height: 18, background: T_W.border, flexShrink: 0 }} />
      <p style={{ margin: 0, flex: 1, fontSize: 16, lineHeight: 1.45, color: T_W.fg, fontStyle: 'italic', letterSpacing: -0.1 }}>
        Done is better than perfect. Ship the smallest useful thing, then iterate.
      </p>
      <span style={{ fontSize: 11, color: T_W.mutedFg, fontFamily: T_W.mono, flexShrink: 0 }}>pinned</span>
    </div>
  );
}

function NowW() {
  const items = [
    { t: 'Reply to Lisa re. budget',     sub: 'Overdue · since Friday',        pri: 'high' },
    { t: 'Q2 review deck',               sub: 'Draft v2 → share with Lisa',     pri: 'high' },
    { t: 'Team sync prep',               sub: 'Slides for Monday standup',      pri: 'med' },
    { t: 'Backend engineer follow-ups',  sub: '3 candidates, scheduling thank-yous', pri: 'med' },
  ];
  const lists = [
    { name: 'Roadmap', count: 2, active: true },
    { name: '1:1s',    count: 1, active: false },
    { name: 'Admin',   count: 1, active: false },
  ];
  return (
    <div style={{
      background: T_W.card, border: `0.5px solid ${T_W.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Priorities</h2>
          <span style={{ fontSize: 12, color: T_W.mutedFg }}>7 open · 3 high · 1 overdue</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_W.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add todo
        </span>
      </div>
      <div style={{ padding: '10px 18px 0', display: 'flex', gap: 4 }}>
        {lists.map(l => (
          <span key={l.name} style={{
            padding: '4px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: l.active ? 500 : 400,
            background: l.active ? tintW(CTX_W.color, 0.16) : 'transparent',
            color: l.active ? CTX_W.color : T_W.mutedFg,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {l.name}
            {l.count > 0 && <span style={{ fontFamily: T_W.mono, fontSize: 10, opacity: 0.8 }}>{l.count}</span>}
          </span>
        ))}
        <span style={{ padding: '4px 8px', fontSize: 12, color: T_W.mutedFg }}>+</span>
      </div>
      <div style={{ padding: '12px 0 14px', marginTop: 4, borderTop: `0.5px solid ${T_W.muted}` }}>
        {items.map((it, i) => {
          const overdue = it.sub.includes('Overdue');
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '11px 18px',
              borderTop: i>0 ? `0.5px solid ${T_W.muted}` : 'none',
              borderLeft: overdue ? `2px solid #d95f5f` : '2px solid transparent',
              paddingLeft: 16,
            }}>
              <div style={{ marginTop: 2 }}><CheckW color={CTX_W.color} size={15} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, lineHeight: 1.3 }}>{it.t}</div>
                <div style={{ fontSize: 11, color: overdue ? '#d95f5f' : T_W.mutedFg, marginTop: 2 }}>{it.sub}</div>
              </div>
              <BadgeW pri={it.pri} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AheadW() {
  const rows = [
    { day: 'Mon 20 May', t: 'Team standup',              sub: 'Daily · 09:30',          kind: 'date' },
    { day: 'Tue 21 May', t: '1:1 with Lisa',             sub: 'Weekly · 14:00',         kind: 'date' },
    { day: 'Wed 22 May', t: 'Customer interview — Acme', sub: 'User research · 30 min', kind: 'todo', pri: 'med' },
    { day: 'Sat 24 May', t: 'Team offsite',              sub: 'All day · Berlin office', kind: 'date', highlight: true },
    { day: 'Wed 28 May', t: 'Quarterly review',          sub: 'Present Q2 deck',        kind: 'date' },
    { day: 'Mon  2 Jun', t: 'Hiring panel — backend',    sub: '4 candidates, full day', kind: 'date' },
    { day: 'Fri  6 Jun', t: 'Submit OKR draft',          sub: 'For Q3',                 kind: 'todo', pri: 'high' },
  ];
  return (
    <div style={{
      background: T_W.card, border: `0.5px solid ${T_W.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${T_W.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Ahead</h2>
          <span style={{ fontSize: 12, color: T_W.mutedFg }}>Todos with dates + events, next 30 days</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_W.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add date
        </span>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '108px 1fr',
            padding: '12px 18px',
            borderTop: i>0 ? `0.5px solid ${T_W.muted}` : 'none',
            background: r.highlight ? tintW(CTX_W.color, 0.05) : 'transparent',
          }}>
            <div style={{ fontSize: 12, color: r.highlight ? CTX_W.color : T_W.mutedFg, fontFamily: T_W.mono, paddingTop: 2, fontWeight: r.highlight ? 500 : 400 }}>{r.day}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {r.kind === 'todo' ? (
                <CheckW color={CTX_W.color} size={13} />
              ) : (
                <span style={{ width: 13, height: 13, borderRadius: 3, background: tintW(CTX_W.color, 0.18), border: `0.5px solid ${tintW(CTX_W.color, 0.35)}`, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, lineHeight: 1.3, fontWeight: r.highlight ? 500 : 400 }}>{r.t}</div>
                {r.sub && <div style={{ fontSize: 11, color: T_W.mutedFg, marginTop: 1 }}>{r.sub}</div>}
              </div>
              {r.pri && <BadgeW pri={r.pri} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WSCardW({ icon, title, addLabel = 'Add', children, footer }) {
  return (
    <div style={{
      background: T_W.card, border: `0.5px solid ${T_W.border}`, borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '11px 14px', borderBottom: `0.5px solid ${T_W.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: CTX_W.color, display: 'inline-flex' }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_W.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> {addLabel}
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      {footer && <div style={{ padding: '7px 14px', borderTop: `0.5px solid ${T_W.muted}`, fontSize: 11, color: T_W.mutedFg, fontFamily: T_W.mono }}>{footer}</div>}
    </div>
  );
}

function NotesW() {
  return (
    <WSCardW
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>}
      title="Notes" addLabel="New" footer="3 notes · last edited 30m ago"
    >
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: T_W.mutedFg, marginBottom: 5, fontFamily: T_W.mono }}>Q3 OKR draft</div>
        <p style={{ margin: 0, fontSize: 13, color: T_W.fg, lineHeight: 1.55 }}>
          Lead with customer outcomes, not features. Two big bets: reduce activation friction (own metric: D7 retention), and ship the analytics rewrite. Keep the rest as supporting work.
        </p>
      </div>
    </WSCardW>
  );
}

function HabitsW() {
  const habits = [
    { name: 'Daily standup notes', freq: 'daily',  streak: 8, week: [1,1,1,1,1,0,0] },
    { name: 'Inbox to zero',       freq: 'daily',  streak: 4, week: [1,1,1,0,1,0,0] },
    { name: 'Weekly retro',        freq: 'weekly', streak: 3, week: [0,0,0,0,1,0,0] },
  ];
  return (
    <WSCardW
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
      title="Habits" addLabel="New"
    >
      {habits.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: i>0 ? `0.5px solid ${T_W.muted}` : 'none' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
            <div style={{ fontSize: 11, color: T_W.mutedFg, marginTop: 1, display: 'flex', gap: 8 }}>
              <span style={{ textTransform: 'capitalize' }}>{h.freq}</span><span>·</span>
              <span style={{ color: CTX_W.color, fontFamily: T_W.mono }}>{h.streak}d streak</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {h.week.map((v, j) => (
              <span key={j} style={{ width: 13, height: 13, borderRadius: 3,
                background: v ? CTX_W.color : 'transparent',
                border: `0.5px solid ${v ? tintW(CTX_W.color, 0.6) : T_W.border}`,
                opacity: v ? 0.85 : 1 }} />
            ))}
          </div>
        </div>
      ))}
    </WSCardW>
  );
}

function LinksW() {
  const links = [
    { t: 'Roadmap — Linear',      host: 'linear.app' },
    { t: 'Q3 OKRs (draft)',       host: 'quip.com' },
    { t: 'Customer interviews',   host: 'notion.so' },
    { t: 'Loom — Q2 review v1',   host: 'loom.com' },
  ];
  return (
    <WSCardW
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>}
      title="Links" addLabel="New"
    >
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: i>0 ? `0.5px solid ${T_W.muted}` : 'none' }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: tintW(CTX_W.color, 0.15), border: `0.5px solid ${tintW(CTX_W.color, 0.3)}`, color: CTX_W.color, fontSize: 10, fontFamily: T_W.mono, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↗</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.t}</div>
            <div style={{ fontSize: 11, color: T_W.mutedFg, fontFamily: T_W.mono }}>{l.host}</div>
          </div>
        </div>
      ))}
    </WSCardW>
  );
}

function PeopleW() {
  const people = [
    { name: 'Lisa Chen',     role: 'Manager · weekly 1:1',   initials: 'LC' },
    { name: 'Sam Rivera',    role: 'PM · partner on roadmap', initials: 'SR' },
    { name: 'Daria Knapp',   role: 'Design lead',            initials: 'DK' },
    { name: 'Tom Iwasaki',   role: 'Eng manager',            initials: 'TI' },
  ];
  return (
    <WSCardW
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
      title="People" addLabel="New"
    >
      {people.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i>0 ? `0.5px solid ${T_W.muted}` : 'none' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: tintW(CTX_W.color, 0.18), border: `0.5px solid ${tintW(CTX_W.color, 0.3)}`, color: CTX_W.color, fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: T_W.mutedFg }}>{p.role}</div>
          </div>
        </div>
      ))}
    </WSCardW>
  );
}

function MacroDashboardWork() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_W.bg, color: T_W.fg, fontFamily: T_W.font, fontSize: 14, display: 'flex', flexDirection: 'column' }}>
      <TopbarW />
      <HeroW />
      <div style={{ padding: '24px 40px 40px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <MantraW />
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14 }}>
          <NowW />
          <AheadW />
        </div>
        <div>
          <SectionLabelW right={<span style={{ fontSize: 11, color: T_W.mutedFg, fontFamily: T_W.mono }}>Edit layout</span>}>Workspace</SectionLabelW>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, alignItems: 'start' }}>
            <NotesW />
            <HabitsW />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <LinksW />
              <PeopleW />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.MacroDashboardWork = MacroDashboardWork;
