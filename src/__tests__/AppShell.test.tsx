import { describe, it, expect } from 'vitest'
import { renderWithProviders as render, screen } from '../test/test-utils'
import AppLayout from '../app/AppLayout'

describe('AppLayout', () => {
  it('should render Perfect Zenkai title', () => {
    render(<AppLayout />)
    expect(screen.getByText('Perfect Zenkai')).toBeInTheDocument()
  })

  it('should render layout', () => {
    render(<AppLayout />)
    expect(screen.getByText('Perfect Zenkai')).toBeInTheDocument()
  })
}) 