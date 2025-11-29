import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../ui/input'

describe('Input', () => {
  it('renders with default type', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with different types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" placeholder="Password" />)
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" placeholder="Number" />)
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number')
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)

    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('can be disabled', async () => {
    const user = userEvent.setup()
    render(<Input disabled placeholder="Disabled" />)

    const input = screen.getByPlaceholderText('Disabled')
    expect(input).toBeDisabled()

    await user.type(input, 'test')
    expect(input).toHaveValue('')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />)
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-class')
  })

  it('renders with aria-invalid for error state', () => {
    render(<Input aria-invalid placeholder="Error" />)
    expect(screen.getByPlaceholderText('Error')).toHaveAttribute('aria-invalid', 'true')
  })

  it('has data-slot attribute', () => {
    render(<Input placeholder="Slot" />)
    expect(screen.getByPlaceholderText('Slot')).toHaveAttribute('data-slot', 'input')
  })
})
