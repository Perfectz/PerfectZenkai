import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import AppShell from '../app/AppShell'

describe('AppShell', () => {
  it('should render Perfect Zenkai title', () => {
    render(<AppShell />)
    expect(screen.getByText('Perfect Zenkai')).toBeInTheDocument()
  })

  it('should render welcome message', () => {
    render(<AppShell />)
    expect(screen.getByText('Welcome to Perfect Zenkai')).toBeInTheDocument()
  })
}) 