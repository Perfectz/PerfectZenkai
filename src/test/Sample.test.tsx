import { describe, it, expect } from 'vitest'
import { renderWithProviders } from './test-utils'

describe('Sample Test', () => {
  it('should render button with text using renderWithProviders', () => {
    const { getByText } = renderWithProviders(
      <button>Hi</button>
    )
    
    expect(getByText('Hi')).toBeInTheDocument()
  })

  it('should work with routing context', () => {
    const TestComponent = () => (
      <div>
        <button>Hi</button>
        <span>Routing works</span>
      </div>
    )

    const { getByText } = renderWithProviders(
      <TestComponent />,
      { initialEntries: ['/test'] }
    )
    
    expect(getByText('Hi')).toBeInTheDocument()
    expect(getByText('Routing works')).toBeInTheDocument()
  })
}) 