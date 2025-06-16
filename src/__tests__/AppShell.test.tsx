import { describe, it, expect } from 'vitest'
import { renderWithProviders as render, screen } from '../test/test-utils'
import AppLayout from '../app/AppLayout'

describe('AppLayout', () => {
  it('should render user header', () => {
    render(<AppLayout />)
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('should render layout components', () => {
    render(<AppLayout />)
    expect(screen.getByText('Online')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})
