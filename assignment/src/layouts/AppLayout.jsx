import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import mitwpuLogo from '../assets/MIT-WPU_LOGO_White-02.png'
import immersionsLogo from '../assets/immersions-logo-white.png'

function formatUserLabel(user) {
  if (user?.name) {
    return user.name
  }

  if (user?.email) {
    const localPart = user.email.split('@')[0] ?? ''

    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ')
  }

  return 'Operations User'
}

export default function AppLayout() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const userLabel = formatUserLabel(user)
  const isDestinationsView = location.pathname === '/destinations'
  const [isViewDataOpen, setIsViewDataOpen] = useState(isDestinationsView)
  const [isImmersionsOpen, setIsImmersionsOpen] = useState(false)

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="sidebar-brand-block">
          <div className="sidebar-brand-mark">
            <img
              alt="MIT-WPU branding"
              className="sidebar-brand-image"
              src={mitwpuLogo}
            />
          </div>
          <div className="sidebar-user-block">
            <p className="sidebar-user-greeting">Hi {userLabel} !</p>
          </div>
        </div>

        <button className="sidebar-primary-action" type="button">
          <span aria-hidden="true">+</span>
          Create New Immersion
        </button>

        <nav aria-label="Primary" className="workspace-nav sidebar-nav">
          <button className="sidebar-nav-item" type="button">
            Dashboard
          </button>

          <div className={`sidebar-nav-group ${isViewDataOpen ? 'open' : ''}`}>
            <button
              aria-expanded={isViewDataOpen}
              className={`sidebar-nav-item sidebar-nav-toggle ${isDestinationsView ? 'active' : ''}`}
              onClick={() => setIsViewDataOpen((currentValue) => !currentValue)}
              type="button"
            >
              <span>View Data</span>
              <span aria-hidden="true" className="sidebar-chevron">
                {isViewDataOpen ? '▾' : '▸'}
              </span>
            </button>

            {isViewDataOpen ? (
              <div className="sidebar-submenu">
                <button className="sidebar-submenu-item" type="button">
                  Admin
                </button>
                <button className="sidebar-submenu-item" type="button">
                  Faculty
                </button>
                <button className="sidebar-submenu-item" type="button">
                  Student
                </button>
                <NavLink className="sidebar-submenu-item active" to="/destinations">
                  Destinations and Forms
                </NavLink>
                <button className="sidebar-submenu-item" type="button">
                  Others
                </button>
              </div>
            ) : null}
          </div>

          <div className={`sidebar-nav-group ${isImmersionsOpen ? 'open' : ''}`}>
            <button
              aria-expanded={isImmersionsOpen}
              className="sidebar-nav-item sidebar-nav-toggle"
              onClick={() => setIsImmersionsOpen((currentValue) => !currentValue)}
              type="button"
            >
              <span>View Immersions</span>
              <span aria-hidden="true" className="sidebar-chevron">
                {isImmersionsOpen ? '▾' : '▸'}
              </span>
            </button>

            {isImmersionsOpen ? (
              <div className="sidebar-submenu">
                <button className="sidebar-submenu-item" type="button">
                  Ongoing
                </button>
                <button className="sidebar-submenu-item" type="button">
                  Upcoming
                </button>
                <button className="sidebar-submenu-item" type="button">
                  Previous
                </button>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-button" onClick={logout} type="button">
            Log out
          </button>
        </div>
      </aside>

      <div className="workspace-main-shell">
        <header className="workspace-header gaia-header">
          <div className="workspace-header-main">
            <img
              alt="Immersions at WPU"
              className="gaia-mini-mark-image"
              src={immersionsLogo}
            />
            <h1 className="workspace-title">GAIA - Immersions@WPU</h1>
          </div>

          <div className="workspace-help-block">
            <span>Need help?</span>
            <a href="mailto:immersions.wpu@mitwpu.edu.in">immersions.wpu@mitwpu.edu.in</a>
          </div>
        </header>

        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}