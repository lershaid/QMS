import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  AlertTriangle, 
  TrendingUp, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import './Layout.css'

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Policies', path: '/policies', icon: FileText },
  { name: 'Audits', path: '/audits', icon: ClipboardCheck },
  { name: 'CAPA', path: '/capa', icon: AlertTriangle },
  { name: 'Risks', path: '/risks', icon: TrendingUp },
]

function Layout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="logo">QMS Platform</h1>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h2 className="page-title">
              {navigation.find((item) => item.path === location.pathname)?.name || 'QMS Platform'}
            </h2>
            <div className="user-info">
              <span className="user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="user-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
