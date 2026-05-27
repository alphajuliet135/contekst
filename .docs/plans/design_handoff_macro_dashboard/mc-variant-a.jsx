// Variation A — "Tightened": same skeleton as today, denser, with a status ribbon,
// a dedicated Upcoming timeline, and a more useful Micro sidebar.

const { useEffect } = React;

// ── Data ──────────────────────────────────────────────────────────────────────

const CTX = {
  work:   { name: 'Work',         color: '#2ec27e' },
  pilot:  { name: 'Pilot license', color: '#e85a8a' },
  friends:{ name: 'Friends',       color: '#d4883a' },
  cook:   { name: 'Cooking',       color: '#2ec27e' },
  gym:    { name: 'Gym',           color: '#a78bfa' },
  music:  { name: 'Music',         color: '#8F8F8F' },
};

const TODAY = [
  { title: 'Q2 review deck',        ctx: 'work',    pri: 'high', due: 'today'   },
  { title: 'Reply to Lisa re. budget', ctx: 'work', pri: 'high', due: 'overdue' },
  { title: 'Book next ground school', ctx: 'pilot', pri: 'high', due: 'this-week'  },
  { title: 'Team sync prep',         ctx: 'work',   pri: 'med',  due: 'today'   },
  { title: 'Confirm Marco for Sat',  ctx: 'friends',pri: 'med',  due: 'today'   },
];

const ATTENTION = {
  work:    [{ t: 'Q2 review deck', pri: 'high', sub: 'Due tomorrow' },
            { t: 'Reply to Lisa re. budget', pri: 'high', sub: 'Overdue' },
            { t: 'Team sync prep', pri: 'med',  sub: 'This week' }],
  pilot:   [{ t: 'Book next ground school', pri: 'high', sub: 'Due this week' },
            { t: 'Study navigation chapter 4', pri: 'med', sub: 'Ongoing' }],
  friends: [{ t: 'Plan Marco birthday', pri: 'med', sub: 'Sat 1 Jun' },
            { t: 'Reply to group chat',  pri: 'low', sub: 'Today' }],
};

const UPCOMING = [
  { d: '21', m: 'MAY', t: 'Flight sim session', sub: 'Pilot license',  ctx: 'pilot',   span: 'In 3 days' },
  { d: '24', m: 'MAY', t: 'Team offsite',       sub: 'Work',           ctx: 'work',    span: 'In 6 days' },
  { d: '01', m: 'JUN', t: "Marco's birthday",   sub: 'Friends',        ctx: 'friends', span: 'In 2 weeks' },
  { d: '03', m: 'JUN', t: 'ATPL theory exam',   sub: 'Pilot license',  ctx: 'pilot',   span: 'In 2 weeks' },
];

const MICRO = [
  { key: 'cook',  top: 'Try new pasta recipe', next: 'Restock spices', load: 0.3 },
  { key: 'gym',   top: '4-day streak · leg day today', next: null,     load: 0.6 },
  { key: 'music', top: 'Practice 20 min',      next: null,             load: 0.15 },
];

// ── Tokens ────────────────────────────────────────────────────────────────────

const T = {
  bg:        '#171717',
  fg:        '#EDEDED',
  muted:     '#262626',
  mutedFg:   '#8F8F8F',
  border:    '#333333',
  card:      '#1F1F1F',
  font:      "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tint(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

// ── Pieces ────────────────────────────────────────────────────────────────────

function Dot({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function Badge({ pri }) {
  const styles = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
  }[pri];
  return (
    <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
      background: styles.bg, color: styles.fg, border: `1px solid ${styles.bd}` }}>
      {styles.label}
    </span>
  );
}

function Check({ color = T.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: T.card,
      border: `0.5px solid ${T.border}`,
      borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Topbar (frozen for context) ───────────────────────────────────────────────

function Topbar({ active = 'mission' }) {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: CTX.work.color },
    { key: 'pilot',   label: 'Pilot license',   color: CTX.pilot.color },
    { key: 'friends', label: 'Friends',         color: CTX.friends.color },
  ];
  return (
    <div style={{
      height: 52, background: T.card, borderBottom: `0.5px solid ${T.border}`,
      display: 'flex', alignItems: 'center', paddingInline: 16, gap: 2, flexShrink: 0,
    }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: T.fg, padding: '4px 10px', marginRight: 6 }}>contekst</span>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <span key={tab.key} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
            fontSize: 13, fontWeight: 500,
            background: isActive ? (tab.key === 'mission' ? T.muted : tint(tab.color, 0.25)) : 'transparent',
            color: T.fg, whiteSpace: 'nowrap',
          }}>
            <Dot color={tab.color} size={7} />{tab.label}
          </span>
        );
      })}
      <div style={{ width: 1, height: 16, background: T.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${T.border}`, fontSize: 13, color: T.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
          Add context
        </span>
        <span style={{ width: 44, height: 44, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: T.mutedFg }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>
        </span>
      </div>
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────────────

function StatusRibbon() {
  const stats = [
    { v: 2, l: 'Overdue',       c: '#d95f5f' },
    { v: 3, l: 'Due today',     c: '#d4883a' },
    { v: 5, l: 'High priority', c: T.fg },
    { v: 4, l: 'Upcoming · 7d', c: T.mutedFg },
  ];
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '12px 16px', background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10, marginBottom: 28 }}>
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: s.c, letterSpacing: -0.5, lineHeight: 1, fontFamily: T.mono }}>{s.v}</span>
            <span style={{ fontSize: 12, color: T.mutedFg }}>{s.l}</span>
          </div>
          {i < stats.length - 1 && <div style={{ width: 1, height: 24, background: T.border }} />}
        </React.Fragment>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.mutedFg }}>
        <Dot color="#2ec27e" size={6} /> Synced 2 min ago
      </div>
    </div>
  );
}

function TodayCard() {
  return (
    <Card>
      <div style={{ padding: '10px 16px', borderBottom: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Today · 5 items</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Priority','Context','Due'].map((l,i) => (
            <span key={l} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: i===0?500:400, background: i===0?T.muted:'transparent', color: i===0?T.fg:T.mutedFg }}>{l}</span>
          ))}
        </div>
      </div>
      <div>
        {TODAY.map((t,i) => {
          const ctx = CTX[t.ctx];
          const overdue = t.due === 'overdue';
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
              borderTop: i>0 ? `0.5px solid ${T.muted}` : 'none',
              borderLeft: overdue ? `2px solid #d95f5f` : t.due==='today' ? `2px solid ${tint('#d4883a',0.6)}` : '2px solid transparent',
              marginLeft: -2, paddingLeft: 14,
            }}>
              <Check color={ctx.color} />
              <span style={{ flex: 1, fontSize: 13 }}>{t.title}</span>
              <span style={{ fontSize: 11, color: overdue ? '#d95f5f' : T.mutedFg, minWidth: 60, textAlign: 'right' }}>
                {overdue ? 'Overdue' : t.due === 'today' ? 'Today' : 'This week'}
              </span>
              <Badge pri={t.pri} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 96 }}>
                <Dot color={ctx.color} size={6} />
                <span style={{ fontSize: 11, color: T.mutedFg }}>{ctx.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AttentionCard({ ctxKey }) {
  const ctx = CTX[ctxKey];
  const items = ATTENTION[ctxKey];
  const open = items.length;
  return (
    <Card>
      <div style={{
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `0.5px solid ${T.border}`,
        background: tint(ctx.color, 0.04),
      }}>
        <Dot color={ctx.color} />
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{ctx.name}</span>
        <span style={{ fontSize: 11, color: T.mutedFg, fontFamily: T.mono }}>{open} open</span>
      </div>
      <div style={{ padding: '8px 0' }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 14px' }}>
            <div style={{ marginTop: 2 }}><Check color={ctx.color} size={14} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, lineHeight: 1.35, display: 'block' }}>{it.t}</span>
              <span style={{ fontSize: 11, color: it.sub.includes('Overdue') ? '#d95f5f' : T.mutedFg }}>{it.sub}</span>
            </div>
            <Badge pri={it.pri} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function UpcomingRail() {
  return (
    <Card>
      <div style={{ padding: '10px 16px', borderBottom: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.mutedFg} strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Next 30 days
        </span>
        <span style={{ fontSize: 11, color: T.mutedFg }}>4 events · across 3 contexts</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {UPCOMING.map((u, i) => {
          const ctx = CTX[u.ctx];
          return (
            <div key={i} style={{
              padding: '14px 16px',
              borderLeft: i>0 ? `0.5px solid ${T.muted}` : 'none',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  background: tint(ctx.color, 0.15), border: `0.5px solid ${tint(ctx.color, 0.3)}`,
                  borderRadius: 6, padding: '3px 7px', textAlign: 'center', minWidth: 38,
                }}>
                  <div style={{ fontSize: 8, fontWeight: 500, color: ctx.color, letterSpacing: 0.5 }}>{u.m}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: ctx.color, lineHeight: 1.1 }}>{u.d}</div>
                </div>
                <span style={{ fontSize: 11, color: ctx.color, fontFamily: T.mono }}>{u.span}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{u.t}</div>
                <div style={{ fontSize: 11, color: T.mutedFg, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Dot color={ctx.color} size={5} />{u.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PinnedRow() {
  const items = [
    { icon: 'note', t: 'Visa checklist', sub: 'Note · Friends', ctx: 'friends' },
    { icon: 'date', t: 'ATPL exam dates', sub: 'Date · Pilot license', ctx: 'pilot' },
    { icon: 'link', t: 'Aeroclub Bremen booking', sub: 'Link · Pilot license', ctx: 'pilot' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {items.map((it, i) => {
        const ctx = CTX[it.ctx];
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: tint(ctx.color, 0.12), border: `0.5px solid ${tint(ctx.color, 0.25)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: ctx.color, flexShrink: 0,
            }}>
              {it.icon === 'note' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>}
              {it.icon === 'date' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
              {it.icon === 'link' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{it.t}</div>
              <div style={{ fontSize: 11, color: T.mutedFg }}>{it.sub}</div>
            </div>
            <Dot color={ctx.color} size={7} />
          </div>
        );
      })}
    </div>
  );
}

function MicroSidebar() {
  return (
    <aside style={{ width: 268, flexShrink: 0, borderLeft: `0.5px solid ${T.border}`, padding: '36px 28px', display: 'flex', flexDirection: 'column' }}>
      <SectionLabel>Micro</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MICRO.map(m => {
          const ctx = CTX[m.key];
          return (
            <div key={m.key} style={{
              background: T.card, border: `0.5px solid ${T.border}`, borderRadius: 10, padding: '12px 14px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Dot color={ctx.color} size={7} />
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{ctx.name}</span>
                <span style={{ fontSize: 10, color: T.mutedFg, fontFamily: T.mono }}>μ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: m.next ? 4 : 0 }}>
                <Check color={ctx.color} size={12} />
                <span style={{ fontSize: 12, color: T.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.top}</span>
              </div>
              {m.next && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.mutedFg }}>
                  <span style={{ width: 12, textAlign: 'center', fontSize: 11 }}>→</span>
                  <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.next}</span>
                </div>
              )}
              {/* load bar */}
              <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: T.muted, overflow: 'hidden' }}>
                <div style={{ width: `${m.load * 100}%`, height: '100%', background: ctx.color, opacity: 0.6 }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, border: `0.5px dashed ${T.border}`, borderRadius: 10, color: T.mutedFg, fontSize: 12 }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Add micro context
      </div>
    </aside>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function MissionControlA() {
  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, color: T.fg, fontFamily: T.font, fontSize: 14, display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, padding: '32px 40px 40px' }}>

          {/* Greeting */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, margin: 0, lineHeight: 1.15 }}>Good morning, AJ</h1>
            <span style={{ fontSize: 13, color: T.mutedFg, paddingBottom: 3 }}>Sunday, 18 May</span>
          </div>

          <StatusRibbon />

          {/* Today */}
          <section style={{ marginBottom: 32 }}>
            <SectionLabel>Today</SectionLabel>
            <TodayCard />
          </section>

          {/* Needs attention */}
          <section style={{ marginBottom: 32 }}>
            <SectionLabel right={<span style={{ fontSize: 11, color: T.mutedFg, fontFamily: T.mono }}>3 macro contexts</span>}>Needs attention</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <AttentionCard ctxKey="work" />
              <AttentionCard ctxKey="pilot" />
              <AttentionCard ctxKey="friends" />
            </div>
          </section>

          {/* Upcoming */}
          <section style={{ marginBottom: 32 }}>
            <SectionLabel>Upcoming</SectionLabel>
            <UpcomingRail />
          </section>

          {/* Pinned */}
          <section>
            <SectionLabel>Pinned</SectionLabel>
            <PinnedRow />
          </section>

        </div>
        <MicroSidebar />
      </div>
    </div>
  );
}

window.MissionControlA = MissionControlA;
