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
import type { WidgetType, WidgetInstance, Todo, TodoList, DateEvent, Note, Habit, HabitLog, Link, Person } from '@/lib/types'
import { TodosWidget } from './TodosWidget'
import { DatesWidget } from './DatesWidget'
import { NotesWidget } from './NotesWidget'
import { HabitsWidget } from './HabitsWidget'
import { LinksWidget } from './LinksWidget'
import { PeopleWidget } from './PeopleWidget'
import { MantraWidget } from './MantraWidget'
import { WidgetToggleBar } from './WidgetToggleBar'

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
          className="hide-on-mobile"
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
  orderedInstances: WidgetInstance[]
  initialEnabled: Record<WidgetType, boolean>
  widgetSettings: Partial<Record<WidgetType, Record<string, unknown>>>
  todos: Todo[]
  todoLists: TodoList[]
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
  orderedInstances, initialEnabled,
  widgetSettings,
  todos, todoLists, dates, notes, habits, todayLogs, links, people, mantraText,
}: Props) {
  const router = useRouter()
  const [instances, setInstances] = useState<WidgetInstance[]>(orderedInstances)
  // Per-instance size overrides keyed by widget config id
  const [sizeOverrides, setSizeOverrides] = useState<Record<string, 'half' | 'full'>>({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => { setInstances(orderedInstances) }, [orderedInstances])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function effectiveSize(instance: WidgetInstance): 'half' | 'full' {
    if (sizeOverrides[instance.id]) return sizeOverrides[instance.id]
    const saved = instance.settings?.size as string | undefined
    if (saved === 'half' || saved === 'full') return saved
    return FULL_WIDTH_DEFAULT.includes(instance.type) ? 'full' : 'half'
  }

  async function handleToggleSize(instance: WidgetInstance) {
    const newSize = effectiveSize(instance) === 'full' ? 'half' : 'full'
    setSizeOverrides(prev => ({ ...prev, [instance.id]: newSize }))
    await fetch('/api/widgets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgetId: instance.id, settings: { size: newSize } }),
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = instances.map(i => i.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    const newInstances = arrayMove(instances, oldIndex, newIndex)
    setInstances(newInstances)

    await fetch('/api/widgets/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, order: newInstances.map(i => i.id) }),
    })
    router.refresh()
  }

  async function handleAddTodosList(listName: string) {
    const res = await fetch('/api/widgets/todos-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, listName }),
    })
    const { widgetId, listId } = await res.json()
    setInstances(prev => [...prev, {
      id: widgetId,
      type: 'todos',
      settings: { listId },
      label: listName,
    }])
    router.refresh()
  }

  async function handleRemoveTodosWidget(widgetId: string) {
    setInstances(prev => prev.filter(i => i.id !== widgetId))
    await fetch(`/api/widgets/${widgetId}`, { method: 'DELETE' })
    router.refresh()
  }

  function renderWidget(instance: WidgetInstance) {
    const { type, settings } = instance
    const listId = settings?.listId as string | undefined
    if (type === 'todos')  return <TodosWidget todos={todos} todoLists={todoLists} color={contextColor} contextId={contextId} listId={listId} />
    if (type === 'dates')  return <DatesWidget  dates={dates}   color={contextColor} contextId={contextId} />
    if (type === 'notes')  return <NotesWidget  notes={notes}   color={contextColor} contextId={contextId} />
    if (type === 'habits') return <HabitsWidget habits={habits} logs={todayLogs} color={contextColor} contextId={contextId} />
    if (type === 'links')  return <LinksWidget  links={links}   color={contextColor} contextId={contextId} />
    if (type === 'people') return <PeopleWidget people={people} color={contextColor} />
    if (type === 'mantra') return <MantraWidget initialText={mantraText} contextId={contextId} color={contextColor} />
    return null
  }

  const todosInstances = instances.filter(i => i.type === 'todos')

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
          <SortableContext items={instances.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="widget-grid">
              {instances.map(instance => (
                <SortableItem
                  key={instance.id}
                  id={instance.id}
                  editMode={isEditing}
                  isFullWidth={effectiveSize(instance) === 'full'}
                  onToggleSize={() => handleToggleSize(instance)}
                >
                  {renderWidget(instance)}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {isEditing && (
        <WidgetToggleBar
          contextId={contextId}
          color={contextColor}
          initialEnabled={initialEnabled}
          todosInstances={todosInstances}
          onAddTodosList={handleAddTodosList}
          onRemoveTodosWidget={handleRemoveTodosWidget}
          widgetSettings={widgetSettings}
        />
      )}
    </>
  )
}
