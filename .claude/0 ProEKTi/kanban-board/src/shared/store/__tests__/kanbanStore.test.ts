import { renderHook, act } from '@testing-library/react'
import { useKanbanStore } from '../kanbanStore'
import { TaskStatus } from '@/shared/types/task'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})


describe('KanbanStore', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorageMock.clear()
  })

  describe('Initial State', () => {
    it('should initialize with default tasks', () => {
      const { result } = renderHook(() => useKanbanStore())

      expect(result.current.tasks).toHaveLength(10) // Initial mock tasks (including bug task)
      expect(result.current.filters.search).toBe('')
      expect(result.current.filters.priorities).toEqual([])
      expect(result.current.filters.statuses).toEqual([])
    })

    it('should have correct initial filters', () => {
      const { result } = renderHook(() => useKanbanStore())

      expect(result.current.filters).toEqual({
        search: '',
        priorities: [],
        statuses: [],
        dateRange: {
          start: undefined,
          end: undefined,
          hasDueDate: undefined
        }
      })
    })
  })

  describe('CRUD Operations', () => {
    it('should add a new task', () => {
      const { result } = renderHook(() => useKanbanStore())
      const initialLength = result.current.tasks.length

      act(() => {
        result.current.addTask('todo', {
          title: 'New Task',
          description: 'New Description',
          status: 'todo',
          priority: 'high',
          startDate: '2025-01-15',
          dueDate: '2025-01-25',
          assignees: [{ id: 'user2', name: 'New User', color: '#EF4444' }],
          tags: [{ id: 'tag2', name: 'New Tag', color: '#F59E0B' }],
          progress: 0
        })
      })

      expect(result.current.tasks).toHaveLength(initialLength + 1)
      expect(result.current.tasks[initialLength].title).toBe('New Task')
      expect(result.current.tasks[initialLength].status).toBe('todo')
      expect(result.current.tasks[initialLength].priority).toBe('high')
    })

    it('should update an existing task', () => {
      const { result } = renderHook(() => useKanbanStore())
      const taskId = result.current.tasks[0].id

      act(() => {
        result.current.updateTask(taskId, {
          title: 'Updated Task',
          priority: 'urgent',
          progress: 75
        })
      })

      const updatedTask = result.current.getTaskById(taskId)
      expect(updatedTask?.title).toBe('Updated Task')
      expect(updatedTask?.priority).toBe('urgent')
      expect(updatedTask?.progress).toBe(75)
    })

    it('should delete a task', () => {
      const { result } = renderHook(() => useKanbanStore())
      const initialLength = result.current.tasks.length
      const taskId = result.current.tasks[0].id

      act(() => {
        result.current.deleteTask(taskId)
      })

      expect(result.current.tasks).toHaveLength(initialLength - 1)
      expect(result.current.getTaskById(taskId)).toBeUndefined()
    })
  })

  describe('Drag & Drop Operations', () => {
    it('should move task between columns with optimistic update', () => {
      const { result } = renderHook(() => useKanbanStore())
      const taskId = result.current.tasks[0].id // todo status
      const initialStatus = result.current.getTaskById(taskId)?.status

      expect(initialStatus).toBe('todo')

      act(() => {
        result.current.moveTask(taskId, 'in-progress')
      })

      const updatedTask = result.current.getTaskById(taskId)
      expect(updatedTask?.status).toBe('in-progress')
    })

    it('should handle moving to same status gracefully', () => {
      const { result } = renderHook(() => useKanbanStore())
      const taskId = result.current.tasks[0].id
      const currentStatus = result.current.getTaskById(taskId)?.status

      act(() => {
        result.current.moveTask(taskId, currentStatus as TaskStatus)
      })

      // Task should remain in the same status
      const task = result.current.getTaskById(taskId)
      expect(task?.status).toBe(currentStatus)
    })
  })

  describe('Utility Functions', () => {
    it('should get tasks by status', () => {
      const { result } = renderHook(() => useKanbanStore())

      const todoTasks = result.current.getTasksByStatus('todo')
      const doneTasks = result.current.getTasksByStatus('done')

      expect(todoTasks.length).toBeGreaterThan(0)
      expect(doneTasks.length).toBeGreaterThan(0)

      todoTasks.forEach(task => {
        expect(task.status).toBe('todo')
      })

      doneTasks.forEach(task => {
        expect(task.status).toBe('done')
      })
    })

    it('should get task by id', () => {
      const { result } = renderHook(() => useKanbanStore())
      const taskId = result.current.tasks[0].id

      const task = result.current.getTaskById(taskId)
      expect(task).toBeDefined()
      expect(task?.id).toBe(taskId)

      const nonExistentTask = result.current.getTaskById('non-existent-id')
      expect(nonExistentTask).toBeUndefined()
    })
  })

  describe('Filter Operations', () => {
    it('should set filters', () => {
      const { result } = renderHook(() => useKanbanStore())

      act(() => {
        result.current.setFilters({
          search: 'Bug',
          priorities: ['urgent'],
          statuses: ['todo'],
          dateRange: {
            start: '2025-01-15',
            end: '2025-01-20',
            hasDueDate: true
          }
        })
      })

      expect(result.current.filters.search).toBe('Bug')
      expect(result.current.filters.priorities).toEqual(['urgent'])
      expect(result.current.filters.statuses).toEqual(['todo'])
      expect(result.current.filters.dateRange.start).toBe('2025-01-15')
    })

    it('should clear filters', () => {
      const { result } = renderHook(() => useKanbanStore())

      act(() => {
        result.current.setFilters({
          search: 'Test',
          priorities: ['high'],
          statuses: ['in-progress'],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      expect(result.current.filters.search).toBe('Test')

      act(() => {
        result.current.clearFilters()
      })

      expect(result.current.filters.search).toBe('')
      expect(result.current.filters.priorities).toEqual([])
      expect(result.current.filters.statuses).toEqual([])
    })

    it('should filter tasks by search term', () => {
      const { result } = renderHook(() => useKanbanStore())

      act(() => {
        result.current.setFilters({
          search: 'Bug',
          priorities: [],
          statuses: [],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      const filteredTasks = result.current.getFilteredTasks()
      filteredTasks.forEach(task => {
        const titleMatches = task.title.toLowerCase().includes('bug'.toLowerCase())
        const descriptionMatches = task.description.toLowerCase().includes('bug'.toLowerCase())
        expect(titleMatches || descriptionMatches).toBe(true)
      })
    })

    it('should filter tasks by priority', () => {
      const { result } = renderHook(() => useKanbanStore())

      act(() => {
        result.current.setFilters({
          search: '',
          priorities: ['urgent'],
          statuses: [],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      const filteredTasks = result.current.getFilteredTasks()
      filteredTasks.forEach(task => {
        expect(task.priority).toBe('urgent')
      })
    })

    it('should filter tasks by status', () => {
      const { result } = renderHook(() => useKanbanStore())

      act(() => {
        result.current.setFilters({
          search: '',
          priorities: [],
          statuses: ['done'],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      const filteredTasks = result.current.getFilteredTasks()
      filteredTasks.forEach(task => {
        expect(task.status).toBe('done')
      })
    })

    it('should apply multiple filters simultaneously', () => {
      const { result } = renderHook(() => useKanbanStore())

      act(() => {
        result.current.setFilters({
          search: 'System',
          priorities: ['urgent'],
          statuses: ['todo'],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      const filteredTasks = result.current.getFilteredTasks()
      filteredTasks.forEach(task => {
        const titleMatches = task.title.toLowerCase().includes('system'.toLowerCase())
        const descriptionMatches = task.description.toLowerCase().includes('system'.toLowerCase())
        expect(titleMatches || descriptionMatches).toBe(true)
        expect(task.priority).toBe('urgent')
        expect(task.status).toBe('todo')
      })
    })
  })

  describe('Bug Fix #1 Verification: Edit Mode Persistence', () => {
    it('should preserve all task changes during update', () => {
      const { result } = renderHook(() => useKanbanStore())
      const taskId = result.current.tasks[0].id
      const originalTask = result.current.getTaskById(taskId)

      expect(originalTask).toBeDefined()

      // Simulate editing multiple fields
      act(() => {
        result.current.updateTask(taskId, {
          title: 'Updated Title',
          description: 'Updated Description',
          priority: 'urgent',
          progress: 80,
          dueDate: '2025-01-25'
        })
      })

      const updatedTask = result.current.getTaskById(taskId)
      expect(updatedTask?.title).toBe('Updated Title')
      expect(updatedTask?.description).toBe('Updated Description')
      expect(updatedTask?.priority).toBe('urgent')
      expect(updatedTask?.progress).toBe(80)
      expect(updatedTask?.dueDate).toBe('2025-01-25')
    })

    it('should not interfere with other tasks during update', () => {
      const { result } = renderHook(() => useKanbanStore())
      const initialTaskCount = result.current.tasks.length
      const taskToUpdate = result.current.tasks[0]
      const otherTask = result.current.tasks[1]

      act(() => {
        result.current.updateTask(taskToUpdate.id, {
          title: 'Only this task should change'
        })
      })

      expect(result.current.tasks).toHaveLength(initialTaskCount)

      const updatedTask = result.current.getTaskById(taskToUpdate.id)
      const unchangedTask = result.current.getTaskById(otherTask.id)

      expect(updatedTask?.title).toBe('Only this task should change')
      expect(unchangedTask?.title).toBe(otherTask.title) // Should remain unchanged
    })
  })

  describe('Bug Fix #2 Verification: Filter Functionality', () => {
    it('should filter tasks case-insensitively', () => {
      const { result } = renderHook(() => useKanbanStore())

      // First, verify we have the expected initial data
      const allTasks = result.current.tasks
      expect(allTasks.length).toBeGreaterThan(0)

      // Look for any task containing "bug" (case insensitive)
      const bugTask = allTasks.find(task =>
        task.title.toLowerCase().includes('bug') ||
        task.description.toLowerCase().includes('bug')
      )
      expect(bugTask).toBeDefined()

      act(() => {
        result.current.setFilters({
          search: 'BUG', // Uppercase
          priorities: [],
          statuses: [],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      const filteredTasks = result.current.getFilteredTasks()
      expect(filteredTasks.length).toBeGreaterThan(0)

      // Verify we found the specific task
      const foundBugTask = filteredTasks.find(task =>
        task.title.toLowerCase().includes('bug') ||
        task.description.toLowerCase().includes('bug')
      )
      expect(foundBugTask).toBeDefined()
    })

    it('should handle empty search results gracefully', () => {
      const { result } = renderHook(() => useKanbanStore())

      act(() => {
        result.current.setFilters({
          search: 'NonExistentTask',
          priorities: [],
          statuses: [],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      const filteredTasks = result.current.getFilteredTasks()
      expect(filteredTasks).toHaveLength(0)
    })

    it('should reset filters correctly', () => {
      const { result } = renderHook(() => useKanbanStore())

      // Apply multiple filters
      act(() => {
        result.current.setFilters({
          search: 'Test',
          priorities: ['urgent'],
          statuses: ['todo'],
          dateRange: {
            start: undefined,
            end: undefined,
            hasDueDate: undefined
          }
        })
      })

      expect(result.current.getFilteredTasks().length).toBeLessThan(result.current.tasks.length)

      // Clear filters
      act(() => {
        result.current.clearFilters()
      })

      // Should return all tasks
      expect(result.current.getFilteredTasks()).toHaveLength(result.current.tasks.length)
      expect(result.current.filters.search).toBe('')
      expect(result.current.filters.priorities).toEqual([])
      expect(result.current.filters.statuses).toEqual([])
    })
  })
})