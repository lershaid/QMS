import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Policies from './pages/Policies'
import Audits from './pages/Audits'
import CAPA from './pages/CAPA'
import Risks from './pages/Risks'
import { useAuthStore } from './store/authStore'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/audits" element={<Audits />} />
        <Route path="/capa" element={<CAPA />} />
        <Route path="/risks" element={<Risks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
