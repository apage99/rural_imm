import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

const emptyForm = {
  email: '',
  password: '',
}

function validateLogin(values) {
  const errors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return errors
}

export default function LoginPage() {
  const { clearError, error, isLoading, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})

  const destinationPath = location.state?.from?.pathname ?? '/destinations'

  const handleChange = (event) => {
    const { name, value } = event.target

    clearError()
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validateLogin(formValues)

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      return
    }

    try {
      await login({
        email: formValues.email.trim(),
        password: formValues.password,
      })
      setFormValues(emptyForm)
      navigate(destinationPath, { replace: true })
    } catch {
      return
    }
  }

  return (
    <main className="app-shell auth-screen">
      <section className="status-card auth-layout">
        <div>
          <p className="eyebrow">Secure Access</p>
          <h1>Sign in to manage rural immersion destinations.</h1>
          <p className="lede">
            Use the shared auth client to maintain your session, refresh expired tokens, and
            access the destinations workspace.
          </p>
          <div className="status-panel">
            <p>
              Demo credentials: <strong>manager@ruralimmersion.com</strong>
            </p>
            <p>
              Demo password: <strong>Password123!</strong>
            </p>
          </div>
        </div>

        <form className="login-form" noValidate onSubmit={handleSubmit}>
          <label className="field-group" htmlFor="email">
            <span>Email</span>
            <input
              autoComplete="username"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="manager@ruralimmersion.com"
              type="email"
              value={formValues.email}
            />
            {formErrors.email ? <span className="error-message">{formErrors.email}</span> : null}
          </label>

          <label className="field-group" htmlFor="password">
            <span>Password</span>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              type="password"
              value={formValues.password}
            />
            {formErrors.password ? (
              <span className="error-message">{formErrors.password}</span>
            ) : null}
          </label>

          {error ? <p className="error-message">{error}</p> : null}

          <button className="primary-button" disabled={isLoading} type="submit">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}