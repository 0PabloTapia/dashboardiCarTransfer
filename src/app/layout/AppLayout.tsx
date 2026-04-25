import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../ui/toast'
import { SideNavLink } from '../ui/components'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <ToastProvider>
      <div className="appShell">
        <aside className="sideNav" aria-label="Navegación">
          <div className="sideNav__brand">
            <div className="brandMark">iCarTransfer</div>
            <div className="brandSub">B2B · Mock</div>
          </div>
          <nav className="sideNav__links">
            <SideNavLink to="/">Dashboard</SideNavLink>
            <SideNavLink to="/contracts">Contratos</SideNavLink>
            <SideNavLink to="/new-transfer">Nueva transferencia</SideNavLink>
          </nav>
        </aside>

        <div className="main">
          <TopBar />
          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

