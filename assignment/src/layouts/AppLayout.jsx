import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function AppLayout() {
  const { logout, user } = useAuth()

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Rural Immersion</p>
          <h1 className="workspace-title">Destination Operations Console</h1>
        </div>

        <div className="workspace-actions">
          <nav aria-label="Primary" className="workspace-nav">
            <NavLink className="nav-link" to="/destinations">
              Destinations
            </NavLink>
          </nav>

          <div className="user-chip">
            <span>{user?.name ?? user?.email ?? 'Operations user'}</span>
            <button className="primary-button secondary" onClick={logout} type="button">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="workspace-content">
        <Outlet />
      </main>
    </div>
  )
}