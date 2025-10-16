import { useQuery } from '@tanstack/react-query'
import { BarChart3, FileText, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
  // TODO: Replace with real API calls
  const stats = {
    totalPolicies: 45,
    activeAudits: 3,
    openCAPA: 12,
    highRisks: 8,
  }

  const recentActivity = [
    { id: 1, type: 'policy', title: 'Quality Policy updated', time: '2 hours ago' },
    { id: 2, type: 'audit', title: 'Internal Audit completed', time: '5 hours ago' },
    { id: 3, type: 'capa', title: 'CAPA-2024-001 closed', time: '1 day ago' },
    { id: 4, type: 'risk', title: 'New risk identified', time: '2 days ago' },
  ]

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalPolicies}</h3>
            <p>Total Policies</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.activeAudits}</h3>
            <p>Active Audits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <AlertTriangle size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.openCAPA}</h3>
            <p>Open CAPA</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.highRisks}</h3>
            <p>High Risks</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-content">
                  <p className="activity-title">{activity.title}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Upcoming Tasks</h3>
          <div className="tasks-list">
            <div className="task-item">
              <input type="checkbox" />
              <span>Review Safety Policy (Due: Tomorrow)</span>
            </div>
            <div className="task-item">
              <input type="checkbox" />
              <span>Complete Audit Checklist (Due: This Week)</span>
            </div>
            <div className="task-item">
              <input type="checkbox" />
              <span>Verify CAPA Effectiveness (Due: Next Week)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card full-width">
        <h3><BarChart3 size={20} /> Performance Metrics</h3>
        <div className="metrics-placeholder">
          <p>Charts and analytics will be displayed here</p>
          <p className="text-muted">Connect to Analytics Service for real-time data</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
