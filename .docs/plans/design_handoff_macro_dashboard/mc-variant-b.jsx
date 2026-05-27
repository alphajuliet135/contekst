// Variation B — "Briefing": opinionated single-glance day briefing with
// a week heatmap, two-column Now / This week, and Micro pulse footer.

const CTX_B = {
  work:   { name: 'Work',         color: '#2ec27e' },
  pilot:  { name: 'Pilot license', color: '#e85a8a' },
  friends:{ name: 'Friends',       color: '#d4883a' },
  cook:   { name: 'Cooking',       color: '#2ec27e' },
  gym:    { name: 'Gym',           color: '#a78bfa' },
  music:  { name: 'Music',         color: '#8F8F8F' },
};

const T_B = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintB(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotB({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeB({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckB({ color = T_B.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

function SectionLabelB({ children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T_B.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

// Reuse topbar from A (different class to avoid scope clash)
function TopbarB() {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: CTX_B.work.color },
    { key: 'pilot',   label: 'Pilot license',   color: CTX_B.pilot.color },
    { key: 'friends', label: 'Friends',         color: CTX_B.friends.color },
  ];
  return (
    <div style={{ height: 52, background: T_B.card, borderBottom: `0.5px solid ${T_B.border}`, display: 'flex', alignItems: 'center', paddingInline: 16, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: T_B.fg, padding: '4px 10px', marginRight: 6 }}>contekst</span>
      {tabs.map(tab => {
        const isActive = tab.key === 'mission';
        return (
          <span key={tab.key} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
            fontSize: 13, fontWeight: 500, color: T_B.fg, whiteSpace: 'nowrap',
            background: isActive ? T_B.muted : 'transparent',
          }}>
            <DotB color={tab.color} size={7} />{tab.label}
          </span>
        );
      })}
      <div style={{ width: 1, height: 16, background: T_B.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_B.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${T_B.border}`, fontSize: 13, color: T_B.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add context
        </span>
        <span style={{ width: 44, height: 44, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: T_B.mutedFg }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.6c.1-.4.1-.8.1-1.2Z"/></svg>
        </span>
      </div>
    </div>
  );
}

// ── Briefing hero ─────────────────────────────────────────────────────────────

function BriefingHero() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'end',
      paddingBottom: 24, borderBottom: `0.5px solid ${T_B.border}`, marginBottom: 28,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontFamily: T_B.mono, color: T_B.mutedFg, letterSpacing: 1, textTransform: 'uppercase' }}>
            Briefing — Sun 18 May, 09:42
          </span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: T_B.border }} />
          <span style={{ fontSize: 11, fontFamily: T_B.mono, color: '#2ec27e', display: 'flex', alignItems: 'center', gap: 5 }}>
            <DotB color="#2ec27e" size={5} /> all systems healthy
          </span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.2 }}>
          Good morning, AJ.
        </h1>
        <p style={{ fontSize: 15, color: T_B.mutedFg, lineHeight: 1.55, margin: '10px 0 0', maxWidth: 580 }}>
          You have <span style={{ color: '#d95f5f', fontWeight: 500 }}>2 overdue</span>,{' '}
          <span style={{ color: '#d4883a', fontWeight: 500 }}>3 due today</span>, and{' '}
          <span style={{ color: T_B.fg, fontWeight: 500 }}>4 events</span> in the next week — mostly Pilot license.
        </p>
      </div>
      {/* Week heatmap */}
      <div>
        <SectionLabelB right={<span style={{ fontSize: 10, color: T_B.mutedFg, fontFamily: T_B.mono }}>WK 20</span>}>This week</SectionLabelB>
        <WeekStrip />
      </div>
    </div>
  );
}

function WeekStrip() {
  // Each day = list of ctx-coloured dots representing items.
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {days.map(day => (
        <div key={day.n} style={{
          padding: '8px 6px 10px',
          background: day.today ? T_B.card : 'transparent',
          border: day.today ? `0.5px solid ${T_B.border}` : `0.5px solid transparent`,
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, color: day.today ? T_B.fg : T_B.mutedFg, fontFamily: T_B.mono, letterSpacing: 0.5, marginBottom: 3 }}>{day.d.toUpperCase()}</div>
          <div style={{ fontSize: 14, fontWeight: day.today ? 600 : 500, color: day.today ? T_B.fg : T_B.mutedFg, fontFamily: T_B.mono, lineHeight: 1 }}>{day.n}</div>
          <div style={{ marginTop: 8, height: 18, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {day.items.map((it, i) => (
              <span key={i} style={{
                width: 5, height: 5, borderRadius: 1.5,
                background: CTX_B[it[0]].color,
                opacity: it[1]==='high' ? 1 : it[1]==='med' ? 0.65 : 0.4,
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Now column ────────────────────────────────────────────────────────────────

function NowColumn() {
  const overdue = [
    { t: 'Reply to Lisa re. budget', ctx: 'work', pri: 'high' },
    { t: 'Send insurance docs',      ctx: 'friends', pri: 'med' },
  ];
  const today = [
    { t: 'Q2 review deck',  ctx: 'work',  pri: 'high', sub: 'Draft v2 → share with Lisa by 4pm' },
    { t: 'Team sync prep',  ctx: 'work',  pri: 'med',  sub: 'Slides for Monday standup' },
    { t: 'Confirm Marco for Sat', ctx: 'friends', pri: 'med', sub: null },
  ];
  return (
    <div style={{
      background: T_B.card, border: `0.5px solid ${T_B.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${T_B.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Now</h2>
          <span style={{ fontSize: 12, color: T_B.mutedFg }}>What needs your attention right now</span>
        </div>
        <span style={{ fontSize: 11, color: T_B.mutedFg, fontFamily: T_B.mono }}>{overdue.length + today.length} items</span>
      </div>

      {/* Overdue group */}
      <div style={{ padding: '14px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d95f5f' }} />
          <span style={{ fontSize: 11, color: '#d95f5f', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Overdue</span>
        </div>
        {overdue.map((t, i) => {
          const ctx = CTX_B[t.ctx];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i>0 ? `0.5px solid ${T_B.muted}` : 'none' }}>
              <CheckB color={ctx.color} />
              <span style={{ flex: 1, fontSize: 14 }}>{t.t}</span>
              <BadgeB pri={t.pri} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 96 }}>
                <DotB color={ctx.color} size={6} /><span style={{ fontSize: 11, color: T_B.mutedFg }}>{ctx.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today group */}
      <div style={{ padding: '14px 18px 16px', borderTop: `0.5px solid ${T_B.muted}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d4883a' }} />
          <span style={{ fontSize: 11, color: '#d4883a', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Due today</span>
        </div>
        {today.map((t, i) => {
          const ctx = CTX_B[t.ctx];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: i>0 ? `0.5px solid ${T_B.muted}` : 'none' }}>
              <div style={{ marginTop: 3 }}><CheckB color={ctx.color} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.3 }}>{t.t}</div>
                {t.sub && <div style={{ fontSize: 12, color: T_B.mutedFg, marginTop: 3 }}>{t.sub}</div>}
              </div>
              <BadgeB pri={t.pri} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 96, marginTop: 3 }}>
                <DotB color={ctx.color} size={6} /><span style={{ fontSize: 11, color: T_B.mutedFg }}>{ctx.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Right column: This week timeline ──────────────────────────────────────────

function WeekTimeline() {
  const events = [
    { day: 'Mon 19',  events: [{ kind: 'todo', t: 'Book next ground school', ctx: 'pilot', pri: 'high' }] },
    { day: 'Tue 20',  events: [{ kind: 'todo', t: 'Study navigation ch. 4',  ctx: 'pilot', pri: 'med' }] },
    { day: 'Wed 21',  events: [{ kind: 'date', t: 'Flight sim session',      ctx: 'pilot', sub: 'Aeroclub Bremen' }] },
    { day: 'Fri 23',  events: [{ kind: 'todo', t: 'Plan Marco birthday',     ctx: 'friends', pri: 'med' }] },
    { day: 'Sat 24',  events: [{ kind: 'date', t: 'Team offsite',            ctx: 'work',    sub: 'All day' }] },
    { day: 'Sat  1 Jun',  events: [{ kind: 'date', t: "Marco's birthday",    ctx: 'friends', sub: '7pm · Sentinel' }] },
    { day: 'Mon  3 Jun',  events: [{ kind: 'date', t: 'ATPL theory exam',    ctx: 'pilot',   sub: 'LBA Braunschweig' }] },
  ];
  return (
    <div style={{
      background: T_B.card, border: `0.5px solid ${T_B.border}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${T_B.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Ahead</h2>
          <span style={{ fontSize: 12, color: T_B.mutedFg }}>Next 14 days, across contexts</span>
        </div>
        <span style={{ fontSize: 11, color: T_B.mutedFg, fontFamily: T_B.mono }}>{events.length} items</span>
      </div>
      <div style={{ padding: '6px 0' }}>
        {events.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '92px 1fr', alignItems: 'flex-start', padding: '10px 18px', borderTop: i>0 ? `0.5px solid ${T_B.muted}` : 'none' }}>
            <div style={{ fontSize: 12, color: T_B.mutedFg, fontFamily: T_B.mono, paddingTop: 2 }}>{row.day}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {row.events.map((e, j) => {
                const ctx = CTX_B[e.ctx];
                return (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {e.kind === 'todo' ? (
                      <CheckB color={ctx.color} size={13} />
                    ) : (
                      <span style={{ width: 13, height: 13, borderRadius: 3, background: tintB(ctx.color, 0.18), border: `0.5px solid ${tintB(ctx.color, 0.35)}`, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.3 }}>{e.t}</div>
                      {e.sub && <div style={{ fontSize: 11, color: T_B.mutedFg, marginTop: 1 }}>{e.sub}</div>}
                    </div>
                    {e.pri && <BadgeB pri={e.pri} />}
                    <DotB color={ctx.color} size={6} />
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

// ── Mantra ────────────────────────────────────────────────────────────────────

function MantraB() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '16px 20px',
      background: T_B.card,
      border: `0.5px solid ${T_B.border}`,
      borderLeft: `2px solid ${tintB('#4d9aff', 0.55)}`,
      borderRadius: 10,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <span style={{
        fontSize: 10, fontFamily: T_B.mono, color: T_B.mutedFg,
        letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0,
      }}>Mantra</span>
      <span style={{ width: 1, height: 18, background: T_B.border, flexShrink: 0 }} />
      <p style={{
        margin: 0, flex: 1,
        fontSize: 16, lineHeight: 1.45, color: T_B.fg,
        fontStyle: 'italic', letterSpacing: -0.1,
      }}>
        Slow is smooth, smooth is fast. One thing at a time, finished completely.
      </p>
      <span style={{ fontSize: 11, color: T_B.mutedFg, fontFamily: T_B.mono, flexShrink: 0 }}>
        pinned · all contexts
      </span>
    </div>
  );
}

// ── Pinned strip ──────────────────────────────────────────────────────────────

function PinnedStripB() {
  const items = [
    { t: 'Visa checklist',   sub: 'Note · Friends',         ctx: 'friends', glyph: '⌘' },
    { t: 'ATPL exam dates',  sub: 'Date · Pilot license',   ctx: 'pilot',   glyph: '◷' },
    { t: 'Aeroclub booking', sub: 'Link · Pilot license',   ctx: 'pilot',   glyph: '↗' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
      {items.map((it, i) => {
        const ctx = CTX_B[it.ctx];
        return (
          <div key={i} style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
            background: T_B.card, border: `0.5px solid ${T_B.border}`, borderRadius: 10, minWidth: 0,
          }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: tintB(ctx.color, 0.12), border: `0.5px solid ${tintB(ctx.color, 0.25)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: ctx.color, fontSize: 13, fontFamily: T_B.mono, flexShrink: 0 }}>{it.glyph}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.t}</div>
              <div style={{ fontSize: 11, color: T_B.mutedFg }}>{it.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Micro pulse (footer row) ──────────────────────────────────────────────────

function MicroPulse() {
  const micros = [
    { key: 'cook',  top: 'Try new pasta recipe', meta: '2 todos · 1 link',   pulse: [0.2,0.3,0.4,0.3,0.5,0.3,0.4] },
    { key: 'gym',   top: 'Leg day today',        meta: '4-day streak',       pulse: [0.6,0.8,0.4,0.7,0.9,0.8,0.7] },
    { key: 'music', top: 'Practice 20 min',      meta: '15 min avg / day',   pulse: [0.3,0.2,0.4,0.1,0.3,0.5,0.2] },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {micros.map(m => {
        const ctx = CTX_B[m.key];
        return (
          <div key={m.key} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 14px',
            background: T_B.card, border: `0.5px solid ${T_B.border}`, borderRadius: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <DotB color={ctx.color} size={7} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{ctx.name}</span>
                <span style={{ fontSize: 10, fontFamily: T_B.mono, color: T_B.mutedFg, marginLeft: 'auto' }}>μ · peek</span>
              </div>
              <div style={{ fontSize: 13, color: T_B.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>→ {m.top}</div>
              <div style={{ fontSize: 11, color: T_B.mutedFg, marginTop: 1 }}>{m.meta}</div>
            </div>
            {/* mini sparkline */}
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

// ── Page ──────────────────────────────────────────────────────────────────────

function MissionControlB() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_B.bg, color: T_B.fg, fontFamily: T_B.font, fontSize: 14, display: 'flex', flexDirection: 'column' }}>
      <TopbarB />
      <div style={{ padding: '32px 40px 40px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <BriefingHero />

        {/* Mantra — quiet, persistent intention for the day */}
        <section style={{ marginBottom: 22 }}>
          <MantraB />
        </section>

        {/* Pinned strip lives high — they're shortcuts, not afterthoughts */}
        <section style={{ marginBottom: 24 }}>
          <SectionLabelB right={<span style={{ fontSize: 11, color: T_B.mutedFg, fontFamily: T_B.mono }}>⌘P to focus</span>}>Pinned</SectionLabelB>
          <PinnedStripB />
        </section>

        {/* Two columns */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, marginBottom: 24 }}>
          <NowColumn />
          <WeekTimeline />
        </section>

        {/* Micro pulse */}
        <section>
          <SectionLabelB right={<span style={{ fontSize: 11, color: T_B.mutedFg, fontFamily: T_B.mono }}>3 micros · ticking along</span>}>Micro pulse</SectionLabelB>
          <MicroPulse />
        </section>
      </div>
    </div>
  );
}

window.MissionControlB = MissionControlB;
