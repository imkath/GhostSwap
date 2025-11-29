import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from '../logo'

describe('Logo', () => {
  it('renders with default props', () => {
    render(<Logo />)
    expect(screen.getByText('GhostSwap')).toBeInTheDocument()
  })

  it('renders as a link by default', () => {
    render(<Logo />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders without link when linkToHome is false', () => {
    render(<Logo linkToHome={false} />)
    expect(screen.getByText('GhostSwap')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Logo size="sm" linkToHome={false} />)
    expect(screen.getByText('GhostSwap').parentElement).toHaveClass('text-lg')

    rerender(<Logo size="md" linkToHome={false} />)
    expect(screen.getByText('GhostSwap').parentElement).toHaveClass('text-xl')

    rerender(<Logo size="lg" linkToHome={false} />)
    expect(screen.getByText('GhostSwap').parentElement).toHaveClass('text-2xl')
  })

  it('has indigo color styling', () => {
    render(<Logo linkToHome={false} />)
    const logoContainer = screen.getByText('GhostSwap').closest('div')
    expect(logoContainer).toHaveClass('text-indigo-600')
  })
})
