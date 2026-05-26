'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Habit, Link, Person } from '@/lib/types'
import { colorTint, colorBorder } from '@/lib/utils'
import { CountPill } from './CountPill'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

interface HabitWithStreak extends Habit { streak: number }

interface Props {
  habitsWithStreak: HabitWithStreak[]
  links: Link[]
  people: Person[]
  color: string
  contextId: string
  sectionEnabled: Record<string, boolean>
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function getHostname(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

export function ReferenceStrip({ habitsWithStreak, links, people, color, contextId, sectionEnabled }: Props) {
  const router = useRouter()

  // ── Habits ────────────────────────────────────────────────────────────────
  const [localHabits, setLocalHabits] = useState(habitsWithStreak)
  const [addingHabit, setAddingHabit] = useState(false)
  const [habitTitle, setHabitTitle]   = useState('')
  const [habitFreq, setHabitFreq]     = useState<'daily' | 'weekly'>('daily')
  const habitInputRef = useRef<HTMLInputElement>(null)

  // ── Links ─────────────────────────────────────────────────────────────────
  const [localLinks, setLocalLinks]   = useState(links)
  const [addingLink, setAddingLink]   = useState(false)
  const [linkTitle, setLinkTitle]     = useState('')
  const [linkUrl, setLinkUrl]         = useState('')
  const linkTitleRef = useRef<HTMLInputElement>(null)

  // ── People ────────────────────────────────────────────────────────────────
  const [localPeople, setLocalPeople]   = useState(people)
  const [addingPerson, setAddingPerson] = useState(false)
  const [personName, setPersonName]     = useState('')
  const [personNote, setPersonNote]     = useState('')
  const personNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setLocalHabits(habitsWithStreak) }, [habitsWithStreak])
  useEffect(() => { setLocalLinks(links) }, [links])
  useEffect(() => { setLocalPeople(people) }, [people])
  useEffect(() => { if (addingHabit) habitInputRef.current?.focus() }, [addingHabit])
  useEffect(() => { if (addingLink) linkTitleRef.current?.focus() }, [addingLink])
  useEffect(() => { if (addingPerson) personNameRef.current?.focus() }, [addingPerson])

  // ── Habit actions ──────────────────────────────────────────────────────────
  async function addHabit() {
    const title = habitTitle.trim()
    if (!title) return
    const tempId = `temp-${Date.now()}`
    setLocalHabits(prev => [...prev, { id: tempId, contextId, userId: '', title, frequency: habitFreq, streak: 0, createdAt: null }])
    setHabitTitle(''); setHabitFreq('daily'); setAddingHabit(false)
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, frequency: habitFreq }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalHabits(prev => prev.map(h => h.id === tempId ? { ...created, streak: 0 } : h))
    } else {
      setLocalHabits(prev => prev.filter(h => h.id !== tempId))
    }
    router.refresh()
  }

  async function deleteHabit(id: string) {
    setLocalHabits(prev => prev.filter(h => h.id !== id))
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  // ── Link actions ──────────────────────────────────────────────────────────
  async function addLink() {
    const title = linkTitle.trim()
    const url = linkUrl.trim()
    if (!title || !url) return
    const normalized = normalizeUrl(url)
    const tempId = `temp-${Date.now()}`
    setLocalLinks(prev => [...prev, { id: tempId, contextId, userId: '', title, url: normalized, createdAt: null }])
    setLinkTitle(''); setLinkUrl(''); setAddingLink(false)
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, url: normalized }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalLinks(prev => prev.map(l => l.id === tempId ? created : l))
    } else {
      setLocalLinks(prev => prev.filter(l => l.id !== tempId))
    }
    router.refresh()
  }

  async function deleteLink(id: string) {
    setLocalLinks(prev => prev.filter(l => l.id !== id))
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  // ── People actions ────────────────────────────────────────────────────────
  async function addPerson() {
    const name = personName.trim()
    if (!name) return
    const note = personNote.trim() || null
    const tempId = `temp-${Date.now()}`
    setLocalPeople(prev => [...prev, { id: tempId, contextId, userId: '', name, note, createdAt: null }])
    setPersonName(''); setPersonNote(''); setAddingPerson(false)
    const res = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, name, note }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalPeople(prev => prev.map(p => p.id === tempId ? created : p))
    } else {
      setLocalPeople(prev => prev.filter(p => p.id !== tempId))
    }
    router.refresh()
  }

  async function deletePerson(id: string) {
    setLocalPeople(prev => prev.filter(p => p.id !== id))
    await fetch(`/api/people/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: 'hsl(var(--card))',
    border: '0.5px solid hsl(var(--border))',
    borderRadius: 10, overflow: 'hidden',
  }

  const trashBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: 3,
    color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center',
    borderRadius: 4, flexShrink: 0, marginLeft: 'auto',
  }

  const TrashIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  )

  const inputStyle: React.CSSProperties = {
    background: 'none', border: 'none', outline: 'none',
    fontSize: 12, color: 'hsl(var(--foreground))', fontFamily: 'inherit',
  }

  const enabled = (type: string) => sectionEnabled[type] ?? (type !== 'mantra')

  return (
    <div className="macro-ref-strip">
      {/* Habits */}
      {enabled('habits') && (
        <div style={cardStyle}>
          <div style={{ padding: '9px 12px', borderBottom: '0.5px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color, display: 'inline-flex' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Habits</span>
            <CountPill count={localHabits.length} color={color} dim />
            <button
              onClick={() => setAddingHabit(v => !v)}
              style={{ marginLeft: 'auto', fontSize: 11, color, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >+</button>
          </div>
          {localHabits.slice(0, 2).map((h, i) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px',
              borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
            }}>
              <div style={{ width: 4, height: 14, borderRadius: 1, background: color, opacity: 0.7, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</div>
                <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>{h.streak}d streak</div>
              </div>
              <button onClick={() => deleteHabit(h.id)} style={trashBtn}><TrashIcon /></button>
            </div>
          ))}
          {addingHabit && (
            <div style={{ padding: '8px 12px', borderTop: '0.5px solid hsl(var(--muted))', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                ref={habitInputRef}
                value={habitTitle}
                onChange={e => setHabitTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addHabit(); if (e.key === 'Escape') { setAddingHabit(false); setHabitTitle('') } }}
                placeholder="Habit name…"
                style={{ ...inputStyle, width: '100%' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <select
                  value={habitFreq}
                  onChange={e => setHabitFreq(e.target.value as 'daily' | 'weekly')}
                  style={{ ...inputStyle, flex: 1, background: 'hsl(var(--muted))', borderRadius: 4, padding: '2px 6px' }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <button onClick={addHabit} style={{ padding: '2px 10px', borderRadius: 4, border: 'none', background: color, color: 'white', fontSize: 11, cursor: 'pointer' }}>Add</button>
                <button onClick={() => { setAddingHabit(false); setHabitTitle('') }} style={{ padding: '2px 8px', borderRadius: 4, border: '0.5px solid hsl(var(--border))', background: 'none', color: 'hsl(var(--muted-foreground))', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
          {localHabits.length === 0 && !addingHabit && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>No habits yet.</div>
          )}
          {localHabits.length > 2 && (
            <div style={{ padding: '7px 12px', borderTop: '0.5px solid hsl(var(--muted))', fontSize: 11, color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
              + {localHabits.length - 2} more
            </div>
          )}
        </div>
      )}

      {/* Links */}
      {enabled('links') && (
        <div style={cardStyle}>
          <div style={{ padding: '9px 12px', borderBottom: '0.5px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color, display: 'inline-flex' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
            </span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Links</span>
            <CountPill count={localLinks.length} color={color} dim />
            <button
              onClick={() => setAddingLink(v => !v)}
              style={{ marginLeft: 'auto', fontSize: 11, color, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >+</button>
          </div>
          {localLinks.slice(0, 2).map((l, i) => (
            <div key={l.id} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px',
              borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
            }}>
              <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                  background: colorTint(color, 0.15), border: `0.5px solid ${colorBorder(color, 0.3)}`,
                  color, fontSize: 9, fontFamily: MONO,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>↗</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getHostname(l.url)}
                  </div>
                </div>
              </a>
              <button onClick={() => deleteLink(l.id)} style={trashBtn}><TrashIcon /></button>
            </div>
          ))}
          {addingLink && (
            <div style={{ padding: '8px 12px', borderTop: '0.5px solid hsl(var(--muted))', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                ref={linkTitleRef}
                value={linkTitle}
                onChange={e => setLinkTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setAddingLink(false); setLinkTitle(''); setLinkUrl('') } }}
                placeholder="Title…"
                style={{ ...inputStyle, width: '100%' }}
              />
              <input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addLink(); if (e.key === 'Escape') { setAddingLink(false); setLinkTitle(''); setLinkUrl('') } }}
                placeholder="https://…"
                style={{ ...inputStyle, width: '100%', fontFamily: MONO, fontSize: 11 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={addLink} style={{ padding: '2px 10px', borderRadius: 4, border: 'none', background: color, color: 'white', fontSize: 11, cursor: 'pointer' }}>Add</button>
                <button onClick={() => { setAddingLink(false); setLinkTitle(''); setLinkUrl('') }} style={{ padding: '2px 8px', borderRadius: 4, border: '0.5px solid hsl(var(--border))', background: 'none', color: 'hsl(var(--muted-foreground))', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
          {localLinks.length === 0 && !addingLink && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>No links yet.</div>
          )}
          {localLinks.length > 2 && (
            <div style={{ padding: '7px 12px', borderTop: '0.5px solid hsl(var(--muted))', fontSize: 11, color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
              + {localLinks.length - 2} more
            </div>
          )}
        </div>
      )}

      {/* People */}
      {enabled('people') && (
        <div style={cardStyle}>
          <div style={{ padding: '9px 12px', borderBottom: '0.5px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color, display: 'inline-flex' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>People</span>
            <CountPill count={localPeople.length} color={color} dim />
            <button
              onClick={() => setAddingPerson(v => !v)}
              style={{ marginLeft: 'auto', fontSize: 11, color, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >+</button>
          </div>
          {localPeople.slice(0, 2).map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px',
              borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: colorTint(color, 0.18), border: `0.5px solid ${colorBorder(color, 0.3)}`,
                color, fontSize: 10, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {getInitials(p.name)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                {p.note && (
                  <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.note}
                  </div>
                )}
              </div>
              <button onClick={() => deletePerson(p.id)} style={trashBtn}><TrashIcon /></button>
            </div>
          ))}
          {addingPerson && (
            <div style={{ padding: '8px 12px', borderTop: '0.5px solid hsl(var(--muted))', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                ref={personNameRef}
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setAddingPerson(false); setPersonName(''); setPersonNote('') } }}
                placeholder="Name…"
                style={{ ...inputStyle, width: '100%' }}
              />
              <input
                value={personNote}
                onChange={e => setPersonNote(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addPerson(); if (e.key === 'Escape') { setAddingPerson(false); setPersonName(''); setPersonNote('') } }}
                placeholder="Role or note (optional)…"
                style={{ ...inputStyle, width: '100%', fontSize: 11 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={addPerson} style={{ padding: '2px 10px', borderRadius: 4, border: 'none', background: color, color: 'white', fontSize: 11, cursor: 'pointer' }}>Add</button>
                <button onClick={() => { setAddingPerson(false); setPersonName(''); setPersonNote('') }} style={{ padding: '2px 8px', borderRadius: 4, border: '0.5px solid hsl(var(--border))', background: 'none', color: 'hsl(var(--muted-foreground))', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
          {localPeople.length === 0 && !addingPerson && (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>No people yet.</div>
          )}
          {localPeople.length > 2 && (
            <div style={{ padding: '7px 12px', borderTop: '0.5px solid hsl(var(--muted))', fontSize: 11, color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
              + {localPeople.length - 2} more
            </div>
          )}
        </div>
      )}
    </div>
  )
}
