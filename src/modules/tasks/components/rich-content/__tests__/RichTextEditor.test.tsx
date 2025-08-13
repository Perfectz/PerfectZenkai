// src/modules/tasks/components/rich-content/__tests__/RichTextEditor.test.tsx
import { render, screen } from '@/test/test-utils'
import { RichTextEditor } from '../RichTextEditor'

describe('RichTextEditor', () => {
  test('renders code block with syntax highlighting', () => {
    const value = '```js\nconsole.log(1)\n```'
    render(<RichTextEditor value={value} format="markdown" onChange={() => {}} />)
    expect(screen.getByText('console.log(1)')).toBeInTheDocument()
  })

  test('renders markdown links and lists (remark-gfm)', () => {
    const value = '- item\n\n[link](https://example.com)'
    render(<RichTextEditor value={value} format="markdown" onChange={() => {}} />)
    expect(screen.getByText('item')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /link/i })).toBeInTheDocument()
  })
})


