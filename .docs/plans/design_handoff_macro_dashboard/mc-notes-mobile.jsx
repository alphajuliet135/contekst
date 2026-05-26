// Notes widget — mobile/tablet responsive variants of the two-pane pattern.
// On phone: master/detail (title list → full-screen content with back).
// On tablet: keep two-pane but with a narrower rail.

const CTX_NM = { color: '#e85a8a' };

const T_NM = {
  bg:'#171717', fg:'#EDEDED', muted:'#262626', mutedFg:'#8F8F8F',
  border:'#333333', card:'#1F1F1F',
  font:"-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

function tintNM(hex, op) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${op})`;
}

const NOTES_M = [
  { id: '1', title: 'Ground school plan',          updated: '2h ago',  content: "Focus nav first — heaviest weight in the ATPL theory exam. Ask instructor about VFR vs IFR crossover next session. Also check if the aeroclub has a study group going.\n\nWeek-by-week:\n• W1–2: Air law + comms\n• W3–4: Met + nav (deep)\n• W5: Aircraft general + principles", pinned: true },
  { id: '2', title: 'Sim debrief — 14 May',        updated: '4 days ago', content: 'Crosswind landing technique needs work. Tendency to over-correct on rollout. Marco suggested 3 short sessions before next checkride — pattern work, sidestep into 09L.' },
  { id: '3', title: 'Cross-country prep',           updated: '1w ago',  content: 'Route Bremen → Wangerooge → Helgoland → back. Fuel: 2h45 block. Alternates: EDDH, ETMN.' },
  { id: '4', title: 'Radio comm phrasings',        updated: '1w ago',  content: 'Standard phraseology cheat sheet. Bremen Tower departures…' },
  { id: '5', title: 'Medical exam — questions',    updated: '2w ago',  content: 'Bring: passport, current medical, recent eye prescription. Ask Dr. Klein about Class 1 renewal cadence.' },
  { id: '6', title: 'Aerodynamics ch. 3 summary',  updated: '2w ago',  content: 'High-angle stall behaviour differs from low-speed. Centre of pressure migrates. AoA matters more than airspeed.' },
  { id: '7', title: null,                           updated: '3w ago',  content: 'Untitled scratch — remember to check the avionics update before the next sim.' },
  { id: '8', title: 'ATPL exam — study schedule',  updated: '4w ago',  content: '5 weeks to theory exam. 30 min/day study + Sunday 2h block.' },
];

// ── Shared widget shell ──────────────────────────────────────────────────────

function NotesShellM({ title, count, leftAction, rightAction, children }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: T_NM.card, border: `0.5px solid ${T_NM.border}`, borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      color: T_NM.fg, fontFamily: T_NM.font, fontSize: 14,
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: `0.5px solid ${T_NM.border}`,
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, minHeight: 44,
      }}>
        {leftAction}
        {!leftAction && (
          <>
            <span style={{ color: CTX_NM.color, display: 'inline-flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
            </span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
            {count !== undefined && <span style={{ fontSize: 11, color: T_NM.mutedFg, fontFamily: T_NM.mono }}>{count}</span>}
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {rightAction}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>{children}</div>
    </div>
  );
}

// ── iPhone — list state ──────────────────────────────────────────────────────

function NotesPhoneList() {
  return (
    <NotesShellM
      title="Notes" count={NOTES_M.length}
      rightAction={
        <>
          <button style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: 'none', color: T_NM.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 7, background: tintNM(CTX_NM.color, 0.12), border: `0.5px solid ${tintNM(CTX_NM.color, 0.25)}`, color: CTX_NM.color, fontSize: 12, fontWeight: 500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> New
          </button>
        </>
      }
    >
      <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
        {NOTES_M.map((n, i) => {
          const isFirst = i === 0;
          return (
            <div key={n.id} style={{
              padding: '13px 14px',
              borderTop: i>0 ? `0.5px solid ${T_NM.muted}` : 'none',
              background: isFirst ? tintNM(CTX_NM.color, 0.06) : 'transparent',
              borderLeft: isFirst ? `2px solid ${CTX_NM.color}` : '2px solid transparent',
              minHeight: 64, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                {n.pinned && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill={CTX_NM.color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>
                )}
                <span style={{
                  fontSize: 15, fontWeight: 500,
                  flex: 1, color: T_NM.fg,
                  fontStyle: !n.title ? 'italic' : 'normal',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{n.title || 'Untitled'}</span>
                <span style={{ fontSize: 11, color: T_NM.mutedFg, fontFamily: T_NM.mono, flexShrink: 0 }}>{n.updated}</span>
                <span style={{ color: T_NM.mutedFg, marginLeft: 2 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </span>
              </div>
              <div style={{
                fontSize: 13, color: T_NM.mutedFg, lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {n.content.split('\n')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </NotesShellM>
  );
}

// ── iPhone — detail state ────────────────────────────────────────────────────

function NotesPhoneDetail() {
  const n = NOTES_M[0];
  return (
    <NotesShellM
      leftAction={
        <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px 5px 4px', borderRadius: 7, background: 'transparent', border: 'none', color: CTX_NM.color, fontSize: 14, fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          Notes
        </button>
      }
      rightAction={
        <>
          <button style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: 'none', color: T_NM.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={CTX_NM.color} strokeWidth="1.75"><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>
          </button>
          <button style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: 'none', color: T_NM.mutedFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="6" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="18" r="1.3"/></svg>
          </button>
        </>
      }
    >
      <div style={{ flex: 1, overflowY: 'auto', width: '100%', padding: '18px 18px 24px' }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.2 }}>{n.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: T_NM.mutedFg, fontFamily: T_NM.mono }}>edited {n.updated}</span>
          <span style={{ fontSize: 9, fontFamily: T_NM.mono, color: CTX_NM.color, letterSpacing: 0.5, padding: '1px 6px', borderRadius: 3, background: tintNM(CTX_NM.color, 0.12), border: `0.5px solid ${tintNM(CTX_NM.color, 0.25)}` }}>PINNED</span>
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: T_NM.fg, whiteSpace: 'pre-wrap' }}>
          {n.content}
        </p>
      </div>
    </NotesShellM>
  );
}

// ── iPad — two-pane (narrower rail) ──────────────────────────────────────────

function NotesTabletTwoPane() {
  const activeIdx = 0;
  return (
    <NotesShellM
      title="Notes" count={NOTES_M.length}
      rightAction={
        <>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: T_NM.muted, fontSize: 12, color: T_NM.mutedFg }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
            Search
          </span>
          <span style={{ fontSize: 12, color: CTX_NM.color, display: 'flex', alignItems: 'center', gap: 3, marginLeft: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg> New
          </span>
        </>
      }
    >
      <div style={{
        width: 200, flexShrink: 0, borderRight: `0.5px solid ${T_NM.border}`,
        overflowY: 'auto', background: 'rgba(255,255,255,0.015)',
      }}>
        {NOTES_M.map((n, i) => {
          const active = i === activeIdx;
          return (
            <div key={n.id} style={{
              padding: '10px 12px',
              borderTop: i>0 ? `0.5px solid ${T_NM.muted}` : 'none',
              background: active ? tintNM(CTX_NM.color, 0.12) : 'transparent',
              borderLeft: active ? `2px solid ${CTX_NM.color}` : '2px solid transparent',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                {n.pinned && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill={CTX_NM.color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>
                )}
                <span style={{
                  fontSize: 13, fontWeight: active ? 600 : 500, color: T_NM.fg, flex: 1,
                  fontStyle: !n.title ? 'italic' : 'normal',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{n.title || 'Untitled'}</span>
              </div>
              <div style={{ fontSize: 11, color: T_NM.mutedFg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.content.split('\n')[0].slice(0, 40)}
              </div>
              <div style={{ fontSize: 10, color: T_NM.mutedFg, fontFamily: T_NM.mono, marginTop: 3 }}>{n.updated}</div>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>{NOTES_M[activeIdx].title}</h3>
          <span style={{ fontSize: 10, fontFamily: T_NM.mono, color: CTX_NM.color, letterSpacing: 0.5, padding: '1px 6px', borderRadius: 3, background: tintNM(CTX_NM.color, 0.12), border: `0.5px solid ${tintNM(CTX_NM.color, 0.25)}` }}>PINNED</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T_NM.mutedFg, fontFamily: T_NM.mono }}>edited {NOTES_M[activeIdx].updated}</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T_NM.fg, whiteSpace: 'pre-wrap' }}>
          {NOTES_M[activeIdx].content}
        </p>
      </div>
    </NotesShellM>
  );
}

window.NotesPhoneList = NotesPhoneList;
window.NotesPhoneDetail = NotesPhoneDetail;
window.NotesTabletTwoPane = NotesTabletTwoPane;
