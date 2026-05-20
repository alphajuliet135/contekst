'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripHorizontal, Maximize2, Minimize2 } from 'lucide-react'
import type { WidgetType, Todo, DateEvent, Note, Habit, HabitLog, Link, Person } from '@/lib/types'
import { TodosWidget } from './TodosWidget'
import { DatesWidget } from './DatesWidget'
import { NotesWidget } from './NotesWidget'
import { HabitsWidget } from './HabitsWidget'
import { LinksWidget } from './LinksWidget'
import { PeopleWidget } from './PeopleWidget'
import { MantraWidget } from './MantraWidget'
import { WidgetToggleBar } from './WidgetToggleBar'

// Types that default to full-width when no explicit size is saved
const FULL_WIDTH_DEFAULT: WidgetType[] = ['notes', 'mantra']

// ── Sortable item wrapper ─────────────────────────────────────────────────────

function SortableItem({
  id, isFullWidth, editMode, onToggleSize, children,
}: {
  id: string
  isFullWidth: boolean
  editMode: boolean
  onToggleSize: () => void
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        ...(isFullWidth ? { gridColumn: '1 / -1' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Centered top toolbar: drag grip + resize toggle, only visible in edit mode */}
      <div
        style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 2,
          opacity: editMode && hovered ? 1 : 0,
          pointerEvents: editMode ? 'auto' : 'none',
          transition: 'opacity 150ms ease',
        }}
      >
        <div
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          style={{
            cursor: 'grab', color: 'hsl(var(--muted-foreground))',
            display: 'flex', alignItems: 'center', padding: 2, borderRadius: 4,
            userSelect: 'none',
          }}
        >
          <GripHorizontal size={12} strokeWidth={1.5} />
        </div>
        <div
          onClick={e => { e.stopPropagation(); onToggleSize() }}
          style={{
            cursor: 'pointer', color: 'hsl(var(--muted-foreground))',
            display: 'flex', alignItems: 'center', padding: 2, borderRadius: 4,
          }}
        >
          {isFullWidth ? <Minimize2 size={12} strokeWidth={1.5} /> : <Maximize2 size={12} strokeWidth={1.5} />}
        </div>
      </div>

      {children}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  contextId: string
  contextColor: string
  orderedEnabledTypes: WidgetType[]
  initialEnabled: Record<WidgetType, boolean>
  widgetSettings: Partial<Record<WidgetType, Record<string, unknown>>>
  todos: Todo[]
  dates: DateEvent[]
  notes: Note[]
  habits: Habit[]
  todayLogs: HabitLog[]
  links: Link[]
  people: Person[]
  mantraText: string | null
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WidgetDashboard({
  contextId, contextColor,
  orderedEnabledTypes, initialEnabled,
  widgetSettings,
  todos, dates, notes, habits, todayLogs, links, people, mantraText,
}: Props) {
  const router = useRouter()
  const [order, setOrder] = useState<WidgetType[]>(orderedEnabledTypes)
  const [settingsState, setSettingsState] = useState(widgetSettings)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => { setOrder(orderedEnabledTypes) }, [orderedEnabledTypes])
  useEffect(() => { setSettingsState(widgetSettings) }, [widgetSettings])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function effectiveSize(type: WidgetType): 'half' | 'full' {
    const saved = settingsState[type]?.size as string | undefined
    if (saved === 'half' || saved === 'full') return saved
    return FULL_WIDTH_DEFAULT.includes(type) ? 'full' : 'half'
  }

  async function handleToggleSize(type: WidgetType) {
    const newSize = effectiveSize(type) === 'full' ? 'half' : 'full'
    setSettingsState(prev => ({
      ...prev,
      [type]: { ...(prev[type] ?? {}), size: newSize },
    }))
    await fetch('/api/widgets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, widgetType: type, settings: { size: newSize } }),
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = order.indexOf(active.id as WidgetType)
    const newIndex = order.indexOf(over.id as WidgetType)
    const newOrder = arrayMove(order, oldIndex, newIndex)
    setOrder(newOrder)

    await fetch('/api/widgets/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, order: newOrder }),
    })
    router.refresh()
  }

  function renderWidget(type: WidgetType) {
    if (type === 'todos')  return <TodosWidget  todos={todos}   color={contextColor} contextId={contextId} />
    if (type === 'dates')  return <DatesWidget  dates={dates}   color={contextColor} contextId={contextId} />
    if (type === 'notes')  return <NotesWidget  notes={notes}   color={contextColor} contextId={contextId} />
    if (type === 'habits') return <HabitsWidget habits={habits} logs={todayLogs} color={contextColor} contextId={contextId} />
    if (type === 'links')  return <LinksWidget  links={links}   color={contextColor} contextId={contextId} />
    if (type === 'people') return <PeopleWidget people={people} color={contextColor} />
    if (type === 'mantra') return <MantraWidget initialText={mantraText} contextId={contextId} color={contextColor} />
    return null
  }

  return (
    <>
      <div className="page-pad" style={{ flex: 1, paddingBottom: 24 }}>
        {/* Edit layout toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button
            onClick={() => setIsEditing(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 500,
              background: isEditing ? 'hsl(var(--foreground))' : 'hsl(var(--muted))',
              color: isEditing ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
            }}
          >
            {isEditing ? 'Done' : 'Edit layout'}
          </button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div className="widget-grid">
              {order.map(type => (
                <SortableItem
                  key={type}
                  id={type}
                  editMode={isEditing}
                  isFullWidth={effectiveSize(type) === 'full'}
                  onToggleSize={() => handleToggleSize(type)}
                >
                  {renderWidget(type)}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {isEditing && <WidgetToggleBar contextId={contextId} color={contextColor} initialEnabled={initialEnabled} />}
    </>
  )
}
