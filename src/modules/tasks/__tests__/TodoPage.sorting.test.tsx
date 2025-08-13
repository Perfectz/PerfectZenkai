// src/modules/tasks/__tests__/TodoPage.sorting.test.tsx
import { render, screen } from '@/test/test-utils'
import TodoPage from '../pages/TodoPage'
import { useTasksStore } from '../store'

describe('TodoPage sorting and rendering', () => {
  beforeEach(() => {
    useTasksStore.setState({
      todos: [
        {
          id: '1', summary: 'A', done: false, priority: 'low', category: 'other', points: 3,
          createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z', subtasks: []
        },
        {
          id: '2', summary: 'B', done: false, priority: 'high', category: 'work', points: 8,
          createdAt: '2025-01-02T00:00:00.000Z', updatedAt: '2025-01-02T00:00:00.000Z', subtasks: []
        }
      ],
      templates: [],
      isLoading: false,
    } as any)
  })

  test('sorts by created date by default (newest first)', () => {
    render(<TodoPage />)
    const items = screen.getAllByText(/A|B/)
    expect(items[0]).toHaveTextContent('B')
  })
})


