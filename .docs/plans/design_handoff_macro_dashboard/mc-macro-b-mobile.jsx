// Macro dashboard B — Context briefing — responsive renders for iPhone and iPad.
// Self-contained (Babel scripts don't share scope).

const CTX_MM = { name: 'Pilot license', color: '#e85a8a' };

const T_MM = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintMM(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

function DotMM({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function BadgeMM({ pri }) {
  const s = {
    high: { bg: 'rgba(212,136,58,0.18)', fg: '#d4883a', bd: 'rgba(212,136,58,0.25)', label: 'High' },
    med:  { bg: 'rgba(143,143,143,0.15)', fg: '#8F8F8F', bd: 'rgba(143,143,143,0.2)',  label: 'Med'  },
    low:  { bg: 'rgba(100,100,100,0.12)', fg: '#6B6B6B', bd: 'rgba(100,100,100,0.15)', label: 'Low'  },
    done: { bg: 'rgba(46,194,126,0.15)', fg: '#2ec27e', bd: 'rgba(46,194,126,0.2)',   label: 'Done' },
  }[pri];
  return <span style={{ borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.label}</span>;
}

function CheckMM({ color = T_MM.border, size = 14 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />;
}

function SectionLabelMM({ children, right, mb = 10 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mb }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: T_MM.mutedFg, letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{children}</p>
      {right}
    </div>
  );
}

// ── Phone topbar ──────────────────────────────────────────────────────────────

function TopbarPhoneMacro() {
  return (
    <div style={{ height: 48, background: T_MM.card, borderBottom: `0.5px solid ${T_MM.border}`, display: 'flex', alignItems: 'center', paddingInline: 14, gap: 8, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3 }}>contekst</span>
      <span style={{ width: 1, height: 16, background: T_MM.border, marginInline: 2 }} />
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6,
        background: tintMM(CTX_MM.color, 0.22), border: 'none', color: T_MM.fg, fontSize: 14, fontWeight: 500,
      }}>
        <DotMM color={CTX_MM.color} size={7} />
        {CTX_MM.name}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T_MM.mutedFg} strokeWidth="1.75"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <button style={{ width: 36, height: 36, borderRadius: 6, background: 'transparent', border: 'none', color: T_MM.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Tablet topbar (full tab strip) ────────────────────────────────────────────

function TopbarTabletMacro() {
  const tabs = [
    { key: 'mission', label: 'Mission control', color: '#4d9aff' },
    { key: 'work',    label: 'Work',            color: '#2ec27e' },
    { key: 'pilot',   label: 'Pilot license',   color: CTX_MM.color, active: true },
    { key: 'friends', label: 'Friends',         color: '#d4883a' },
  ];
  return (
    <div style={{ height: 50, background: T_MM.card, borderBottom: `0.5px solid ${T_MM.border}`, display: 'flex', alignItems: 'center', paddingInline: 14, gap: 2, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, padding: '4px 10px', marginRight: 4 }}>contekst</span>
      {tabs.map(tab => (
        <span key={tab.key} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 6,
          fontSize: 13, fontWeight: 500, color: T_MM.fg,
          background: tab.active ? tintMM(tab.color, 0.25) : 'transparent',
        }}>
          <DotMM color={tab.color} size={7} />{tab.label}
        </span>
      ))}
      <div style={{ width: 1, height: 16, background: T_MM.border, marginInline: 6 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: T_MM.mutedFg }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> Micro
      </span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 6, border: `0.5px solid ${T_MM.border}`, fontSize: 13, color: T_MM.mutedFg }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add
        </span>
      </div>
    </div>
  );
}

// ── Hero (size-aware) ─────────────────────────────────────────────────────────

function HeroMM({ size = 'phone' }) {
  const phone = size === 'phone';
  const stats = [
    { v: 3,    l: 'Open todos',  c: T_MM.fg },
    { v: 2,    l: 'Upcoming',    c: T_MM.fg },
    { v: 14,   l: 'Day streak',  c: CTX_MM.color },
    { v: '3d', l: 'Next event',  c: '#d4883a' },
  ];
  const cells = Array.from({ length: 28 });
  const filled = [0,1,0,1,1,1,0, 1,1,1,1,1,1,0, 1,1,1,0,1,1,1, 1,1,1,1,1,1,1];
  return (
    <div style={{
      padding: phone ? '22px 18px 18px' : '26px 28px 22px',
      background: tintMM(CTX_MM.color, 0.07),
      borderBottom: `0.5px solid ${tintMM(CTX_MM.color, 0.22)}`,
      display: phone ? 'flex' : 'grid',
      flexDirection: phone ? 'column' : undefined,
      gridTemplateColumns: phone ? undefined : '1.2fr 1fr',
      gap: phone ? 18 : 24,
      alignItems: phone ? 'stretch' : 'end',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <DotMM color={CTX_MM.color} size={8} />
          <span style={{ fontSize: 10, fontFamily: T_MM.mono, color: CTX_MM.color, letterSpacing: 1, textTransform: 'uppercase' }}>{CTX_MM.name} · Macro</span>
        </div>
        <h1 style={{ fontSize: phone ? 26 : 28, fontWeight: 600, letterSpacing: -0.5, margin: 0, lineHeight: 1.15 }}>{CTX_MM.name}</h1>
        <p style={{ fontSize: phone ? 14 : 14, color: T_MM.mutedFg, lineHeight: 1.5, margin: '8px 0 14px' }}>
          <span style={{ color: '#d4883a', fontWeight: 500 }}>1 high-priority todo</span> due this week,{' '}
          <span style={{ color: T_MM.fg, fontWeight: 500 }}>2 events</span> ahead, and a{' '}
          <span style={{ color: CTX_MM.color, fontWeight: 500 }}>14-day streak</span> on your top habit.
        </p>
        {/* Stats: 4-col on tablet, 2x2 on phone */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: phone ? '1fr 1fr' : 'repeat(4, auto)',
          gap: phone ? 10 : 22,
          alignItems: 'center',
          rowGap: phone ? 12 : undefined,
        }}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: phone ? 22 : 20, fontWeight: 600, color: s.c, letterSpacing: -0.4, lineHeight: 1, fontFamily: T_MM.mono }}>{s.v}</span>
                <span style={{ fontSize: 11, color: T_MM.mutedFg }}>{s.l}</span>
              </div>
              {!phone && i < 3 && <div style={{ width: 1, height: 18, background: tintMM(CTX_MM.color, 0.2) }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Activity heatmap */}
      <div>
        <SectionLabelMM right={<span style={{ fontSize: 10, color: T_MM.mutedFg, fontFamily: T_MM.mono }}>4w · todos + habits</span>}>Activity</SectionLabelMM>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 3 }}>
          {cells.map((_, i) => {
            const v = filled[i] ?? 0;
            const today = i === 27;
            return (
              <span key={i} style={{
                aspectRatio: '1',
                borderRadius: 2.5,
                background: v ? CTX_MM.color : T_MM.muted,
                opacity: v ? (today ? 1 : 0.55) : 1,
                border: today ? `0.5px solid ${CTX_MM.color}` : 'none',
              }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: T_MM.mutedFg, fontFamily: T_MM.mono }}>
          <span>4w ago</span><span>this week</span>
        </div>
        {!phone && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: `0.5px solid ${tintMM(CTX_MM.color, 0.35)}`, background: tintMM(CTX_MM.color, 0.08), fontSize: 12, color: T_MM.mutedFg }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2 2 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button style={{ padding: '5px 12px', borderRadius: 7, border: `0.5px solid ${tintMM(CTX_MM.color, 0.35)}`, background: tintMM(CTX_MM.color, 0.08), fontSize: 12, color: T_MM.mutedFg, whiteSpace: 'nowrap' }}>
              Move to Micro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mantra ────────────────────────────────────────────────────────────────────

function MantraMM({ size = 'phone' }) {
  const phone = size === 'phone';
  return (
    <div style={{
      display: 'flex', alignItems: phone ? 'flex-start' : 'center', gap: phone ? 12 : 18,
      padding: phone ? '12px 14px' : '14px 18px',
      background: T_MM.card,
      border: `0.5px solid ${T_MM.border}`,
      borderLeft: `2px solid ${tintMM(CTX_MM.color, 0.55)}`,
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 10, fontFamily: T_MM.mono, color: T_MM.mutedFg, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0, paddingTop: phone ? 3 : 0 }}>Mantra</span>
      {!phone && <span style={{ width: 1, height: 18, background: T_MM.border, flexShrink: 0 }} />}
      <p style={{ margin: 0, flex: 1, fontSize: phone ? 14 : 15, lineHeight: 1.45, color: T_MM.fg, fontStyle: 'italic', letterSpacing: -0.1 }}>
        Aviate, navigate, communicate — in that order.
      </p>
    </div>
  );
}

// ── Priorities ────────────────────────────────────────────────────────────────

function PrioritiesMM({ size = 'phone' }) {
  const phone = size === 'phone';
  const lists = [
    { name: 'Ground school', count: 2, active: true },
    { name: 'Flight log',   count: 1, active: false },
    { name: 'Paperwork',    count: 0, active: false },
  ];
  const items = [
    { t: 'Book next ground school session', sub: 'Due this week', pri: 'high' },
    { t: 'Study navigation chapter 4',     sub: 'Ongoing · 60% through', pri: 'med' },
    { t: 'Print medical form copies',      sub: 'For Wed sim', pri: 'med' },
  ];
  return (
    <div style={{
      background: T_MM.card, border: `0.5px solid ${T_MM.border}`, borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <div style={{ padding: phone ? '12px 14px 0' : '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ fontSize: phone ? 16 : 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Priorities</h2>
          <span style={{ fontSize: 11, color: T_MM.mutedFg }}>3 open · 1 high</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_MM.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add
        </span>
      </div>
      <div style={{ padding: phone ? '8px 14px 0' : '10px 16px 0', display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {lists.map(l => (
          <span key={l.name} style={{
            padding: '4px 9px', borderRadius: 6,
            fontSize: 12, fontWeight: l.active ? 500 : 400,
            background: l.active ? tintMM(CTX_MM.color, 0.16) : 'transparent',
            color: l.active ? CTX_MM.color : T_MM.mutedFg,
            display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {l.name}
            {l.count > 0 && <span style={{ fontFamily: T_MM.mono, fontSize: 10, opacity: 0.8 }}>{l.count}</span>}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 10, borderTop: `0.5px solid ${T_MM.muted}` }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: phone ? 10 : 12, padding: phone ? '12px 14px' : '11px 16px', borderTop: i>0 ? `0.5px solid ${T_MM.muted}` : 'none' }}>
            <div style={{ marginTop: 2 }}><CheckMM color={CTX_MM.color} size={phone ? 16 : 14} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: phone ? 15 : 14, lineHeight: 1.3 }}>{it.t}</div>
              <div style={{ fontSize: phone ? 12 : 11, color: T_MM.mutedFg, marginTop: 2 }}>{it.sub}</div>
            </div>
            <BadgeMM pri={it.pri} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ahead ────────────────────────────────────────────────────────────────────

function AheadMM({ size = 'phone', maxRows = 5 }) {
  const phone = size === 'phone';
  let rows = [
    { day: 'Wed 21 May', t: 'Flight sim session', sub: 'Aeroclub Bremen · 14:00', kind: 'date' },
    { day: 'Sat 24 May', t: 'Marco — checkride debrief', sub: 'Optional', kind: 'todo', pri: 'low' },
    { day: 'Tue  3 Jun', t: 'Theory exam — Navigation', sub: 'LBA Braunschweig', kind: 'date', highlight: true },
    { day: 'Sun 15 Jun', t: 'Submit logbook update', sub: 'Through May', kind: 'todo', pri: 'med' },
    { day: 'Tue 18 Jun', t: 'Class 1 medical renewal', sub: 'Dr. Klein', kind: 'date' },
  ];
  rows = rows.slice(0, maxRows);
  return (
    <div style={{
      background: T_MM.card, border: `0.5px solid ${T_MM.border}`, borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <div style={{ padding: phone ? '12px 14px' : '14px 16px', borderBottom: `0.5px solid ${T_MM.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ fontSize: phone ? 16 : 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Ahead</h2>
          {!phone && <span style={{ fontSize: 11, color: T_MM.mutedFg }}>Next 30 days</span>}
        </div>
        <span style={{ fontSize: 12, color: CTX_MM.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> Add
        </span>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: phone ? '88px 1fr' : '100px 1fr',
            padding: phone ? '11px 14px' : '11px 16px',
            borderTop: i>0 ? `0.5px solid ${T_MM.muted}` : 'none',
            background: r.highlight ? tintMM(CTX_MM.color, 0.05) : 'transparent',
          }}>
            <div style={{ fontSize: 12, color: r.highlight ? CTX_MM.color : T_MM.mutedFg, fontFamily: T_MM.mono, paddingTop: 2, fontWeight: r.highlight ? 500 : 400 }}>{r.day}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {r.kind === 'todo' ? (
                <CheckMM color={CTX_MM.color} size={13} />
              ) : (
                <span style={{ width: 13, height: 13, borderRadius: 3, background: tintMM(CTX_MM.color, 0.18), border: `0.5px solid ${tintMM(CTX_MM.color, 0.35)}`, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: phone ? 14 : 13, lineHeight: 1.3, fontWeight: r.highlight ? 500 : 400 }}>{r.t}</div>
                {r.sub && <div style={{ fontSize: phone ? 12 : 11, color: T_MM.mutedFg, marginTop: 1 }}>{r.sub}</div>}
              </div>
              {r.pri && <BadgeMM pri={r.pri} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Workspace cards (compact) ────────────────────────────────────────────────

function WSCardMM({ icon, title, addLabel = 'Add', children, style }) {
  return (
    <div style={{
      background: T_MM.card, border: `0.5px solid ${T_MM.border}`, borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', ...style,
    }}>
      <div style={{ padding: '11px 14px', borderBottom: `0.5px solid ${T_MM.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: CTX_MM.color, display: 'inline-flex' }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        </div>
        <span style={{ fontSize: 12, color: CTX_MM.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> {addLabel}
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function NotesMM() {
  return (
    <WSCardMM
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>}
      title="Notes" addLabel="New"
    >
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: T_MM.mutedFg, marginBottom: 5, fontFamily: T_MM.mono }}>Ground school plan</div>
        <p style={{ margin: 0, fontSize: 13, color: T_MM.fg, lineHeight: 1.5 }}>
          Focus nav first — heaviest weight in the ATPL theory exam. Ask instructor about VFR vs IFR crossover.
        </p>
      </div>
    </WSCardMM>
  );
}

function HabitsMM() {
  const habits = [
    { name: 'Study 30 min', freq: 'daily', streak: 14, week: [1,1,1,0,1,1,1] },
    { name: 'Logbook entry', freq: 'per flight', streak: 5, week: [0,1,0,0,1,0,0] },
  ];
  return (
    <WSCardMM
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
      title="Habits" addLabel="New"
    >
      {habits.map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i>0 ? `0.5px solid ${T_MM.muted}` : 'none' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
            <div style={{ fontSize: 11, color: T_MM.mutedFg, marginTop: 1, display: 'flex', gap: 8 }}>
              <span style={{ textTransform: 'capitalize' }}>{h.freq}</span><span>·</span>
              <span style={{ color: CTX_MM.color, fontFamily: T_MM.mono }}>{h.streak}d</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {h.week.map((v, j) => (
              <span key={j} style={{ width: 12, height: 12, borderRadius: 3,
                background: v ? CTX_MM.color : 'transparent',
                border: `0.5px solid ${v ? tintMM(CTX_MM.color, 0.6) : T_MM.border}`,
                opacity: v ? 0.85 : 1 }} />
            ))}
          </div>
        </div>
      ))}
    </WSCardMM>
  );
}

function LinksMM() {
  const links = [
    { t: 'Aeroclub Bremen booking',  host: 'aeroclub-bremen.de' },
    { t: 'ATPL question bank',       host: 'aviationexam.com' },
  ];
  return (
    <WSCardMM
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>}
      title="Links" addLabel="New"
    >
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: i>0 ? `0.5px solid ${T_MM.muted}` : 'none' }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: tintMM(CTX_MM.color, 0.15), border: `0.5px solid ${tintMM(CTX_MM.color, 0.3)}`, color: CTX_MM.color, fontSize: 10, fontFamily: T_MM.mono, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↗</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.t}</div>
            <div style={{ fontSize: 11, color: T_MM.mutedFg, fontFamily: T_MM.mono }}>{l.host}</div>
          </div>
        </div>
      ))}
    </WSCardMM>
  );
}

function PeopleMM() {
  const people = [
    { name: 'Marco Brandt', role: 'Instructor', initials: 'MB' },
    { name: 'Lena Hoffmann', role: 'Study buddy', initials: 'LH' },
  ];
  return (
    <WSCardMM
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
      title="People" addLabel="New"
    >
      {people.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i>0 ? `0.5px solid ${T_MM.muted}` : 'none' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: tintMM(CTX_MM.color, 0.18), border: `0.5px solid ${tintMM(CTX_MM.color, 0.3)}`, color: CTX_MM.color, fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: T_MM.mutedFg }}>{p.role}</div>
          </div>
        </div>
      ))}
    </WSCardMM>
  );
}

// ── iPhone page ───────────────────────────────────────────────────────────────

function MacroDashboardPhone() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_MM.bg, color: T_MM.fg, fontFamily: T_MM.font, fontSize: 15, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopbarPhoneMacro />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <HeroMM size="phone" />
        <div style={{ padding: '18px 14px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MantraMM size="phone" />
          <PrioritiesMM size="phone" />
          <AheadMM size="phone" maxRows={4} />
          <div>
            <SectionLabelMM mb={8}>Workspace</SectionLabelMM>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <NotesMM />
              <HabitsMM />
              <LinksMM />
              <PeopleMM />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── iPad page ────────────────────────────────────────────────────────────────

function MacroDashboardTablet() {
  return (
    <div style={{ width: '100%', height: '100%', background: T_MM.bg, color: T_MM.fg, fontFamily: T_MM.font, fontSize: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopbarTabletMacro />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <HeroMM size="tablet" />
        <div style={{ padding: '22px 28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <MantraMM size="tablet" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <PrioritiesMM size="tablet" />
            <AheadMM size="tablet" maxRows={5} />
          </div>
          <div>
            <SectionLabelMM right={<span style={{ fontSize: 11, color: T_MM.mutedFg, fontFamily: T_MM.mono }}>Edit layout</span>}>Workspace</SectionLabelMM>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 10, alignItems: 'start' }}>
              <NotesMM />
              <HabitsMM />
            </div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
              <LinksMM />
              <PeopleMM />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.MacroDashboardPhone = MacroDashboardPhone;
window.MacroDashboardTablet = MacroDashboardTablet;
