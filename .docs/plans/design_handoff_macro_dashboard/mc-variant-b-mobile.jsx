// Variation B — responsive renders for iPhone and iPad.
// Self-contained (Babel scripts don't share scope).

const CTX_M = {
  work:   { name: 'Work',         color: '#2ec27e' },
  pilot:  { name: 'Pilot license', color: '#e85a8a' },
  friends:{ name: 'Friends',       color: '#d4883a' },
  cook:   { name: 'Cooking',       color: '#2ec27e' },
  gym:    { name: 'Gym',           color: '#a78bfa' },
  music:  { name: 'Music',         color: '#8F8F8F' },
};

const T_M = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintM(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotM({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeM({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckM({ color = T_M.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

function SectionLabelM({ children, right, mb = 12 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mb }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T_M.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

// ── Week strip (shared) ───────────────────────────────────────────────────────

function WeekStripM({ compact = false }) {
  const days = [
    { d: 'Sun', n: '18', items: [['work','high'],['work','high'],['pilot','high'],['friends','med']], today: true },
    { d: 'Mon', n: '19', items: [['work','med'],['work','low']] },
    { d: 'Tue', n: '20', items: [['pilot','med']] },
    { d: 'Wed', n: '21', items: [['pilot','high']] },
    { d: 'Thu', n: '22', items: [] },
    { d: 'Fri', n: '23', items: [['friends','med']] },
    { d: 'Sat', n: '24', items: [['work','high'],['friends','med']] },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: compact ? 4 : 6 }}>
      {days.map(day => (
        <div key={day.n} style={{
          padding: compact ? '7px 4px 9px' : '8px 6px 10px',
          background: day.today ? T_M.card : 'transparent',
          border: day.today ? `0.5px solid ${T_M.border}` : `0.5px solid transparent`,
          borderRadius: 8, textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, color: day.today ? T_M.fg : T_M.mutedFg, fontFamily: T_M.mono, letterSpacing: 0.5, marginBottom: 3 }}>{day.d.toUpperCase()}</div>
          <div style={{ fontSize: compact ? 13 : 14, fontWeight: day.today ? 600 : 500, color: day.today ? T_M.fg : T_M.mutedFg, fontFamily: T_M.mono, lineHeight: 1 }}>{day.n}</div>
          <div style={{ marginTop: 7, height: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {day.items.map((it, i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: 1.5, background: CTX_M[it[0]].color, opacity: it[1]==='high' ? 1 : it[1]==='med' ? 0.65 : 0.4 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mantra ────────────────────────────────────────────────────────────────────

function MantraM({ size = 'desktop' }) {
  const small = size === 'phone';
  return (
    <div style={{
      display: 'flex', alignItems: small ? 'flex-start' : 'center', gap: small ? 12 : 18,
      padding: small ? '12px 14px' : '16px 20px',
      background: T_M.card,
      border: `0.5px solid ${T_M.border}`,
      borderLeft: `2px solid ${tintM('#4d9aff', 0.55)}`,
      borderRadius: 10,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <span style={{
        fontSize: 10, fontFamily: T_M.mono, color: T_M.mutedFg,
        letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0,
        paddingTop: small ? 4 : 0,
      }}>Mantra</span>
      {!small && <span style={{ width: 1, height: 18, background: T_M.border, flexShrink: 0 }} />}
      <p style={{
        margin: 0, flex: 1,
        fontSize: small ? 14 : 16, lineHeight: 1.45, color: T_M.fg,
        fontStyle: 'italic', letterSpacing: -0.1,
      }}>
        Slow is smooth, smooth is fast. One thing at a time, finished completely.
      </p>
      {!small && (
        <span style={{ fontSize: 11, color: T_M.mutedFg, fontFamily: T_M.mono, flexShrink: 0 }}>pinned · all contexts</span>
      )}
    </div>
  );
}

// ── iPhone topbar (compact + drawer trigger) ──────────────────────────────────

function TopbarPhone() {
  return (
    <div style={{
      height: 48, background: T_M.card, borderBottom: `0.5px solid ${T_M.border}`,
      display: 'flex', alignItems: 'center', paddingInline: 14, gap: 8, flexShrink: 0,
    }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>contekst</span>
      <span style={{ width: 1, height: 16, background: T_M.border, marginInline: 2 }} />
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6,
        background: T_M.muted, border: 'none', color: T_M.fg, fontSize: 14, fontWeight: 500,
      }}>
        <DotM color="#4d9aff" size={7} />
        Mission control
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T_M.mutedFg} strokeWidth="1.75"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <button style={{ width: 36, height: 36, borderRadius: 6, background: 'transparent', border: 'none', color: T_M.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button style={{ width: 36, height: 36, borderRadius: 6, background: 'transparent', border: 'none', color: T_M.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.6c.1-.4.1-.8.1-1.2Z"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── iPad topbar (full strip, tighter) ─────────────────────────────────────────

function TopbarTablet() {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff', active: true },
    { key: 'work',    label: 'Work',            color: CTX_M.work.color },
    { key: 'pilot',   label: 'Pilot license',   color: CTX_M.pilot.color },
    { key: 'friends', label: 'Friends',         color: CTX_M.friends.color },
  ];
  return (
    <div style={{ height: 50, background: T_M.card, borderBottom: `0.5px solid ${T_M.border}`, display: 'flex', alignItems: 'center', paddingInline: 14, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, padding: '4px 10px', marginRight: 4 }}>contekst</span>
      {tabs.map(tab => (
        <span key={tab.key} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 6,
          fontSize: 13, fontWeight: 500, color: T_M.fg,
          background: tab.active ? T_M.muted : 'transparent',
        }}>
          <DotM color={tab.color} size={7} />{tab.label}
        </span>
      ))}
      <div style={{ width: 1, height: 16, background: T_M.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_M.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 6, border: `0.5px solid ${T_M.border}`, fontSize: 13, color: T_M.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add context
        </span>
        <span style={{ width: 40, height: 40, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: T_M.mutedFg }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.6c.1-.4.1-.8.1-1.2Z"/></svg>
        </span>
      </div>
    </div>
  );
}

// ── Now column (shared sizing variants) ───────────────────────────────────────

function NowColumnM({ size = 'desktop' }) {
  const small = size === 'phone';
  const overdue = [
    { t: 'Reply to Lisa re. budget', ctx: 'work',    pri: 'high' },
    { t: 'Send insurance docs',      ctx: 'friends', pri: 'med'  },
  ];
  const today = [
    { t: 'Q2 review deck',        ctx: 'work',    pri: 'high', sub: 'Draft v2 → share with Lisa by 4pm' },
    { t: 'Team sync prep',        ctx: 'work',    pri: 'med',  sub: 'Slides for Monday standup' },
    { t: 'Confirm Marco for Sat', ctx: 'friends', pri: 'med',  sub: null },
  ];
  return (
    <div style={{
      background: T_M.card, border: `0.5px solid ${T_M.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: small ? '12px 14px' : '14px 18px', borderBottom: `0.5px solid ${T_M.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: small ? 16 : 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Now</h2>
          {!small && <span style={{ fontSize: 12, color: T_M.mutedFg }}>What needs your attention right now</span>}
        </div>
        <span style={{ fontSize: 11, color: T_M.mutedFg, fontFamily: T_M.mono }}>{overdue.length + today.length} items</span>
      </div>

      <div style={{ padding: small ? '12px 14px 4px' : '14px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d95f5f' }} />
          <span style={{ fontSize: 11, color: '#d95f5f', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Overdue</span>
        </div>
        {overdue.map((t, i) => {
          const ctx = CTX_M[t.ctx];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: small ? 10 : 12, padding: small ? '10px 0' : '9px 0', borderTop: i>0 ? `0.5px solid ${T_M.muted}` : 'none' }}>
              <CheckM color={ctx.color} size={small ? 16 : 14} />
              <span style={{ flex: 1, fontSize: small ? 15 : 14, lineHeight: 1.3 }}>{t.t}</span>
              <BadgeM pri={t.pri} />
              {!small && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 96 }}>
                  <DotM color={ctx.color} size={6} /><span style={{ fontSize: 11, color: T_M.mutedFg }}>{ctx.name}</span>
                </div>
              )}
              {small && <DotM color={ctx.color} size={7} />}
            </div>
          );
        })}
      </div>

      <div style={{ padding: small ? '12px 14px 14px' : '14px 18px 16px', borderTop: `0.5px solid ${T_M.muted}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d4883a' }} />
          <span style={{ fontSize: 11, color: '#d4883a', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Due today</span>
        </div>
        {today.map((t, i) => {
          const ctx = CTX_M[t.ctx];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: small ? 10 : 12, padding: small ? '11px 0' : '10px 0', borderTop: i>0 ? `0.5px solid ${T_M.muted}` : 'none' }}>
              <div style={{ marginTop: 3 }}><CheckM color={ctx.color} size={small ? 16 : 14} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: small ? 15 : 14, lineHeight: 1.3 }}>{t.t}</div>
                {t.sub && <div style={{ fontSize: small ? 13 : 12, color: T_M.mutedFg, marginTop: 3 }}>{t.sub}</div>}
              </div>
              <BadgeM pri={t.pri} />
              {!small && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 96, marginTop: 3 }}>
                  <DotM color={ctx.color} size={6} /><span style={{ fontSize: 11, color: T_M.mutedFg }}>{ctx.name}</span>
                </div>
              )}
              {small && <DotM color={ctx.color} size={7} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week timeline ─────────────────────────────────────────────────────────────

function WeekTimelineM({ size = 'desktop', maxRows = 7 }) {
  const small = size === 'phone';
  let events = [
    { day: 'Mon 19',     events: [{ kind: 'todo', t: 'Book next ground school', ctx: 'pilot', pri: 'high' }] },
    { day: 'Tue 20',     events: [{ kind: 'todo', t: 'Study navigation ch. 4',  ctx: 'pilot', pri: 'med' }] },
    { day: 'Wed 21',     events: [{ kind: 'date', t: 'Flight sim session',      ctx: 'pilot', sub: 'Aeroclub Bremen' }] },
    { day: 'Fri 23',     events: [{ kind: 'todo', t: 'Plan Marco birthday',     ctx: 'friends', pri: 'med' }] },
    { day: 'Sat 24',     events: [{ kind: 'date', t: 'Team offsite',            ctx: 'work',    sub: 'All day' }] },
    { day: 'Sat  1 Jun', events: [{ kind: 'date', t: "Marco's birthday",        ctx: 'friends', sub: '7pm · Sentinel' }] },
    { day: 'Mon  3 Jun', events: [{ kind: 'date', t: 'ATPL theory exam',        ctx: 'pilot',   sub: 'LBA Braunschweig' }] },
  ];
  events = events.slice(0, maxRows);
  return (
    <div style={{
      background: T_M.card, border: `0.5px solid ${T_M.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: small ? '12px 14px' : '14px 18px', borderBottom: `0.5px solid ${T_M.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: small ? 16 : 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Ahead</h2>
          {!small && <span style={{ fontSize: 12, color: T_M.mutedFg }}>Next 14 days, across contexts</span>}
        </div>
        <span style={{ fontSize: 11, color: T_M.mutedFg, fontFamily: T_M.mono }}>{events.length} items</span>
      </div>
      <div>
        {events.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: small ? '78px 1fr' : '92px 1fr', alignItems: 'flex-start', padding: small ? '11px 14px' : '10px 18px', borderTop: i>0 ? `0.5px solid ${T_M.muted}` : 'none' }}>
            <div style={{ fontSize: small ? 12 : 12, color: T_M.mutedFg, fontFamily: T_M.mono, paddingTop: 2 }}>{row.day}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {row.events.map((e, j) => {
                const ctx = CTX_M[e.ctx];
                return (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {e.kind === 'todo' ? (
                      <CheckM color={ctx.color} size={13} />
                    ) : (
                      <span style={{ width: 13, height: 13, borderRadius: 3, background: tintM(ctx.color, 0.18), border: `0.5px solid ${tintM(ctx.color, 0.35)}`, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: small ? 14 : 13, lineHeight: 1.3 }}>{e.t}</div>
                      {e.sub && <div style={{ fontSize: small ? 12 : 11, color: T_M.mutedFg, marginTop: 1 }}>{e.sub}</div>}
                    </div>
                    {e.pri && <BadgeM pri={e.pri} />}
                    <DotM color={ctx.color} size={6} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pinned ────────────────────────────────────────────────────────────────────

function PinnedScrollerM({ size = 'desktop' }) {
  const small = size === 'phone';
  const items = [
    { t: 'Visa checklist',   sub: 'Note · Friends',         ctx: 'friends', glyph: '⌘' },
    { t: 'ATPL exam dates',  sub: 'Date · Pilot license',   ctx: 'pilot',   glyph: '◷' },
    { t: 'Aeroclub booking', sub: 'Link · Pilot license',   ctx: 'pilot',   glyph: '↗' },
  ];
  return (
    <div style={{
      display: small ? 'flex' : 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8,
      overflowX: small ? 'auto' : 'hidden',
      paddingBottom: small ? 4 : 0,
      marginInline: small ? -14 : 0,
      paddingInline: small ? 14 : 0,
      scrollbarWidth: 'none',
    }}>
      {items.map((it, i) => {
        const ctx = CTX_M[it.ctx];
        return (
          <div key={i} style={{
            flex: small ? '0 0 240px' : '1 1 0',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', background: T_M.card, border: `0.5px solid ${T_M.border}`, borderRadius: 10, minWidth: 0,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: tintM(ctx.color, 0.12), border: `0.5px solid ${tintM(ctx.color, 0.25)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: ctx.color, fontSize: 13, fontFamily: T_M.mono, flexShrink: 0 }}>{it.glyph}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: small ? 14 : 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.t}</div>
              <div style={{ fontSize: small ? 12 : 11, color: T_M.mutedFg }}>{it.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Micro pulse ───────────────────────────────────────────────────────────────

function MicroPulseM({ size = 'desktop' }) {
  const small = size === 'phone';
  const micros = [
    { key: 'cook',  top: 'Try new pasta recipe', meta: '2 todos · 1 link',   pulse: [0.2,0.3,0.4,0.3,0.5,0.3,0.4] },
    { key: 'gym',   top: 'Leg day today',        meta: '4-day streak',       pulse: [0.6,0.8,0.4,0.7,0.9,0.8,0.7] },
    { key: 'music', top: 'Practice 20 min',      meta: '15 min avg / day',   pulse: [0.3,0.2,0.4,0.1,0.3,0.5,0.2] },
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: small ? '1fr' : 'repeat(3, 1fr)',
      gap: 8,
    }}>
      {micros.map(m => {
        const ctx = CTX_M[m.key];
        return (
          <div key={m.key} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: small ? '13px 14px' : '12px 14px',
            background: T_M.card, border: `0.5px solid ${T_M.border}`, borderRadius: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <DotM color={ctx.color} size={7} />
                <span style={{ fontSize: small ? 14 : 13, fontWeight: 500 }}>{ctx.name}</span>
                <span style={{ fontSize: 10, fontFamily: T_M.mono, color: T_M.mutedFg, marginLeft: 'auto' }}>μ · peek</span>
              </div>
              <div style={{ fontSize: small ? 14 : 13, color: T_M.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>→ {m.top}</div>
              <div style={{ fontSize: small ? 12 : 11, color: T_M.mutedFg, marginTop: 1 }}>{m.meta}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 26, flexShrink: 0 }}>
              {m.pulse.map((v, i) => (
                <span key={i} style={{ width: 4, height: `${Math.max(v*100, 12)}%`, borderRadius: 1.5, background: ctx.color, opacity: 0.45 + v*0.5 }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── iPhone screen ─────────────────────────────────────────────────────────────

function MissionControlPhone() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_M.bg, color: T_M.fg, fontFamily: T_M.font, fontSize: 15, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopbarPhone />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px 28px' }}>

        {/* Briefing hero — stacked */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontFamily: T_M.mono, color: T_M.mutedFg, letterSpacing: 1, textTransform: 'uppercase' }}>Briefing · Sun 18 May</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: T_M.border }} />
            <span style={{ fontSize: 10, fontFamily: T_M.mono, color: '#2ec27e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <DotM color="#2ec27e" size={5} /> healthy
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, margin: 0, lineHeight: 1.2 }}>Morning, AJ.</h1>
          <p style={{ fontSize: 14, color: T_M.mutedFg, lineHeight: 1.5, margin: '8px 0 0' }}>
            <span style={{ color: '#d95f5f', fontWeight: 500 }}>2 overdue</span>,{' '}
            <span style={{ color: '#d4883a', fontWeight: 500 }}>3 due today</span>,{' '}
            <span style={{ color: T_M.fg, fontWeight: 500 }}>4 events</span> this week — mostly Pilot license.
          </p>
        </div>

        {/* Week strip */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabelM right={<span style={{ fontSize: 10, color: T_M.mutedFg, fontFamily: T_M.mono }}>WK 20</span>} mb={8}>This week</SectionLabelM>
          <WeekStripM compact />
        </div>

        {/* Mantra */}
        <div style={{ marginBottom: 22 }}>
          <MantraM size="phone" />
        </div>

        {/* Pinned — horizontal scroll */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabelM mb={8}>Pinned</SectionLabelM>
          <PinnedScrollerM size="phone" />
        </div>

        {/* Now */}
        <div style={{ marginBottom: 18 }}>
          <NowColumnM size="phone" />
        </div>

        {/* Ahead — slightly shorter on phone */}
        <div style={{ marginBottom: 22 }}>
          <WeekTimelineM size="phone" maxRows={5} />
        </div>

        {/* Micro pulse */}
        <div>
          <SectionLabelM mb={8}>Micro pulse</SectionLabelM>
          <MicroPulseM size="phone" />
        </div>
      </div>
    </div>
  );
}

// ── iPad screen (portrait) ────────────────────────────────────────────────────

function MissionControlTablet() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_M.bg, color: T_M.fg, fontFamily: T_M.font, fontSize: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopbarTablet />
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 32px' }}>

        {/* Briefing hero — stays 2-col but tighter on tablet portrait */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 22, alignItems: 'end',
          paddingBottom: 22, borderBottom: `0.5px solid ${T_M.border}`, marginBottom: 24,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontFamily: T_M.mono, color: T_M.mutedFg, letterSpacing: 1, textTransform: 'uppercase' }}>Briefing — Sun 18 May, 09:42</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: T_M.border }} />
              <span style={{ fontSize: 11, fontFamily: T_M.mono, color: '#2ec27e', display: 'flex', alignItems: 'center', gap: 5 }}>
                <DotM color="#2ec27e" size={5} /> all systems healthy
              </span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.2 }}>Good morning, AJ.</h1>
            <p style={{ fontSize: 15, color: T_M.mutedFg, lineHeight: 1.55, margin: '10px 0 0', maxWidth: 480 }}>
              You have <span style={{ color: '#d95f5f', fontWeight: 500 }}>2 overdue</span>,{' '}
              <span style={{ color: '#d4883a', fontWeight: 500 }}>3 due today</span>, and{' '}
              <span style={{ color: T_M.fg, fontWeight: 500 }}>4 events</span> in the next week — mostly Pilot license.
            </p>
          </div>
          <div>
            <SectionLabelM right={<span style={{ fontSize: 10, color: T_M.mutedFg, fontFamily: T_M.mono }}>WK 20</span>} mb={10}>This week</SectionLabelM>
            <WeekStripM compact />
          </div>
        </div>

        {/* Mantra */}
        <div style={{ marginBottom: 22 }}>
          <MantraM />
        </div>

        {/* Pinned */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabelM>Pinned</SectionLabelM>
          <PinnedScrollerM />
        </div>

        {/* Now / Ahead — keep 2-col but lower ratio so Ahead has room */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <NowColumnM />
          <WeekTimelineM maxRows={6} />
        </div>

        {/* Micro pulse */}
        <div>
          <SectionLabelM right={<span style={{ fontSize: 11, color: T_M.mutedFg, fontFamily: T_M.mono }}>3 micros</span>}>Micro pulse</SectionLabelM>
          <MicroPulseM />
        </div>
      </div>
    </div>
  );
}

window.MissionControlPhone = MissionControlPhone;
window.MissionControlTablet = MissionControlTablet;
