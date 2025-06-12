/* eslint-disable react-refresh/only-export-components */
import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Provider wrapper that includes all necessary providers
interface ProvidersProps {
  children: ReactNode
  initialEntries?: string[]
}

const AllProviders = ({ children, initialEntries = ['/'] }: ProvidersProps) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  )
}

// Custom render function that includes providers
const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialEntries?: string[]
  }
) => {
  const { initialEntries, ...renderOptions } = options || {}
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders initialEntries={initialEntries}>
      {children}
    </AllProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Legacy custom render for backward compatibility
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return render(ui, options)
}

export * from '@testing-library/react'
export { customRender as render, renderWithProviders } 