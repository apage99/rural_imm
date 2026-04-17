import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../../App'
import { AuthProvider } from '../../auth/AuthContext.jsx'
import { ensureMockApi, invalidateMockSession } from '../../mocks/browserMockApi'

function renderApplication(initialEntry = '/login') {
  ensureMockApi()

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Login and destination workflow', () => {
  it('redirects unauthenticated users from protected routes to login', async () => {
    renderApplication('/destinations')

    expect(
      await screen.findByRole('heading', { name: /sign in to manage rural immersion destinations/i }),
    ).toBeInTheDocument()
  })

  it('shows client-side validation for invalid credentials input', async () => {
    const user = userEvent.setup()
    renderApplication()

    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/password/i), 'short')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it('logs in, opens destinations, creates a destination, and deletes it', async () => {
    const user = userEvent.setup()
    renderApplication()

    await user.type(screen.getByLabelText(/email/i), 'manager@ruralimmersion.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByRole('heading', { name: /manage rural immersion inventory/i }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^name$/i), 'Test Valley Stay')
    await user.type(screen.getByLabelText(/region/i), 'Maharashtra')
    await user.type(screen.getByLabelText(/host community/i), 'Sahyadri Village Council')
    await user.type(
      screen.getByLabelText(/description/i),
      'Hands-on farm immersion, river trail mapping, and guided village storytelling.',
    )
    await user.click(screen.getByRole('button', { name: /create destination/i }))

    expect(await screen.findByRole('heading', { name: 'Test Valley Stay' })).toBeInTheDocument()

    const destinationCard = screen.getByRole('heading', { name: 'Test Valley Stay' }).closest('article')
    const deleteButton = destinationCard.querySelector('button:last-child')

    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Test Valley Stay' })).not.toBeInTheDocument()
    })
  })

  it('redirects back to login after refresh token failure on a protected route', async () => {
    const user = userEvent.setup()
    renderApplication('/login')

    await user.type(screen.getByLabelText(/email/i), 'manager@ruralimmersion.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByRole('heading', { name: /manage rural immersion inventory/i }),
    ).toBeInTheDocument()

    invalidateMockSession({ refreshFails: true })

    await user.type(screen.getByLabelText(/search destinations/i), 'Araku')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    expect(
      await screen.findByRole('heading', { name: /sign in to manage rural immersion destinations/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/your session expired\. please log in again\./i)).toBeInTheDocument()
  })
})