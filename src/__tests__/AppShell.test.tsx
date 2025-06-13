import { describe, it, expect } from 'vitest'
import { renderWithProviders as render, screen } from '../test/test-utils'
import AppLayout from '../app/AppLayout'

describe('AppLayout', () => {
  it('should render user header', () => {
    render(<AppLayout />)
    expect(screen.getByText('Cyber Warrior')).toBeInTheDocument()
  })

  it('should render layout components', () => {
    render(<AppLayout />)
    expect(screen.getByText('Training Mode')).toBeInTheDocument()
    expect(screen.getByText('Exit')).toBeInTheDocument()
  })
})
