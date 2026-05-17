export type ContextType = 'macro' | 'micro'
export type Priority = 'high' | 'medium' | 'low'
export type WidgetType = 'todos' | 'dates' | 'notes' | 'habits' | 'links' | 'people'
export type Frequency = 'daily' | 'weekly'

export interface Context {
  id: string
  userId: string
  name: string
  type: ContextType
  color: string
  icon: string
  order: number
  description?: string | null
  createdAt: string | null
}

export interface WidgetConfig {
  id: string
  contextId: string
  widgetType: WidgetType
  enabled: boolean
  settings?: Record<string, unknown> | null
}

export interface Todo {
  id: string
  contextId: string
  userId: string
  title: string
  priority: Priority
  dueDate?: string | null
  done: boolean
  pinned: boolean
  completedAt?: string | null
  createdAt: string | null
}

export interface DateEvent {
  id: string
  contextId: string
  userId: string
  title: string
  date: string
  note?: string | null
  pinned: boolean
}

export interface Note {
  id: string
  contextId: string
  userId: string
  content: string
  pinned: boolean
  updatedAt: string | null
}

export interface Habit {
  id: string
  contextId: string
  userId: string
  title: string
  frequency: Frequency
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
}

export interface Link {
  id: string
  contextId: string
  userId: string
  title: string
  url: string
}

export interface Person {
  id: string
  contextId: string
  userId: string
  name: string
  note?: string | null
}

// Mission Control types
export interface PinnedItem {
  id: string
  type: 'todo' | 'date' | 'note'
  title: string
  contextId: string
  contextName: string
  contextColor: string
}

export interface AttentionCard {
  context: Context
  urgentTodos: Todo[]
  upcomingDates: DateEvent[]
}
