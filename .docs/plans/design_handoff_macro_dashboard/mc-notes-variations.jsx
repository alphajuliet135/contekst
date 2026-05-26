// Notes widget — variations for displaying multiple notes within a single widget.
// Three layouts: Stack (refined current), Two-pane, Title list.

const CTX_N = { color: '#e85a8a' };

const T_N = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintN(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

const NOTES = [
  { id: '1', title: 'Ground school plan',          updated: '2h ago',  content: "Focus nav first — heaviest weight in the ATPL theory exam. Ask instructor about VFR vs IFR crossover next session. Also check if the aeroclub has a study group going.\n\nWeek-by-week:\n• W1–2: Air law + comms\n• W3–4: Met + nav (deep)\n• W5: Aircraft general + principles", pinned: true },
  { id: '2', title: 'Sim debrief — 14 May',        updated: '4 days ago', content: 'Crosswind landing technique needs work. Tendency to over-correct on rollout. Marco suggested 3 short sessions before next checkride — pattern work, sidestep into 09L.' },
  { id: '3', title: 'Cross-country prep',           updated: '1w ago',  content: 'Route Bremen → Wangerooge → Helgoland → back. Fuel: 2h45 block. Alternates: EDDH, ETMN. Check NOTAMs the morning of. Bring paper chart + portable VHF as backup.' },
  { id: '4', title: 'Radio comm phrasings',        updated: '1w ago',  content: '"Bremen Tower, D-EXYZ, ready for departure, runway 09, VFR Wangerooge"\n"D-XYZ, line up and wait, runway 09"\n"Roger, line up and wait, D-XYZ"' },
  { id: '5', title: 'Medical exam — questions',    updated: '2w ago',  content: 'Bring: passport, current medical, recent eye prescription. Ask Dr. Klein about Class 1 renewal cadence + colour vision retest timing.' },
  { id: '6', title: 'Aerodynamics ch. 3 summary',  updated: '2w ago',  content: 'High-angle stall behaviour differs from low-speed. Centre of pressure migrates. AoA matters more than airspeed. Practice recoveries in slow flight, full flaps.' },
  { id: '7', title: null,                           updated: '3w ago',  content: 'Untitled scratch — remember to check the avionics update before the next sim. Garmin 430 has a new version. Probably nothing but worth a glance.' },
  { id: '8', title: 'ATPL exam — study schedule',  updated: '4w ago',  content: '5 weeks to theory exam. 30 min/day study + Sunday 2h block. Weekend mocks every other week. Final week: drill weak topics only.' },
];

// ── Shared shell ──────────────────────────────────────────────────────────────

function NotesShell({ children, footer, headerExtra }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: T_N.card, border: `0.5px solid ${T_N.border}`, borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      color: T_N.fg, fontFamily: T_N.font, fontSize: 14,
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: `0.5px solid ${T_N.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ color: CTX_N.color, display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Notes</span>
        <span style={{ fontSize: 11, color: T_N.mutedFg, fontFamily: T_N.mono, marginLeft: 4 }}>{NOTES.length}</span>
        {headerExtra}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: CTX_N.color, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> New note
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>{children}</div>
      {footer && (
        <div style={{ padding: '8px 16px', borderTop: `0.5px solid ${T_N.muted}`, fontSize: 11, color: T_N.mutedFg, fontFamily: T_N.mono, flexShrink: 0 }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// ── Variant 1 — Stack (refined current pattern) ──────────────────────────────

function NotesStack() {
  return (
    <NotesShell footer="Click any note to expand · drag to reorder">
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {NOTES.map((n, i) => {
          const isPrimary = i === 0;
          const lines = n.content.split('\n');
          const preview = lines.slice(0, isPrimary ? 5 : 2).join('\n');
          const truncated = n.content !== preview;
          return (
            <div key={n.id} style={{
              padding: '14px 16px',
              borderTop: i>0 ? `0.5px solid ${T_N.muted}` : 'none',
              background: isPrimary ? tintN(CTX_N.color, 0.04) : 'transparent',
              borderLeft: isPrimary ? `2px solid ${tintN(CTX_N.color, 0.45)}` : '2px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                {n.title ? (
                  <span style={{ fontSize: 14, fontWeight: 600, color: T_N.fg, letterSpacing: -0.1 }}>{n.title}</span>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 600, color: T_N.mutedFg, fontStyle: 'italic' }}>Untitled</span>
                )}
                {n.pinned && (
                  <span style={{ fontSize: 9, fontFamily: T_N.mono, color: CTX_N.color, letterSpacing: 0.5, padding: '1px 5px', borderRadius: 3, background: tintN(CTX_N.color, 0.12), border: `0.5px solid ${tintN(CTX_N.color, 0.25)}` }}>PINNED</span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: T_N.mutedFg, fontFamily: T_N.mono }}>{n.updated}</span>
              </div>
              <p style={{
                margin: 0, fontSize: 13, lineHeight: 1.6,
                color: isPrimary ? T_N.fg : T_N.mutedFg,
                whiteSpace: 'pre-wrap',
              }}>{preview}{truncated && <span style={{ color: T_N.mutedFg }}>…</span>}</p>
              {truncated && (
                <button style={{ marginTop: 6, fontSize: 11, color: CTX_N.color, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: T_N.font }}>
                  Show more
                </button>
              )}
            </div>
          );
        })}
      </div>
    </NotesShell>
  );
}

// ── Variant 2 — Two-pane (titles left, content right) ────────────────────────

function NotesTwoPane() {
  const activeIdx = 0;
  return (
    <NotesShell footer="↑↓ to navigate · ⌘N for new">
      {/* Titles rail */}
      <div style={{
        width: 220, flexShrink: 0, borderRight: `0.5px solid ${T_N.border}`,
        overflowY: 'auto', background: 'rgba(255,255,255,0.015)',
      }}>
        {NOTES.map((n, i) => {
          const active = i === activeIdx;
          return (
            <div key={n.id} style={{
              padding: '10px 14px',
              borderTop: i>0 ? `0.5px solid ${T_N.muted}` : 'none',
              background: active ? tintN(CTX_N.color, 0.12) : 'transparent',
              borderLeft: active ? `2px solid ${CTX_N.color}` : '2px solid transparent',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                {n.pinned && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill={CTX_N.color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>
                )}
                <span style={{
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? T_N.fg : T_N.fg,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  fontStyle: !n.title ? 'italic' : 'normal',
                }}>{n.title || 'Untitled'}</span>
              </div>
              <div style={{
                fontSize: 11, color: T_N.mutedFg,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {n.content.split('\n')[0].slice(0, 50)}
              </div>
              <div style={{ fontSize: 10, color: T_N.mutedFg, fontFamily: T_N.mono, marginTop: 3 }}>
                {n.updated}
              </div>
            </div>
          );
        })}
      </div>
      {/* Content pane */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>{NOTES[activeIdx].title}</h3>
          <span style={{ fontSize: 10, fontFamily: T_N.mono, color: CTX_N.color, letterSpacing: 0.5, padding: '1px 6px', borderRadius: 3, background: tintN(CTX_N.color, 0.12), border: `0.5px solid ${tintN(CTX_N.color, 0.25)}` }}>PINNED</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T_N.mutedFg, fontFamily: T_N.mono }}>edited {NOTES[activeIdx].updated}</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T_N.fg, whiteSpace: 'pre-wrap' }}>
          {NOTES[activeIdx].content}
        </p>
      </div>
    </NotesShell>
  );
}

// ── Variant 3 — Title list with inline expand ────────────────────────────────

function NotesTitleList() {
  const expandedIdx = 0;
  return (
    <NotesShell
      footer="Click a title to expand · only one open at a time"
      headerExtra={
        <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 5, background: T_N.muted, fontSize: 11, color: T_N.mutedFg }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
          Search notes
        </span>
      }
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {NOTES.map((n, i) => {
          const expanded = i === expandedIdx;
          return (
            <div key={n.id} style={{
              borderTop: i>0 ? `0.5px solid ${T_N.muted}` : 'none',
              background: expanded ? 'rgba(255,255,255,0.015)' : 'transparent',
            }}>
              {/* Title row */}
              <div style={{
                padding: '11px 16px',
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              }}>
                <span style={{
                  width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  color: T_N.mutedFg, transition: 'transform 120ms ease',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </span>
                {n.pinned && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={CTX_N.color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>
                )}
                <span style={{
                  fontSize: 14, fontWeight: 500,
                  color: T_N.fg, flex: 1,
                  fontStyle: !n.title ? 'italic' : 'normal',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{n.title || 'Untitled'}</span>
                {!expanded && (
                  <span style={{
                    fontSize: 12, color: T_N.mutedFg, flex: 1.2, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {n.content.split('\n')[0]}
                  </span>
                )}
                <span style={{ fontSize: 11, color: T_N.mutedFg, fontFamily: T_N.mono, flexShrink: 0 }}>{n.updated}</span>
              </div>
              {/* Expanded body */}
              {expanded && (
                <div style={{ padding: '0 16px 14px 40px' }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: T_N.fg, whiteSpace: 'pre-wrap' }}>
                    {n.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </NotesShell>
  );
}

window.NotesStack = NotesStack;
window.NotesTwoPane = NotesTwoPane;
window.NotesTitleList = NotesTitleList;
