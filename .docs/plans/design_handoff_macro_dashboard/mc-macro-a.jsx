// Macro dashboard — Variation A — "Focused"
// Slim header, Priorities-as-hero, integrated mantra ribbon, asymmetric supporting grid.

const CTX_MAC = { name: 'Pilot license', color: '#e85a8a' };

const T_MAC = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintMac(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotMac({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeMac({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
    done: { bg: 'rgba(46,194,126,0.15)', fg: '#2ec27e', bd: 'rgba(46,194,126,0.2)',   label: 'Done' },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckMac({ color = T_MAC.border, size = 14, checked = false }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.5px solid ${color}`, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: checked ? color : 'transparent',
    }}>
      {checked && (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function SectionLabelMac({ children, right, mb = 12 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mb }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T_MAC.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

// Topbar with Pilot license active
function TopbarMac() {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: '#2ec27e' },
    { key: 'pilot',   label: 'Pilot license',   color: CTX_MAC.color, active: true },
    { key: 'friends', label: 'Friends',         color: '#d4883a' },
  ];
  return (
    <div style={{ height: 52, background: T_MAC.card, borderBottom: `0.5px solid ${T_MAC.border}`, display: 'flex', alignItems: 'center', paddingInline: 16, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: T_MAC.fg, padding: '4px 10px', marginRight: 6 }}>contekst</span>
      {tabs.map(tab => (
        <span key={tab.key} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          fontSize: 13, fontWeight: 500, color: T_MAC.fg,
          background: tab.active ? tintMac(tab.color, 0.25) : 'transparent',
        }}>
          <DotMac color={tab.color} size={7} />{tab.label}
        </span>
      ))}
      <div style={{ width: 1, height: 16, background: T_MAC.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_MAC.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: `0.5px solid ${T_MAC.border}`, fontSize: 13, color: T_MAC.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add context
        </span>
      </div>
    </div>
  );
}

// ── Header A — slimmer, with a context "pulse" bar ───────────────────────────

function HeaderMacA() {
  // 14-day activity sparkline (todos completed / habit ticks / events)
  const pulse = [0,1,0,2,1,0,1,3,1,0,1,2,1,2];
  const maxP = Math.max(...pulse);
  return (
    <div style={{
      background: tintMac(CTX_MAC.color, 0.10),
      borderBottom: `0.5px solid ${tintMac(CTX_MAC.color, 0.22)}`,
      padding: '18px 40px',
      flexShrink: 0,
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <DotMac color={CTX_MAC.color} size={10} />
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>{CTX_MAC.name}</h1>
          <span style={{ marginLeft: 6, fontSize: 11, color: CTX_MAC.color, fontFamily: T_MAC.mono, padding: '2px 8px', borderRadius: 5, background: tintMac(CTX_MAC.color, 0.12), border: `0.5px solid ${tintMac(CTX_MAC.color, 0.25)}` }}>MACRO</span>
        </div>
        <p style={{ fontSize: 13, color: CTX_MAC.color, margin: 0, paddingLeft: 20, opacity: 0.9 }}>
          3 open todos · Next event in 3 days · 14-day streak on Study 30 min
        </p>
      </div>
      {/* right side: activity pulse + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 10, fontFamily: T_MAC.mono, color: T_MAC.mutedFg, letterSpacing: 0.5, textTransform: 'uppercase' }}>14d activity</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 26 }}>
            {pulse.map((v, i) => (
              <span key={i} style={{ width: 4, height: `${(v / maxP) * 100 || 6}%`, minHeight: 3, borderRadius: 1.5, background: CTX_MAC.color, opacity: 0.35 + (v / maxP) * 0.6 }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: `0.5px solid ${tintMac(CTX_MAC.color, 0.35)}`, background: tintMac(CTX_MAC.color, 0.08), fontSize: 12, color: T_MAC.mutedFg, cursor: 'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2 2 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
          </button>
          <button style={{ padding: '5px 12px', borderRadius: 7, border: `0.5px solid ${tintMac(CTX_MAC.color, 0.35)}`, background: tintMac(CTX_MAC.color, 0.08), fontSize: 12, color: T_MAC.mutedFg, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Move to Micro
          </button>
          <button style={{ padding: '5px 10px', borderRadius: 7, border: `0.5px solid ${T_MAC.border}`, background: 'transparent', fontSize: 12, color: T_MAC.mutedFg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 12h18M3 6h18M3 18h18"/></svg> Layout
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mantra ribbon (above widgets) ────────────────────────────────────────────

function MantraRibbonMac() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '11px 18px',
      background: tintMac(CTX_MAC.color, 0.06),
      border: `0.5px solid ${tintMac(CTX_MAC.color, 0.2)}`,
      borderLeft: `2px solid ${tintMac(CTX_MAC.color, 0.55)}`,
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 10, fontFamily: T_MAC.mono, color: T_MAC.mutedFg, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>Mantra</span>
      <span style={{ width: 1, height: 14, background: tintMac(CTX_MAC.color, 0.2), flexShrink: 0 }} />
      <p style={{ margin: 0, flex: 1, fontSize: 14, lineHeight: 1.4, color: T_MAC.fg, fontStyle: 'italic' }}>
        Aviate, navigate, communicate — in that order.
      </p>
      <span style={{ fontSize: 10, fontFamily: T_MAC.mono, color: T_MAC.mutedFg, flexShrink: 0 }}>edit ⌘E</span>
    </div>
  );
}

// ── Quick add (universal capture) ─────────────────────────────────────────────

function QuickAddMac() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: T_MAC.card, border: `0.5px solid ${T_MAC.border}`, borderRadius: 10,
    }}>
      <span style={{ fontSize: 14, color: T_MAC.mutedFg }}>＋</span>
      <span style={{ flex: 1, fontSize: 13, color: T_MAC.mutedFg }}>
        Add to Pilot license — type a todo, paste a link, or write <span style={{ fontFamily: T_MAC.mono, color: T_MAC.fg }}>!high</span> <span style={{ fontFamily: T_MAC.mono, color: T_MAC.fg }}>tomorrow</span> <span style={{ fontFamily: T_MAC.mono, color: T_MAC.fg }}>#dates</span>
      </span>
      <span style={{ fontSize: 10, fontFamily: T_MAC.mono, color: T_MAC.mutedFg, padding: '2px 6px', border: `0.5px solid ${T_MAC.border}`, borderRadius: 4 }}>⌘K</span>
    </div>
  );
}

// ── Widgets ──────────────────────────────────────────────────────────────────

function WidgetShell({ icon, title, addLabel = 'Add', children, accent = CTX_MAC.color, hero = false, footer }) {
  return (
    <div style={{
      background: T_MAC.card, border: `0.5px solid ${T_MAC.border}`, borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '11px 16px', borderBottom: `0.5px solid ${T_MAC.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: accent, display: 'inline-flex' }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{ fontSize: 12, color: accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
          {addLabel}
        </span>
      </div>
      <div style={{ flex: 1, padding: hero ? '8px 0 4px' : '8px 0' }}>{children}</div>
      {footer && <div style={{ padding: '8px 16px', borderTop: `0.5px solid ${T_MAC.muted}`, fontSize: 11, color: T_MAC.mutedFg, fontFamily: T_MAC.mono }}>{footer}</div>}
    </div>
  );
}

function PrioritiesMacHero() {
  const lists = [
    { name: 'Ground school', count: 2, active: true },
    { name: 'Flight log',   count: 1, active: false },
    { name: 'Paperwork',    count: 0, active: false },
  ];
  const items = [
    { t: 'Book next ground school session', sub: 'Due this week · LBA portal', pri: 'high', done: false },
    { t: 'Study navigation chapter 4',     sub: 'Ongoing · 60% through',      pri: 'med',  done: false },
    { t: 'Medical exam form',              sub: 'Submitted 12 May',           pri: 'done', done: true },
  ];
  return (
    <WidgetShell
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
      title="Priorities" addLabel="Add todo" hero
      footer="3 active · 1 done this week"
    >
      {/* Tab bar */}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 4, borderBottom: `0.5px solid ${T_MAC.muted}`, marginBottom: 4 }}>
        {lists.map(l => (
          <span key={l.name} style={{
            padding: '4px 10px', borderRadius: 6,
            fontSize: 12, fontWeight: l.active ? 500 : 400,
            background: l.active ? tintMac(CTX_MAC.color, 0.16) : 'transparent',
            color: l.active ? CTX_MAC.color : T_MAC.mutedFg,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {l.name}
            {l.count > 0 && <span style={{ fontFamily: T_MAC.mono, fontSize: 10, opacity: 0.8 }}>{l.count}</span>}
          </span>
        ))}
        <span style={{ padding: '4px 8px', fontSize: 12, color: T_MAC.mutedFg, cursor: 'pointer' }}>+</span>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 16px', borderTop: i>0 ? `0.5px solid ${T_MAC.muted}` : 'none' }}>
          <div style={{ marginTop: 2 }}>
            <CheckMac color={CTX_MAC.color} size={15} checked={it.done} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, lineHeight: 1.3,
              color: it.done ? T_MAC.mutedFg : T_MAC.fg,
              textDecoration: it.done ? 'line-through' : 'none',
            }}>{it.t}</div>
            <div style={{ fontSize: 11, color: T_MAC.mutedFg, marginTop: 2 }}>{it.sub}</div>
          </div>
          <BadgeMac pri={it.pri} />
        </div>
      ))}
    </WidgetShell>
  );
}

function DatesMacRail() {
  const dates = [
    { d: '21', m: 'MAY', t: 'Flight sim session', sub: 'Aeroclub Bremen · 14:00', countdown: 'In 3 days' },
    { d: '03', m: 'JUN', t: 'Theory exam — Navigation', sub: 'LBA Braunschweig', countdown: 'In 16 days' },
    { d: '18', m: 'JUN', t: 'Class 1 medical renewal', sub: 'Dr. Klein · annual', countdown: 'In 1 month' },
  ];
  return (
    <WidgetShell
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
      title="Upcoming dates" addLabel="Add date"
      footer="3 events · next ATPL window opens Jul 4"
    >
      {dates.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: i>0 ? `0.5px solid ${T_MAC.muted}` : 'none' }}>
          <div style={{
            background: tintMac(CTX_MAC.color, 0.14), border: `0.5px solid ${tintMac(CTX_MAC.color, 0.3)}`,
            borderRadius: 6, padding: '3px 6px', textAlign: 'center', minWidth: 40,
          }}>
            <div style={{ fontSize: 8, fontWeight: 500, color: CTX_MAC.color, letterSpacing: 0.5 }}>{d.m}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: CTX_MAC.color, lineHeight: 1.1 }}>{d.d}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{d.t}</div>
            <div style={{ fontSize: 11, color: T_MAC.mutedFg, marginTop: 1 }}>{d.sub}</div>
          </div>
          <div style={{ fontSize: 11, color: CTX_MAC.color, fontFamily: T_MAC.mono }}>{d.countdown}</div>
        </div>
      ))}
    </WidgetShell>
  );
}

function HabitsMac() {
  const habits = [
    { name: 'Study 30 min',     freq: 'daily',   streak: 14, week: [1,1,1,0,1,1,1] },
    { name: 'Logbook entry',    freq: 'per flight', streak: 5, week: [0,1,0,0,1,0,0] },
    { name: 'Review checklists', freq: 'weekly',  streak: 3, week: [0,0,0,0,0,1,0] },
  ];
  return (
    <WidgetShell
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
      title="Habits" addLabel="Add habit"
    >
      {habits.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: i>0 ? `0.5px solid ${T_MAC.muted}` : 'none' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
            <div style={{ fontSize: 11, color: T_MAC.mutedFg, marginTop: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ textTransform: 'capitalize' }}>{h.freq}</span>
              <span>·</span>
              <span style={{ color: CTX_MAC.color, fontFamily: T_MAC.mono }}>{h.streak}d streak</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {h.week.map((v, j) => (
              <span key={j} style={{
                width: 14, height: 14, borderRadius: 3,
                background: v ? CTX_MAC.color : 'transparent',
                border: `0.5px solid ${v ? tintMac(CTX_MAC.color, 0.6) : T_MAC.border}`,
                opacity: v ? 0.85 : 1,
              }} />
            ))}
          </div>
        </div>
      ))}
    </WidgetShell>
  );
}

function NotesMac() {
  return (
    <WidgetShell
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>}
      title="Notes" addLabel="New note"
    >
      <div style={{ padding: '6px 16px 14px' }}>
        <div style={{ fontSize: 12, color: T_MAC.mutedFg, marginBottom: 6, fontFamily: T_MAC.mono }}>Ground school plan · edited 2h ago</div>
        <p style={{ margin: 0, fontSize: 13, color: T_MAC.fg, lineHeight: 1.55 }}>
          Ground school covers met, nav, comms, and principles of flight. Focus on nav first — it's weighted heaviest in the ATPL theory exam. Ask instructor about VFR vs IFR crossover next session. Also check if the aeroclub has a study group going.
        </p>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `0.5px dashed ${T_MAC.muted}` }}>
          <div style={{ fontSize: 12, color: T_MAC.mutedFg, marginBottom: 6, fontFamily: T_MAC.mono }}>Sim debrief · 14 May</div>
          <p style={{ margin: 0, fontSize: 13, color: T_MAC.mutedFg, lineHeight: 1.5 }}>
            Crosswind landing technique needs work. Tendency to over-correct on rollout. Marco suggested 3 short sessions before next checkride…
          </p>
        </div>
      </div>
    </WidgetShell>
  );
}

function LinksMac() {
  const links = [
    { t: 'Aeroclub Bremen — booking',  host: 'aeroclub-bremen.de' },
    { t: 'ATPL question bank',         host: 'aviationexam.com' },
    { t: 'Skybrary VFR procedures',    host: 'skybrary.aero' },
    { t: 'METAR/TAF Bremen',           host: 'aviationweather.gov' },
  ];
  return (
    <WidgetShell
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>}
      title="Links" addLabel="Add link"
    >
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderTop: i>0 ? `0.5px solid ${T_MAC.muted}` : 'none' }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: tintMac(CTX_MAC.color, 0.15), border: `0.5px solid ${tintMac(CTX_MAC.color, 0.3)}`, color: CTX_MAC.color, fontSize: 10, fontFamily: T_MAC.mono, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↗</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.t}</div>
            <div style={{ fontSize: 11, color: T_MAC.mutedFg, fontFamily: T_MAC.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.host}</div>
          </div>
        </div>
      ))}
    </WidgetShell>
  );
}

function PeopleMac() {
  const people = [
    { name: 'Marco Brandt',   role: 'Instructor',    initials: 'MB' },
    { name: 'Lena Hoffmann',  role: 'Study buddy',   initials: 'LH' },
    { name: 'Dr. Klein',      role: 'AME · medical', initials: 'DK' },
  ];
  return (
    <WidgetShell
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
      title="People" addLabel="Add person"
    >
      {people.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderTop: i>0 ? `0.5px solid ${T_MAC.muted}` : 'none' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: tintMac(CTX_MAC.color, 0.18), border: `0.5px solid ${tintMac(CTX_MAC.color, 0.3)}`, color: CTX_MAC.color, fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: T_MAC.mutedFg }}>{p.role}</div>
          </div>
        </div>
      ))}
    </WidgetShell>
  );
}

// ── Page A ────────────────────────────────────────────────────────────────────

function MacroDashboardA() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_MAC.bg, color: T_MAC.fg, fontFamily: T_MAC.font, fontSize: 14, display: 'flex', flexDirection: 'column' }}>
      <TopbarMac />
      <HeaderMacA />
      <div style={{ padding: '24px 40px 40px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Top utility row: mantra + quick add */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
          <MantraRibbonMac />
          <QuickAddMac />
        </div>

        {/* Asymmetric widget grid:
            row 1: Priorities (hero, 2/3) + Upcoming dates (1/3)
            row 2: Notes (2/3) + Habits (1/3)
            row 3: Links + People (split)
        */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'start' }}>
          <PrioritiesMacHero />
          <DatesMacRail />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'start' }}>
          <NotesMac />
          <HabitsMac />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          <LinksMac />
          <PeopleMac />
        </div>
      </div>
    </div>
  );
}

window.MacroDashboardA = MacroDashboardA;
